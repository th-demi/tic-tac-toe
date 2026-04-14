package match

import (
	"time"

	"tic-tac-toe-nakama/modules/core"
)

func ResetDeadline(state *State) {
	state.Deadline = time.Now().Add(
		time.Duration(core.DefaultTurnTimeoutSeconds) * time.Second,
	)

	state.Timer = core.DefaultTurnTimeoutSeconds
}

func HasTimedOut(state *State) bool {
	return time.Now().After(state.Deadline)
}

func ApplyTimeout(state *State) {
	if state.Completed {
		return
	}

	if state.Turn == core.PlayerX {
		state.Winner = core.PlayerO
	} else {
		state.Winner = core.PlayerX
	}

	state.Completed = true
}
