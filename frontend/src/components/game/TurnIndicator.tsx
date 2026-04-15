import { useMatchStore } from "../../store/matchStore";

export function TurnIndicator() {
  const currentTurn = useMatchStore((s) => s.currentTurn ?? "X");
  const mySymbol = useMatchStore((s) => s.mySymbol);
  const winner = useMatchStore((s) => s.winner);

  if (winner) {
    return null;
  }

  const isMyTurn = Boolean(mySymbol && currentTurn === mySymbol);
  const turnLabel = isMyTurn ? "Your Turn" : "Opponent's Turn";

  return (
    <div className="text-center font-medium text-lg">
      {`${turnLabel} (${currentTurn})`}
    </div>
  );
}
