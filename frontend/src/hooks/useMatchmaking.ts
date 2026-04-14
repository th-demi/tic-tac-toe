import { startMatchmaking } from "../services/matchmakingService";
import { NakamaSocket } from "../services/nakamaClient";

export function useMatchmaking(socket: NakamaSocket | null) {
  async function findMatch() {
    if (!socket) {
      throw new Error("Socket unavailable");
    }

    return await startMatchmaking(socket);
  }

  return {
    findMatch,
  };
}
