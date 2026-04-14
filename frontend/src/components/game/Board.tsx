import { Cell } from './Cell';
import { useMatchStore } from '../../store/matchStore';
import { sendMove } from '../../services/matchService';
import type { NakamaSocket } from '../../services/nakamaClient';

interface Props {
  socket: NakamaSocket | null;
}

export function Board({ socket }: Props) {
  const board = useMatchStore((s) => s.board);
  const matchId = useMatchStore((s) => s.matchId);

  async function handleMove(index: number) {
    if (!matchId || !socket) return;

    await sendMove(socket, matchId, index);
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