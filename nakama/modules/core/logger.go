package core

import "github.com/heroiclabs/nakama-common/runtime"

func LogMatchStart(
	logger runtime.Logger,
	matchID string,
) {
	logger.Info("match started id=%s", matchID)
}

func LogMatchEnd(
	logger runtime.Logger,
	matchID string,
	result string,
) {
	logger.Info("match ended id=%s result=%s", matchID, result)
}

func LogMoveRejected(
	logger runtime.Logger,
	reason string,
) {
	logger.Warn("move rejected reason=%s", reason)
}
