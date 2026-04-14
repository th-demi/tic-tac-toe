import type { NakamaSocket } from "./nakamaClient";

export async function sendMove(
  socket: NakamaSocket,
  matchId: string,
  index: number
) {
  await socket.sendMatchState(
    matchId,
    1,
    new TextEncoder().encode(JSON.stringify({ index }))
  );
}
