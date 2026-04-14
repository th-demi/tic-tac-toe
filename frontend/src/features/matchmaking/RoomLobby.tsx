import { useState } from 'react';
import {
  createCustomRoom,
  joinCustomRoom
} from '../../services/matchmakingService';
import type { NakamaSocket } from '../../services/nakamaClient';

interface Props {
  socket: NakamaSocket | null;
}

export function RoomLobby({ socket }: Props) {
  const [roomId, setRoomId] = useState('');

  return (
    <section className="space-y-3">
      <button
        onClick={async () => {
          const result = await createCustomRoom(socket);
          await joinCustomRoom(socket, result.match_id);
        }}
        className="w-full rounded-lg bg-slate-800 py-3"
      >
        Create Room
      </button>

      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="w-full rounded-lg bg-slate-800 px-4 py-3"
        placeholder="Enter Room ID"
      />

      <button
        onClick={() => joinCustomRoom(socket, roomId)}
        className="w-full rounded-lg bg-cyan-500 py-3"
      >
        Join Room
      </button>
    </section>
  );
}