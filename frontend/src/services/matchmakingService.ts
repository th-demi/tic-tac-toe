import type { NakamaSocket } from "./nakamaClient";

export async function startMatchmaking(socket: NakamaSocket) {
  return new Promise<{ match_id: string }>(async (resolve, reject) => {
    socket.onmatchmakermatched = async (matched: { token: string }) => {
      try {
        const match = await socket.joinMatch(undefined, matched.token);
        resolve(match);
      } catch (err) {
        reject(err);
      }
    };

    await socket.addMatchmaker("*", 2, 2);
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
