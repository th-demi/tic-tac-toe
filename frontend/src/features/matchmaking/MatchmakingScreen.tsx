import { useEffect } from 'react';
import { Spinner } from '../../components/ui/Spinner';

import { useMatchStore } from '../../store/matchStore';
import { startMatchmaking } from '../../services/matchmakingService';

import type { NakamaSocket } from '../../services/nakamaClient';

interface Props {
  socket: NakamaSocket | null;
}

export function MatchmakingScreen({ socket }: Props) {
  const setMatchState = useMatchStore((s) => s.setMatchState);

  useEffect(() => {
    if (!socket) return;

    async function beginMatchmaking() {
      await startMatchmaking(socket);

      socket.onmatchmakermatched = async (matched) => {
        const match = await socket.joinMatch(
          matched.match_id
        );

        setMatchState({
          matchId: match.match_id
        });
      };
    }

    void beginMatchmaking();
  }, [socket, setMatchState]);

  return (
    <section className="flex flex-col items-center gap-4">
      <Spinner />
      <p className="text-slate-300">Finding opponent...</p>
    </section>
  );
}