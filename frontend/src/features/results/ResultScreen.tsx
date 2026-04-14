import { LeaderboardPreview } from './LeaderboardPreview';

export function ResultScreen() {
  return (
    <section className="space-y-4 text-center">
      <h2 className="text-2xl font-bold">Game Finished</h2>
      <LeaderboardPreview />
    </section>
  );
}