import { useEffect, useRef, useState } from "react";
import { authenticateDevice } from "./services/nakamaClient";
import { useAuthStore } from "./store/authStore";
import { useMatchStore } from "./store/matchStore";

import { NicknameScreen } from "./features/auth/NicknameScreen";
import { MatchmakingScreen } from "./features/matchmaking/MatchmakingScreen";
import { GameScreen } from "./features/game/GameScreen";

import { useSocket } from "./hooks/useSocket";

export default function App() {
  const session = useAuthStore((s) => s.session);
  const nickname = useAuthStore((s) => s.nickname);
  const setSession = useAuthStore((s) => s.setSession);

  const matchId = useMatchStore((s) => s.matchId);

  const [inMatchmaking, setInMatchmaking] = useState(false);

  const bootstrappedRef = useRef(false);

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
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {!nickname ? (
        <NicknameScreen />
      ) : !inMatchmaking ? (
        <button
          onClick={() => setInMatchmaking(true)}
          className="rounded-lg bg-cyan-500 px-6 py-3 font-medium text-slate-950"
        >
          Start Matchmaking
        </button>
      ) : !matchId ? (
        <MatchmakingScreen socket={socket.current} />
      ) : (
        <GameScreen socket={socket.current} />
      )}
    </main>
  );
}
