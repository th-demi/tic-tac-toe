import { useLeaderboardStore } from '../../store/leaderboardStore';

export function LeaderboardPreview() {
  const entries = useLeaderboardStore((s) => s.entries);

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.username}
          className="flex justify-between text-sm"
        >
          <span>{entry.username}</span>
          <span>{entry.wins}</span>
        </div>
      ))}
    </div>
  );
}