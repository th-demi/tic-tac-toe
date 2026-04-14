package match

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"tic-tac-toe-nakama/modules/core"

	"github.com/heroiclabs/nakama-common/runtime"
)

type Match struct{}

func NewMatch(
	ctx context.Context,
	logger runtime.Logger,
	db *sql.DB,
	nk runtime.NakamaModule,
) (runtime.Match, error) {
	return &Match{}, nil
}

func (m *Match) MatchInit(
	ctx context.Context,
	logger runtime.Logger,
	db *sql.DB,
	nk runtime.NakamaModule,
	params map[string]interface{},
) (interface{}, int, string) {

	logger.Error(">>>>>> MatchInit called!")
	logger.Error(">>>>>> Context: %v", ctx)

	state := NewState()

	if matchID, ok := ctx.Value(runtime.RUNTIME_CTX_MATCH_ID).(string); ok {
		state.MatchID = matchID
	}

	// Don't start timer until both players have joined
	state.Deadline = time.Now().Add(24 * time.Hour) // Far future
	state.Timer = 0

	logger.Error("#### MatchInit returning state with players=%d", len(state.Players))

	return state, 1, core.MatchLabel
}

func (m *Match) MatchJoinAttempt(
	ctx context.Context,
	logger runtime.Logger,
	db *sql.DB,
	nk runtime.NakamaModule,
	dispatcher runtime.MatchDispatcher,
	tick int64,
	state interface{},
	presence runtime.Presence,
	metadata map[string]string,
) (interface{}, bool, string) {

	s := state.(*State)

	if len(s.Players) >= 2 {
		return s, false, core.ErrMatchFull.Error()
	}

	return s, true, ""
}

func (m *Match) MatchJoin(
	ctx context.Context,
	logger runtime.Logger,
	db *sql.DB,
	nk runtime.NakamaModule,
	dispatcher runtime.MatchDispatcher,
	tick int64,
	state interface{},
	presences []runtime.Presence,
) interface{} {

	logger.Error("#### MatchJoin called with %d presences", len(presences))

	s := state.(*State)

	for _, presence := range presences {
		// Assign X to first player, O to second player
		symbol := core.PlayerX
		if len(s.Players) >= 1 {
			symbol = core.PlayerO
		}

		logger.Error("#### Adding player user_id=%s username=%s symbol=%s", presence.GetUserId(), presence.GetUsername(), symbol)

		s.Players[presence.GetUserId()] = &Player{
			UserID:   presence.GetUserId(),
			Username: presence.GetUsername(),
			Symbol:   symbol,
			Presence: presence,
		}
	}

	logger.Error("#### MatchJoin: total players now=%d, board=%v", len(s.Players), s.Board)

	// Only start timer when both players have joined
	if len(s.Players) == 2 {
		ResetDeadline(s)
		logger.Error("#### Both players joined, starting timer")
	}

	clientState := BuildClientState(s)

	data, _ := json.Marshal(clientState)

	logger.Error("#### MatchJoin: broadcasting state=%v", clientState)

	_ = dispatcher.BroadcastMessage(
		core.OpCodeMove,
		data,
		nil,
		nil,
		true,
	)

	return s
}

func (m *Match) MatchLeave(
	ctx context.Context,
	logger runtime.Logger,
	db *sql.DB,
	nk runtime.NakamaModule,
	dispatcher runtime.MatchDispatcher,
	tick int64,
	state interface{},
	presences []runtime.Presence,
) interface{} {

	s := state.(*State)

	for _, presence := range presences {
		delete(s.Players, presence.GetUserId())
		logger.Error("#### Player left: %s", presence.GetUserId())
	}

	if len(s.Players) == 0 {
		s.Completed = true
		s.Winner = "ABANDONED"
	} else {
		// Notify remaining player that opponent left
		s.Winner = "ABANDONED"
		s.Completed = true
	}

	// Broadcast the updated state
	clientState := BuildClientState(s)
	data, _ := json.Marshal(clientState)
	_ = dispatcher.BroadcastMessage(
		core.OpCodeMove,
		data,
		nil,
		nil,
		true,
	)

	return s
}

func (m *Match) MatchLoop(
	ctx context.Context,
	logger runtime.Logger,
	db *sql.DB,
	nk runtime.NakamaModule,
	dispatcher runtime.MatchDispatcher,
	tick int64,
	state interface{},
	messages []runtime.MatchData,
) interface{} {

	logger.Info("### MatchLoop START tick=%d, messages=%d", tick, len(messages))

	s := state.(*State)

	logger.Info("### State: players=%d, board=%v", len(s.Players), s.Board)

	if s.Completed {
		logger.Info("### Match completed")
		if !s.Persisted {
			PersistMatchResult(ctx, logger, nk, s)
			s.Persisted = true
		}
		return nil
	}

	if HasTimedOut(s) {
		logger.Info("### Match timed out")
		ApplyTimeout(s)

		if !s.Persisted {
			PersistMatchResult(ctx, logger, nk, s)
			s.Persisted = true
		}
	}

	if len(messages) > 0 {
		logger.Info("### Processing %d messages", len(messages))
	}

	for _, msg := range messages {
		if msg.GetOpCode() != core.OpCodeMove {
			logger.Info("### Skipping non-move op_code=%d", msg.GetOpCode())
			continue
		}

		logger.Info("### Processing move from user=%s, data=%s", msg.GetUserId(), string(msg.GetData()))

		var payload struct {
			Index int `json:"index"`
		}

		if err := json.Unmarshal(msg.GetData(), &payload); err != nil {
			logger.Error("### Failed to unmarshal: %v", err)
			continue
		}

		err := ApplyMove(
			s,
			msg.GetUserId(),
			payload.Index,
		)

		if err != nil {
			core.LogMoveRejected(logger, err.Error())
			logger.Error("### Move rejected: %v", err)
			continue
		}

		logger.Info("### Move applied, board now=%v, turn=%s", s.Board, s.Turn)
		ResetDeadline(s)
	}

	// Only update timer if both players have joined
	var timer int
	if len(s.Players) >= 2 && !s.Completed {
		remaining := int(time.Until(s.Deadline).Seconds())
		if remaining < 0 {
			remaining = 0
		}
		timer = remaining
		s.Timer = timer
	} else {
		timer = 0
		s.Timer = 0
	}

	clientState := BuildClientState(s)
	clientState.Timer = timer

	logger.Info("### Broadcasting state: %+v", clientState)

	data, _ := json.Marshal(clientState)

	_ = dispatcher.BroadcastMessage(
		core.OpCodeMove,
		data,
		nil,
		nil,
		true,
	)

	logger.Info("### MatchLoop END")

	return s
}

func (m *Match) MatchTerminate(
	ctx context.Context,
	logger runtime.Logger,
	db *sql.DB,
	nk runtime.NakamaModule,
	dispatcher runtime.MatchDispatcher,
	tick int64,
	state interface{},
	graceSeconds int,
) interface{} {

	return state
}

func (m *Match) MatchSignal(
	ctx context.Context,
	logger runtime.Logger,
	db *sql.DB,
	nk runtime.NakamaModule,
	dispatcher runtime.MatchDispatcher,
	tick int64,
	state interface{},
	data string,
) (interface{}, string) {

	return state, ""
}
