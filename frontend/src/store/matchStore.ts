import { create } from 'zustand';
import type { MatchState } from '../types/match';

interface MatchStore extends MatchState {
  inMatchmaking: boolean;
  mySymbol: 'X' | 'O' | null;
  myUserId: string | null;
  setMatchState: (state: Partial<MatchState>) => void;
  setMyUserId: (userId: string | null) => void;
  setInMatchmaking: (value: boolean) => void;
  reset: () => void;
}

const initialState: MatchState = {
  board: Array(9).fill(null),
  currentTurn: 'X',
  winner: null,
  timer: 30,
  matchId: null,
  players: []
};

export const useMatchStore = create<MatchStore>((set, get) => ({
  ...initialState,
  inMatchmaking: false,
  mySymbol: null,
  myUserId: null,

  setMatchState: (state) => {
    console.log('[matchStore] setMatchState called with:', JSON.stringify(state));
    set((prev) => {
      const newState = {
        ...prev,
        board: state.board ?? prev.board,
        currentTurn: state.currentTurn ?? prev.currentTurn,
        winner: state.winner !== undefined ? state.winner : prev.winner,
        timer: state.timer ?? prev.timer,
        matchId: state.matchId !== undefined ? state.matchId : prev.matchId,
        players: state.players ?? prev.players
      };

      // Determine my symbol based on players and current user ID
      if (state.players && state.players.length > 0) {
        const myUserId = get().myUserId;
        if (myUserId) {
          const myPlayer = state.players.find((p: any) => p.user_id === myUserId);
          if (myPlayer) {
            newState.mySymbol = myPlayer.symbol as 'X' | 'O';
          }
        }
      }

      console.log('[matchStore] state transition:', JSON.stringify(prev), '->', JSON.stringify(newState));
      return newState;
    });
  },

  setInMatchmaking: (value) => set({ inMatchmaking: value }),

  setMyUserId: (userId) => set({ myUserId: userId }),

  reset: () => set({ ...initialState, inMatchmaking: false, mySymbol: null, myUserId: null })
}));