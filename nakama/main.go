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

	logger.Info("initializing tic tac toe module")

	if err := initializer.RegisterMatch(
		"tic_tac_toe_match",
		match.NewMatch,
	); err != nil {
		return err
	}

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

	err := nk.LeaderboardCreate(
		ctx,
		"global_wins",
		false,
		"desc",
		"best",
		"",
		nil,
		true,
	)

	if err != nil {
		logger.Warn("leaderboard create skipped: %v", err)
	}

	logger.Info("tic tac toe module initialized successfully")

	return nil
}
