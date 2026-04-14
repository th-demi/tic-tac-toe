import type { CellValue } from '../../types/match';

interface Props {
  value: CellValue;
  onClick: () => void;
}

export function Cell({ value, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="aspect-square rounded-xl bg-slate-800 text-3xl font-bold"
    >
      {value}
    </button>
  );
}