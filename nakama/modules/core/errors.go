package core

import "errors"

var (
	ErrInvalidMove    = errors.New("invalid move")
	ErrOutOfTurn      = errors.New("out of turn")
	ErrCellOccupied   = errors.New("cell already occupied")
	ErrMatchFull      = errors.New("match already full")
	ErrMatchNotReady  = errors.New("match not ready")
	ErrUnauthorized   = errors.New("unauthorized action")
	ErrInvalidPayload = errors.New("invalid payload")
	ErrPlayerNotFound = errors.New("player not found")
)
