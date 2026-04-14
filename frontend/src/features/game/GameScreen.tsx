import { Board } from '../../components/game/Board';
import { Timer } from '../../components/game/Timer';
import { TurnIndicator } from '../../components/game/TurnIndicator';
import { PlayerInfo } from '../../components/game/PlayerInfo';
import type { NakamaSocket } from '../../services/nakamaClient';

interface Props {
  socket: NakamaSocket | null;
}

export function GameScreen({ socket }: Props) {
  return (
    <section className="w-full max-w-md space-y-4">
      <PlayerInfo playerOne="You" playerTwo="Opponent" />
      <TurnIndicator />
      <Timer />
      <Board socket={socket} />
    </section>
  );
}