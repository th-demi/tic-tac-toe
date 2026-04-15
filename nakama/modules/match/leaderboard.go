package match

import (
	"context"
	"encoding/json"

	"tic-tac-toe-nakama/modules/core"

	"github.com/heroiclabs/nakama-common/runtime"
)

type PlayerStats struct {
	Wins   int `json:"wins"`
	Losses int `json:"losses"`
	Streak int `json:"streak"`
}

func PersistMatchResult(
	ctx context.Context,
	logger runtime.Logger,
	nk runtime.NakamaModule,
	state *State,
) {

	logger.Info(">>> PersistMatchResult called, Winner=%q, Players=%d", state.Winner, len(state.Players))

	if state.Winner == "" {
		logger.Info("PersistMatchResult: no winner, exiting")
		return
	}

	for _, player := range state.Players {
		logger.Info("Processing player=%s username=%s symbol=%s", player.UserID, player.Username, player.Symbol)

		result := ResolvePlayerResult(
			player.Symbol,
			state.Winner,
		)

		logger.Info("Player result: %s", result)

		updateLeaderboard(
			ctx,
			logger,
			nk,
			player,
			result,
		)

		updatePlayerStats(
			ctx,
			logger,
			nk,
			player,
			result,
		)
	}
}

func updateLeaderboard(
	ctx context.Context,
	logger runtime.Logger,
	nk runtime.NakamaModule,
	player *Player,
	result string,
) {

	if result != core.ResultWin {
		logger.Info("updateLeaderboard: result %q != WIN, skipping for user=%s", result, player.UserID)
		return
	}

	logger.Info("updateLeaderboard: writing win for user=%s username=%s", player.UserID, player.Username)

	// Use value=1 and let Nakama handle the increment based on the operator
	_, err := nk.LeaderboardRecordWrite(
		ctx,
		"global_wins",
		player.UserID,
		player.Username,
		1,
		0,
		nil,
		nil,
	)

	if err != nil {
		logger.Error("leaderboard write failed user=%s err=%v", player.UserID, err)
	} else {
		logger.Info("leaderboard write SUCCESS for user=%s username=%s", player.UserID, player.Username)
	}
}

func updatePlayerStats(
	ctx context.Context,
	logger runtime.Logger,
	nk runtime.NakamaModule,
	player *Player,
	result string,
) {

	stats := readStats(
		ctx,
		logger,
		nk,
		player.UserID,
	)

	switch result {
	case core.ResultWin:
		stats.Wins++
		stats.Streak++

	case core.ResultLoss:
		stats.Losses++
		stats.Streak = 0

	case core.ResultDraw:
		stats.Streak = 0
	}

	writeStats(
		ctx,
		logger,
		nk,
		player.UserID,
		stats,
	)
}

func readStats(
	ctx context.Context,
	logger runtime.Logger,
	nk runtime.NakamaModule,
	userID string,
) PlayerStats {

	objects, err := nk.StorageRead(
		ctx,
		[]*runtime.StorageRead{
			{
				Collection: "player_stats",
				Key:        "stats",
				UserID:     userID,
			},
		},
	)

	if err != nil || len(objects) == 0 {
		return PlayerStats{}
	}

	var stats PlayerStats

	err = json.Unmarshal(
		[]byte(objects[0].Value),
		&stats,
	)

	if err != nil {
		return PlayerStats{}
	}

	return stats
}

func writeStats(
	ctx context.Context,
	logger runtime.Logger,
	nk runtime.NakamaModule,
	userID string,
	stats PlayerStats,
) {

	data, err := json.Marshal(stats)
	if err != nil {
		return
	}

	_, err = nk.StorageWrite(
		ctx,
		[]*runtime.StorageWrite{
			{
				Collection:      "player_stats",
				Key:             "stats",
				UserID:          userID,
				Value:           string(data),
				PermissionRead:  1,
				PermissionWrite: 0,
			},
		},
	)

	if err != nil {
		logger.Error("stats write failed user=%s err=%v", userID, err)
	}
}

func ResolvePlayerResult(
	playerSymbol string,
	winner string,
) string {

	if winner == "DRAW" {
		return core.ResultDraw
	}

	if playerSymbol == winner {
		return core.ResultWin
	}

	return core.ResultLoss
}
