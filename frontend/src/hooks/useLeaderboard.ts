import { useLeaderboardStore } from '../store/leaderboardStore';

export function useLeaderboard() {
  return useLeaderboardStore();
}