import { useEffect, useMemo, useState } from "react";
import { LeaderboardPreview } from "./LeaderboardPreview";
import { fetchLeaderboard } from "../../services/leaderboardService";
import { useAuthStore } from "../../store/authStore";
import { useLeaderboardStore } from "../../store/leaderboardStore";
import type { LeaderboardEntry } from "../../types/leaderboard";
import type { MatchState } from "../../types/match";

interface Props {
  winner: MatchState["winner"];
  mySymbol: "X" | "O" | null;
  onBackToLobby: () => void;
}

export function ResultScreen({ winner, mySymbol, onBackToLobby }: Props) {
  const session = useAuthStore((s) => s.session);
  const setEntries = useLeaderboardStore((s) => s.setEntries);
  const entries = useLeaderboardStore((s) => s.entries);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session) return;

    const activeSession = session;

    let cancelled = false;

    async function loadLeaderboard() {
      setIsLoading(true);
      try {
        const res = await fetchLeaderboard(activeSession);
        const rawPayload = res.payload;
        const payload =
          typeof rawPayload === "string"
            ? JSON.parse(rawPayload)
            : rawPayload ?? [];
        if (!cancelled) {
          setEntries(
            Array.isArray(payload) ? (payload as LeaderboardEntry[]) : []
          );
        }
      } catch (err) {
        console.error("[ResultScreen] failed to load leaderboard:", err);
        if (!cancelled) {
          setEntries([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [session, setEntries]);

  const resultText = useMemo(() => {
    if (!winner) return "Game Finished";
    if (winner === "DRAW") return "It's a Draw!";
    if (winner === "ABANDONED") return "Opponent left the game!";
    if (mySymbol && winner === mySymbol) return "You Win!";
    return "You Lose!";
  }, [winner, mySymbol]);

  return (
    <section className="w-full max-w-md space-y-4 text-white">
      <h2 className="text-center text-2xl font-bold">{resultText}</h2>

      <div className="rounded-lg bg-slate-900/70 p-4">
        <h3 className="mb-3 text-center text-lg font-semibold">Leaderboard</h3>
        {isLoading ? (
          <p className="text-center text-slate-300">Loading leaderboard...</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-slate-400">
            No leaderboard entries yet.
          </p>
        ) : (
          <LeaderboardPreview />
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-1">
        <button
          onClick={onBackToLobby}
          className="rounded-lg bg-slate-700 px-6 py-3 font-medium text-white"
        >
          Back to Lobby
        </button>
      </div>
    </section>
  );
}
