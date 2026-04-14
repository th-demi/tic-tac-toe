import { useMatchStore } from '../../store/matchStore';

export function Timer() {
  const timer = useMatchStore((s) => s.timer ?? 0);
  const winner = useMatchStore((s) => s.winner);

  if (winner) {
    return null; // Don't show timer when game is over
  }

  if (timer === 0) {
    return (
      <div className="text-center text-lg text-slate-400">
        Waiting for opponent...
      </div>
    );
  }

  return (
    <div className="text-center text-lg font-semibold">
      {timer}s
    </div>
  );
}