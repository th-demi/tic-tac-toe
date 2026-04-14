import { useEffect, useRef } from "react";
import { Spinner } from "../../components/ui/Spinner";

import { useMatchStore } from "../../store/matchStore";
import { startMatchmaking } from "../../services/matchmakingService";

import type { NakamaSocket } from "../../services/nakamaClient";

interface Props {
  socket: NakamaSocket | null;
}

export function MatchmakingScreen({ socket }: Props) {
  const setMatchState = useMatchStore(
    (state: ReturnType<typeof useMatchStore.getState>) => state.setMatchState
  );
  const setInMatchmaking = useMatchStore((state) => state.setInMatchmaking);

  const startedRef = useRef(false);

  useEffect(() => {
    if (!socket || startedRef.current) return;

    const activeSocket = socket;
    startedRef.current = true;

    async function beginMatchmaking() {
      try {
        setInMatchmaking(true);
        const match = await startMatchmaking(activeSocket);

        setMatchState({
          matchId: match.match_id,
        });
      } catch (err) {
        console.error("matchmaking failed:", err);
        setInMatchmaking(false);
      }
    }

    void beginMatchmaking();
  }, [socket, setMatchState, setInMatchmaking]);

  return (
    <section className="flex flex-col items-center gap-4">
      <Spinner />
      <p className="text-slate-300">Finding opponent...</p>
    </section>
  );
}
