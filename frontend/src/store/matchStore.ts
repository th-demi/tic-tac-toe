import { create } from 'zustand';
import type { MatchState } from '../types/match';

interface MatchStore extends MatchState {
  setMatchState: (state: Partial<MatchState>) => void;
  reset: () => void;
}

const initialState: MatchState = {
  board: Array(9).fill(null),
  currentTurn: 'X',
  winner: null,
  timer: 30,
  matchId: null
};

export const useMatchStore = create<MatchStore>((set) => ({
  ...initialState,

  setMatchState: (state) =>
    set((prev) => ({
      ...prev,
      ...state
    })),

  reset: () => set(initialState)
}));