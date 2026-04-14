import { startMatchmaking } from '../services/matchmakingService';
import { NakamaSocket } from '../services/nakamaClient';

export function useMatchmaking(socket: NakamaSocket | null) {
  async function findMatch() {
    return startMatchmaking(socket);
  }

  return {
    findMatch
  };
}