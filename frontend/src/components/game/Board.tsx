import { Cell } from './Cell';
import { useMatchStore } from '../../store/matchStore';
import { sendMove } from '../../services/matchService';
import type { NakamaSocket } from '../../services/nakamaClient';

interface Props {
  socket: NakamaSocket | null;
}

export function Board({ socket }: Props) {
  const board = useMatchStore((s) => s.board ?? Array(9).fill(null));
  const matchId = useMatchStore((s) => s.matchId);
  const currentTurn = useMatchStore((s) => s.currentTurn);
  const mySymbol = useMatchStore((s) => s.mySymbol);
  const winner = useMatchStore((s) => s.winner);

  if (!matchId || !board) {
    return null;
  }

  async function handleMove(index: number) {
    if (!matchId || !socket) return;

    // Don't allow moves if game is over or wrong turn
    if (winner || !mySymbol || currentTurn !== mySymbol) {
      console.log('[Board] Cannot move - winner:', winner, 'mySymbol:', mySymbol, 'currentTurn:', currentTurn);
      return;
    }

    await sendMove(socket, matchId as string, index);
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {board.map((cell, i) => (
        <Cell
          key={i}
          value={cell}
          onClick={() => handleMove(i)}
        />
      ))}
    </div>
  );
}