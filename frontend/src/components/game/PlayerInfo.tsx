interface Props {
  playerOne: string;
  playerTwo: string;
}

export function PlayerInfo({ playerOne, playerTwo }: Props) {
  return (
    <div className="flex justify-between text-sm text-slate-300">
      <span>{playerOne}</span>
      <span>{playerTwo}</span>
    </div>
  );
}