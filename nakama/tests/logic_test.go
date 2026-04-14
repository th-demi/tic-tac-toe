package tests

import (
	"testing"

	"tic-tac-toe-nakama/modules/core"
	"tic-tac-toe-nakama/modules/match"
)

func prepareState() *match.State {
	state := match.NewState()

	state.Players["p1"] = &match.Player{
		UserID: "p1",
		Symbol: core.PlayerX,
	}

	state.Players["p2"] = &match.Player{
		UserID: "p2",
		Symbol: core.PlayerO,
	}

	return state
}

func TestApplyMoveSuccess(t *testing.T) {
	state := prepareState()

	err := match.ApplyMove(state, "p1", 0)
	if err != nil {
		t.Fatalf("expected nil error got %v", err)
	}

	if state.Board[0] != core.PlayerX {
		t.Fatalf("expected X at index 0")
	}

	if state.Turn != core.PlayerO {
		t.Fatalf("expected turn to switch to O")
	}
}

func TestOutOfTurnRejected(t *testing.T) {
	state := prepareState()

	err := match.ApplyMove(state, "p2", 0)
	if err == nil {
		t.Fatalf("expected out of turn error")
	}
}

func TestCellOccupiedRejected(t *testing.T) {
	state := prepareState()

	_ = match.ApplyMove(state, "p1", 0)

	err := match.ApplyMove(state, "p2", 0)
	if err == nil {
		t.Fatalf("expected occupied cell error")
	}
}

func TestWinnerDetection(t *testing.T) {
	state := prepareState()

	state.Board = []string{
		"X", "X", "",
		"O", "O", "",
		"", "", "",
	}

	err := match.ApplyMove(state, "p1", 2)
	if err != nil {
		t.Fatalf("unexpected error %v", err)
	}

	if state.Winner != core.PlayerX {
		t.Fatalf("expected X winner")
	}

	if !state.Completed {
		t.Fatalf("expected completed state")
	}
}

func TestDrawDetection(t *testing.T) {
	state := prepareState()

	state.Board = []string{
		"X", "O", "X",
		"X", "O", "O",
		"O", "X", "",
	}

	state.Turn = core.PlayerX

	err := match.ApplyMove(state, "p1", 8)
	if err != nil {
		t.Fatalf("unexpected error %v", err)
	}

	if state.Winner != "DRAW" {
		t.Fatalf("expected draw")
	}
}
