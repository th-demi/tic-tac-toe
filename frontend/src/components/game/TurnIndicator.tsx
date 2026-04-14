import { useMatchStore } from '../../store/matchStore';

export function TurnIndicator() {
  const currentTurn = useMatchStore((s) => s.currentTurn);

  return (
    <div className="text-center font-medium">
      Turn: {currentTurn}
    </div>
  );
}