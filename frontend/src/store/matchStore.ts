import { create } from "zustand";
import type { MatchState } from "../types/match";

// LocalStorage key for persisting match info
const MATCH_STORAGE_KEY = "ttt_match_info";

interface StoredMatchInfo {
  matchId: string;
  userId: string;
}

function getStoredMatch(): StoredMatchInfo | null {
  try {
    const stored = localStorage.getItem(MATCH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveMatchInfo(matchId: string, userId: string) {
  try {
    localStorage.setItem(
      MATCH_STORAGE_KEY,
      JSON.stringify({ matchId, userId })
    );
  } catch (e) {
    console.error("[matchStore] Failed to save match info:", e);
  }
}

function clearMatchInfo() {
  try {
    localStorage.removeItem(MATCH_STORAGE_KEY);
  } catch (e) {
    console.error("[matchStore] Failed to clear match info:", e);
  }
}

interface MatchStore extends MatchState {
  inMatchmaking: boolean;
  mySymbol: "X" | "O" | null;
  myUserId: string | null;
  setMatchState: (state: Partial<MatchState>) => void;
  setMyUserId: (userId: string | null) => void;
  setInMatchmaking: (value: boolean) => void;
  reset: () => void;
  getStoredMatchId: () => string | null;
}

const initialState: MatchState = {
  board: Array(9).fill(null),
  currentTurn: "X",
  winner: null,
  timer: 30,
  matchId: null,
  players: [],
};

export const useMatchStore = create<MatchStore>((set, get) => ({
  ...initialState,
  inMatchmaking: false,
  mySymbol: null,
  myUserId: null,

  setMatchState: (state) => {
    console.log(
      "[matchStore] setMatchState called with:",
      JSON.stringify(state)
    );
    set((prev) => {
      const newState = {
        ...prev,
        board: state.board ?? prev.board,
        currentTurn: state.currentTurn ?? prev.currentTurn,
        winner: state.winner !== undefined ? state.winner : prev.winner,
        timer: state.timer ?? prev.timer,
        matchId: state.matchId !== undefined ? state.matchId : prev.matchId,
        players: state.players ?? prev.players,
      };

      // If we got a new matchId and have a userId, save to localStorage
      const myUserId = get().myUserId;
      if (state.matchId && myUserId && state.matchId !== prev.matchId) {
        saveMatchInfo(state.matchId, myUserId);
      }

      // Determine my symbol based on players and current user ID
      // Check both current state's players and new state's players
      const playersToCheck = state.players || prev.players;

      if (playersToCheck && playersToCheck.length > 0 && myUserId) {
        const myPlayer = playersToCheck.find(
          (p: any) => p.user_id === myUserId
        );
        if (myPlayer) {
          newState.mySymbol = myPlayer.symbol as "X" | "O";
        }
      }

      console.log(
        "[matchStore] state transition:",
        JSON.stringify(prev),
        "->",
        JSON.stringify(newState)
      );
      return newState;
    });
  },

  setInMatchmaking: (value) => set({ inMatchmaking: value }),

  setMyUserId: (userId) =>
    set((prev) => {
      let mySymbol: "X" | "O" | null = prev.mySymbol;

      if (!userId) {
        mySymbol = null;
      } else if (prev.players.length > 0) {
        const me = prev.players.find((p: any) => p.user_id === userId);
        mySymbol = me ? (me.symbol as "X" | "O") : null;
      }

      // If we have a matchId in state and userId, save to localStorage
      if (userId && prev.matchId) {
        saveMatchInfo(prev.matchId, userId);
      }

      return { myUserId: userId, mySymbol };
    }),

  reset: () => {
    clearMatchInfo();
    set({
      ...initialState,
      inMatchmaking: false,
      mySymbol: null,
      myUserId: null,
    });
  },

  getStoredMatchId: () => {
    const stored = getStoredMatch();
    return stored?.matchId || null;
  },
}));
