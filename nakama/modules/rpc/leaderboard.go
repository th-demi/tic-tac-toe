package rpc

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/heroiclabs/nakama-common/runtime"
)

type PlayerStats struct {
	Wins   int `json:"wins"`
	Losses int `json:"losses"`
	Streak int `json:"streak"`
}

type LeaderboardEntry struct {
	Username string `json:"username"`
	Wins     int64  `json:"wins"`
	Losses   int    `json:"losses"`
	Streak   int    `json:"streak"`
}

func GetLeaderboard(
	ctx context.Context,
	logger runtime.Logger,
	db *sql.DB,
	nk runtime.NakamaModule,
	payload string,
) (string, error) {

	records, _, _, _, err := nk.LeaderboardRecordsList(
		ctx,
		"global_wins",
		[]string{},
		10,
		"",
		0,
	)
	if err != nil {
		return "", err
	}

	result := make([]LeaderboardEntry, 0, len(records))

	for _, record := range records {

		stats := readStats(
			ctx,
			logger,
			nk,
			record.OwnerId,
		)

		entry := LeaderboardEntry{
			Username: record.Username.GetValue(),
			Wins:     record.Score,
			Losses:   stats.Losses,
			Streak:   stats.Streak,
		}

		result = append(result, entry)
	}

	out, err := json.Marshal(result)
	if err != nil {
		return "", err
	}

	return string(out), nil
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
