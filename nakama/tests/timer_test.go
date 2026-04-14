package tests

import (
	"testing"
	"time"

	"tic-tac-toe-nakama/modules/core"
	"tic-tac-toe-nakama/modules/match"
)

func TestDeadlineReset(t *testing.T) {
	state := match.NewState()

	match.ResetDeadline(state)

	if state.Deadline.Before(time.Now()) {
		t.Fatalf("deadline should be future time")
	}
}

func TestTimeoutDetection(t *testing.T) {
	state := match.NewState()

	state.Deadline = time.Now().Add(-1 * time.Second)

	if !match.HasTimedOut(state) {
		t.Fatalf("expected timeout")
	}
}

func TestApplyTimeoutWinner(t *testing.T) {
	state := match.NewState()

	state.Turn = core.PlayerX

	match.ApplyTimeout(state)

	if state.Winner != core.PlayerO {
		t.Fatalf("expected O to win after X timeout")
	}

	if !state.Completed {
		t.Fatalf("expected completed state")
	}
}
