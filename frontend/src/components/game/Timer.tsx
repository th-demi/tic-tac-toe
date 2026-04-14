import { useMatchStore } from '../../store/matchStore';

export function Timer() {
  const timer = useMatchStore((s) => s.timer);

  return (
    <div className="text-center text-lg font-semibold">
      {timer}s
    </div>
  );
}