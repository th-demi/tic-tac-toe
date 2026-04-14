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

	state := NewState()

	ResetDeadline(state)

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

	s := state.(*State)

	for _, presence := range presences {
		symbol := core.PlayerX

		if len(s.Players) == 1 {
			symbol = core.PlayerO
		}

		s.Players[presence.GetUserId()] = &Player{
			UserID:   presence.GetUserId(),
			Username: presence.GetUsername(),
			Symbol:   symbol,
			Presence: presence,
		}
	}

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
	}

	if len(s.Players) == 0 {
		s.Completed = true
	}

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

	s := state.(*State)

	if s.Completed {
		if !s.Persisted {
			PersistMatchResult(ctx, logger, nk, s)
			s.Persisted = true
		}
		return nil
	}

	if HasTimedOut(s) {
		ApplyTimeout(s)

		if !s.Persisted {
			PersistMatchResult(ctx, logger, nk, s)
			s.Persisted = true
		}
	}

	for _, msg := range messages {
		if msg.GetOpCode() != core.OpCodeMove {
			continue
		}

		var payload struct {
			Index int `json:"index"`
		}

		if err := json.Unmarshal(msg.GetData(), &payload); err != nil {
			continue
		}

		err := ApplyMove(
			s,
			msg.GetUserId(),
			payload.Index,
		)

		if err != nil {
			core.LogMoveRejected(logger, err.Error())
			continue
		}

		ResetDeadline(s)
	}

	remaining := int(time.Until(s.Deadline).Seconds())
	if remaining < 0 {
		remaining = 0
	}

	s.Timer = remaining

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
