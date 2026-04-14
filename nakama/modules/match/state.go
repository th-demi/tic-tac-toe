package match

import (
	"time"

	"github.com/heroiclabs/nakama-common/runtime"
)

type Player struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Symbol   string `json:"symbol"`
	Presence runtime.Presence
}

type State struct {
	Board []string `json:"board"`

	Players map[string]*Player `json:"players"`

	Turn string `json:"current_turn"`

	Winner string `json:"winner"`

	MatchID string `json:"match_id"`

	Deadline time.Time
	Timer    int `json:"timer"`

	Completed bool
	Persisted bool
}

type ClientPlayer struct {
	Username string `json:"username"`
	Symbol   string `json:"symbol"`
}

type ClientState struct {
	Board       []string       `json:"board"`
	CurrentTurn string         `json:"current_turn"`
	Winner      string         `json:"winner"`
	MatchID     string         `json:"match_id"`
	Timer       int            `json:"timer"`
	Players     []ClientPlayer `json:"players"`
}

func NewState() *State {
	return &State{
		Board:     make([]string, 9),
		Players:   map[string]*Player{},
		Turn:      "X",
		Winner:    "",
		Completed: false,
		Persisted: false,
	}
}

func BuildClientState(state *State) ClientState {
	players := make([]ClientPlayer, 0, len(state.Players))

	for _, p := range state.Players {
		players = append(players, ClientPlayer{
			Username: p.Username,
			Symbol:   p.Symbol,
		})
	}

	return ClientState{
		Board:       state.Board,
		CurrentTurn: state.Turn,
		Winner:      state.Winner,
		MatchID:     state.MatchID,
		Timer:       state.Timer,
		Players:     players,
	}
}
