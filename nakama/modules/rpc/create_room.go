package rpc

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/heroiclabs/nakama-common/runtime"
)

func CreateRoom(
	ctx context.Context,
	logger runtime.Logger,
	db *sql.DB,
	nk runtime.NakamaModule,
	payload string,
) (string, error) {

	matchID, err := nk.MatchCreate(
		ctx,
		"tic_tac_toe_match",
		map[string]interface{}{},
	)
	if err != nil {
		return "", err
	}

	response := map[string]string{
		"match_id": matchID,
	}

	out, err := json.Marshal(response)
	if err != nil {
		return "", err
	}

	return string(out), nil
}
