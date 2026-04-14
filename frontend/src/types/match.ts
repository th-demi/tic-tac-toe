export type CellValue = 'X' | 'O' | null;

export interface MatchState {
  board: CellValue[];
  currentTurn: 'X' | 'O';
  winner: 'X' | 'O' | 'DRAW' | null;
  timer: number;
  matchId: string | null;
}