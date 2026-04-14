import { Board } from '../../components/game/Board';
import { Timer } from '../../components/game/Timer';
import { TurnIndicator } from '../../components/game/TurnIndicator';
import { PlayerInfo } from '../../components/game/PlayerInfo';
import { useMatchStore } from '../../store/matchStore';
import type { NakamaSocket } from '../../services/nakamaClient';

interface Props {
  socket: NakamaSocket | null;
}

export function GameScreen({ socket }: Props) {
  const winner = useMatchStore((s) => s.winner);
  const matchId = useMatchStore((s) => s.matchId);
  const resetMatch = useMatchStore((s) => s.reset);
  const setInMatchmaking = useMatchStore((s) => s.setInMatchmaking);

  console.log('[GameScreen] winner:', winner, 'matchId:', matchId);

  async function handleLeaveRoom() {
    if (socket && matchId) {
      try {
        await socket.leaveMatch(matchId);
      } catch (err) {
        console.error('Error leaving match:', err);
      }
    }
    resetMatch();
    setInMatchmaking(false);
  }

  const isAbandoned = winner === 'ABANDONED';

  return (
    <section className="w-full max-w-md space-y-4">
      {winner && !isAbandoned && (
        <div className="text-center text-2xl font-bold text-yellow-400">
          {winner === 'DRAW' ? "It's a Draw!" : `Player ${winner} Wins!`}
        </div>
      )}
      {isAbandoned && (
        <div className="text-center text-2xl font-bold text-red-400">
          Opponent left the game!
        </div>
      )}
      <PlayerInfo />
      <TurnIndicator />
      <Timer />
      <Board socket={socket} />
      <button
        onClick={handleLeaveRoom}
        className="w-full rounded-lg bg-red-600 px-6 py-3 font-medium text-white mt-4"
      >
        {isAbandoned ? 'Return to Lobby' : 'Leave Room'}
      </button>
    </section>
  );
}