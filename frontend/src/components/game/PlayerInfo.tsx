import { useMatchStore } from '../../store/matchStore';

export function PlayerInfo() {
  const currentTurn = useMatchStore((s) => s.currentTurn ?? 'X');
  const winner = useMatchStore((s) => s.winner);

  return (
    <div className="flex justify-between text-sm">
      <div className={`flex flex-col items-center ${currentTurn === 'X' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
        <span className="text-lg">X</span>
        <span className="text-xs">{currentTurn === 'X' && !winner ? 'Your Turn' : ''}</span>
      </div>
      <div className="text-slate-500 text-xs">vs</div>
      <div className={`flex flex-col items-center ${currentTurn === 'O' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
        <span className="text-lg">O</span>
        <span className="text-xs">{currentTurn === 'O' && !winner ? 'Your Turn' : ''}</span>
      </div>
    </div>
  );
}