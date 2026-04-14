import { create } from 'zustand';
import type { LeaderboardEntry } from '../types/leaderboard';

interface LeaderboardStore {
  entries: LeaderboardEntry[];
  setEntries: (entries: LeaderboardEntry[]) => void;
}

export const useLeaderboardStore = create<LeaderboardStore>((set) => ({
  entries: [],
  setEntries: (entries) => set({ entries })
}));