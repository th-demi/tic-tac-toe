export type CellValue = 'X' | 'O' | null;

export interface Player {
  username: string;
  symbol: string;
  user_id: string;
}

export interface MatchState {
  board: CellValue[];
  currentTurn: 'X' | 'O';
  winner: 'X' | 'O' | 'DRAW' | 'ABANDONED' | null;
  timer: number;
  matchId: string | null;
  players: Player[];
}