package rpc

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/heroiclabs/nakama-common/runtime"
)

func FindMatch(
	ctx context.Context,
	logger runtime.Logger,
	db *sql.DB,
	nk runtime.NakamaModule,
	payload string,
) (string, error) {

	response := map[string]string{
		"status": "matchmaker_ready",
	}

	out, err := json.Marshal(response)
	if err != nil {
		return "", err
	}

	return string(out), nil
}
