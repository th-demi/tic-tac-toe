import { useEffect, useRef, useState } from "react";
import { authenticateDevice } from "./services/nakamaClient";
import { useAuthStore } from "./store/authStore";
import { useMatchStore } from "./store/matchStore";

import { MatchmakingScreen } from "./features/matchmaking/MatchmakingScreen";
import { GameScreen } from "./features/game/GameScreen";

import { useSocket } from "./hooks/useSocket";
import { createCustomRoom, joinCustomRoom } from "./services/matchmakingService";

export default function App() {
  const session = useAuthStore((s) => s.session);
  const nickname = useAuthStore((s) => s.nickname);
  const setSession = useAuthStore((s) => s.setSession);

  const matchId = useMatchStore((s) => s.matchId);
  const inMatchmaking = useMatchStore((s) => s.inMatchmaking);
  const setInMatchmaking = useMatchStore((s) => s.setInMatchmaking);

  console.log('DEBUG App render - nickname:', nickname ? 'set' : 'null', 'matchId:', matchId, 'inMatchmaking:', inMatchmaking);

  const bootstrappedRef = useRef(false);
  const [joinRoomId, setJoinRoomId] = useState('');

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    async function bootstrap() {
      const deviceId = crypto.randomUUID();
      const auth = await authenticateDevice(deviceId);
      setSession(auth);
    }

    void bootstrap();
  }, [setSession]);

  const socket = useSocket(session);

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading session...
      </main>
    );
  }

  if (!nickname) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const nick = formData.get('nickname') as string;
            if (nick) {
              useAuthStore.getState().setNickname(nick);
            }
          }}
          className="flex flex-col gap-4"
        >
          <input
            name="nickname"
            className="rounded-lg bg-slate-800 px-4 py-3 text-white"
            placeholder="Enter nickname"
          />
          <button type="submit" className="rounded-lg bg-cyan-500 px-6 py-3">
            Continue
          </button>
        </form>
      </main>
    );
  }

  if (inMatchmaking && !matchId) {
    return (
      <div className="text-white">
        <p>Waiting for match...</p>
        <MatchmakingScreen socket={socket.current} />
      </div>
    );
  }

  if (matchId) {
    return (
      <div className="text-white text-2xl">
        <p>=== GAME SCREEN ===</p>
        <p>matchId: {matchId}</p>
        <GameScreen socket={socket.current} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 gap-4">
      <div className="text-white text-xl">LOBBY - nickname: {nickname}</div>
      <button
        onClick={async () => {
          if (!socket.current) return;
          const result = await createCustomRoom(socket.current);
          await joinCustomRoom(socket.current, result.match_id);
        }}
        className="rounded-lg bg-slate-700 px-6 py-3 font-medium text-white"
      >
        Create Room
      </button>
      <div className="flex flex-col gap-2 border-t border-slate-700 pt-4">
        <input
          value={joinRoomId}
          onChange={(e) => setJoinRoomId(e.target.value)}
          className="rounded-lg bg-slate-800 px-4 py-3 text-white"
          placeholder="Enter Room ID"
        />
        <button
          onClick={async () => {
            if (!socket.current || !joinRoomId) return;
            await joinCustomRoom(socket.current, joinRoomId);
          }}
          className="rounded-lg bg-slate-600 px-6 py-3 font-medium text-white"
        >
          Join Room
        </button>
      </div>
      <button
        onClick={() => setInMatchmaking(true)}
        className="rounded-lg bg-cyan-500 px-6 py-3 font-medium text-slate-950"
      >
        Start Matchmaking
      </button>
    </main>
  );
}