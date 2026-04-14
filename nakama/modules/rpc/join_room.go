package rpc

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/heroiclabs/nakama-common/runtime"
)

func JoinRoom(
	ctx context.Context,
	logger runtime.Logger,
	db *sql.DB,
	nk runtime.NakamaModule,
	payload string,
) (string, error) {

	var req struct {
		MatchID string `json:"match_id"`
	}

	if err := json.Unmarshal([]byte(payload), &req); err != nil {
		return "", err
	}

	response := map[string]string{
		"match_id": req.MatchID,
	}

	out, err := json.Marshal(response)
	if err != nil {
		return "", err
	}

	return string(out), nil
}
