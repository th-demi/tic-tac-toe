package match

import (
	"tic-tac-toe-nakama/modules/core"
)

func ApplyMove(
	state *State,
	userID string,
	index int,
) error {

	player, ok := state.Players[userID]
	if !ok {
		return core.ErrPlayerNotFound
	}

	if state.Completed {
		return core.ErrInvalidMove
	}

	if player.Symbol != state.Turn {
		return core.ErrOutOfTurn
	}

	if index < 0 || index >= core.BoardSize {
		return core.ErrInvalidMove
	}

	if state.Board[index] != "" {
		return core.ErrCellOccupied
	}

	state.Board[index] = player.Symbol

	if winner := DetectWinner(state.Board); winner != "" {
		state.Winner = winner
		state.Completed = true
		return nil
	}

	if IsDraw(state.Board) {
		state.Winner = "DRAW"
		state.Completed = true
		return nil
	}

	if state.Turn == core.PlayerX {
		state.Turn = core.PlayerO
	} else {
		state.Turn = core.PlayerX
	}

	return nil
}

func DetectWinner(board []string) string {
	lines := [][]int{
		{0, 1, 2},
		{3, 4, 5},
		{6, 7, 8},
		{0, 3, 6},
		{1, 4, 7},
		{2, 5, 8},
		{0, 4, 8},
		{2, 4, 6},
	}

	for _, line := range lines {
		a := board[line[0]]
		b := board[line[1]]
		c := board[line[2]]

		if a != "" && a == b && b == c {
			return a
		}
	}

	return ""
}

func IsDraw(board []string) bool {
	for _, cell := range board {
		if cell == "" {
			return false
		}
	}

	return true
}
