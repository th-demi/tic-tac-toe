package main

import (
	"context"
	"database/sql"

	"tic-tac-toe-nakama/modules/match"
	"tic-tac-toe-nakama/modules/rpc"

	"github.com/heroiclabs/nakama-common/runtime"
)

func InitModule(
	ctx context.Context,
	logger runtime.Logger,
	db *sql.DB,
	nk runtime.NakamaModule,
	initializer runtime.Initializer,
) error {

	logger.Error("##### InitModule STARTING #####")

	if err := initializer.RegisterMatch(
		"tic_tac_toe_match",
		match.NewMatch,
	); err != nil {
		logger.Error("##### RegisterMatch FAILED: %v #####", err)
		return err
	}
	logger.Error("##### RegisterMatch succeeded #####")

	if err := initializer.RegisterMatchmakerMatched(
		func(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, entries []runtime.MatchmakerEntry) (string, error) {
			matchID, err := nk.MatchCreate(ctx, "tic_tac_toe_match", map[string]interface{}{})
			if err != nil {
				return "", err
			}
			logger.Info("##### Matchmaker created match: %s #####", matchID)
			return matchID, nil
		},
	); err != nil {
		logger.Error("##### RegisterMatchmakerMatched FAILED: %v #####", err)
		return err
	}
	logger.Error("##### RegisterMatchmakerMatched succeeded #####")

	if err := initializer.RegisterRpc(
		"create_room",
		rpc.CreateRoom,
	); err != nil {
		return err
	}

	if err := initializer.RegisterRpc(
		"join_room",
		rpc.JoinRoom,
	); err != nil {
		return err
	}

	if err := initializer.RegisterRpc(
		"find_match",
		rpc.FindMatch,
	); err != nil {
		return err
	}

	if err := initializer.RegisterRpc(
		"get_leaderboard",
		rpc.GetLeaderboard,
	); err != nil {
		return err
	}

	if err := initializer.RegisterRpc(
		"list_rooms",
		rpc.ListRooms,
	); err != nil {
		return err
	}

	err := nk.LeaderboardCreate(
		ctx,
		"global_wins",
		true,
		"desc",
		"increment",
		"",
		nil,
	)

	if err != nil {
		logger.Warn("leaderboard create skipped: %v", err)
	}

	logger.Info("tic tac toe module initialized successfully")

	return nil
}
