package rpc

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/heroiclabs/nakama-common/runtime"
)

type RoomInfo struct {
	MatchID     string `json:"matchId"`
	PlayerCount int    `json:"playerCount"`
}

func ListRooms(
	ctx context.Context,
	logger runtime.Logger,
	db *sql.DB,
	nk runtime.NakamaModule,
	payload string,
) (string, error) {

	logger.Info(">>>>> ListRooms RPC called!")

	// Try different approaches to get matches
	// First, list ALL authoritative matches without any filters
	var minSize *int
	var maxSize *int
	min := 0
	max := 100
	minSize = &min
	maxSize = &max
	
	// Try listing with no label filter but with player count range
	matches, err := nk.MatchList(ctx, 100, true, "", minSize, maxSize, "")
	if err != nil {
		logger.Error("Failed to list matches: %v", err)
		return "[]", nil
	}

	logger.Info("Found %d total matches", len(matches))

	// Debug: print all matches
	for _, m := range matches {
		logger.Info("Match: ID=%s, Label=%s, Size=%d", m.MatchId, m.Label, m.Size)
	}

	rooms := make([]RoomInfo, 0, len(matches))
	for _, match := range matches {
		if match == nil {
			continue
		}
		
		// Only include matches with our label
		if match.Label == nil || match.Label.Value != "tic_tac_toe" {
			logger.Info("Skipping match %s - wrong label: %s", match.MatchId, match.Label)
			continue
		}
		
		playerCount := int(match.Size)
		logger.Info("Including match: %s with %d players", match.MatchId, playerCount)

		rooms = append(rooms, RoomInfo{
			MatchID:     match.MatchId,
			PlayerCount: playerCount,
		})
	}

	logger.Info("Returning %d rooms", len(rooms))

	out, err := json.Marshal(rooms)
	if err != nil {
		logger.Error("Failed to marshal rooms: %v", err)
		return "[]", err
	}

	return string(out), nil
}
