import type { NakamaSocket } from "./nakamaClient";

export async function startMatchmaking(socket: NakamaSocket) {
  return new Promise<{ match_id: string }>(async (resolve, reject) => {
    socket.onmatchmakermatched = async (matched: { token?: string; match_id?: string }) => {
      try {
        console.log('[startMatchmaking] matched:', matched);
        // Use token if available, otherwise use match_id
        const matchToken = matched.token || matched.match_id;
        if (!matchToken) {
          throw new Error("No token or match_id in matched result");
        }
        const match = await socket.joinMatch(matchToken);
        resolve(match);
      } catch (err) {
        console.error('[startMatchmaking] error:', err);
        reject(err);
      }
    };

    await socket.addMatchmaker("*", 2, 2, { match_handler: "tic_tac_toe_match" });
  });
}

export async function createCustomRoom(socket: NakamaSocket | null) {
  if (!socket) {
    throw new Error("Socket unavailable");
  }

  const result = await socket.rpc("create_room");

  if (!result.payload) {
    throw new Error("Empty RPC payload");
  }

  return JSON.parse(result.payload);
}

export async function joinCustomRoom(
  socket: NakamaSocket | null,
  matchId: string
) {
  if (!socket) {
    throw new Error("Socket unavailable");
  }

  return socket.joinMatch(matchId);
}
