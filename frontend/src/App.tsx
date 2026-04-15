import { useEffect, useRef, useState } from "react";
import { authenticateDevice } from "./services/nakamaClient";
import { client } from "./services/nakamaClient";
import { useAuthStore } from "./store/authStore";
import { useMatchStore } from "./store/matchStore";

import { MatchmakingScreen } from "./features/matchmaking/MatchmakingScreen";
import { GameScreen } from "./features/game/GameScreen";
import { ResultScreen } from "./features/results/ResultScreen";

import { useSocket } from "./hooks/useSocket";
import {
  createCustomRoom,
  joinCustomRoom,
  listRooms,
  type RoomInfo,
} from "./services/matchmakingService";

export default function App() {
  const session = useAuthStore((s) => s.session);
  const nickname = useAuthStore((s) => s.nickname);
  const setSession = useAuthStore((s) => s.setSession);

  const matchId = useMatchStore((s) => s.matchId);
  const winner = useMatchStore((s) => s.winner);
  const mySymbol = useMatchStore((s) => s.mySymbol);
  const inMatchmaking = useMatchStore((s) => s.inMatchmaking);
  const setInMatchmaking = useMatchStore((s) => s.setInMatchmaking);
  const resetMatch = useMatchStore((s) => s.reset);

  console.log(
    "DEBUG App render - nickname:",
    nickname ? "set" : "null",
    "matchId:",
    matchId,
    "inMatchmaking:",
    inMatchmaking
  );

  const bootstrappedRef = useRef(false);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  async function loadRooms() {
    if (!socket.current) return;
    setIsLoadingRooms(true);
    try {
      const roomList = await listRooms(socket.current);
      setRooms(roomList);
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setIsLoadingRooms(false);
    }
  }

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    async function bootstrap() {
      const storedDeviceId = localStorage.getItem("ttt_device_id");
      const deviceId = storedDeviceId || crypto.randomUUID();
      if (!storedDeviceId) {
        localStorage.setItem("ttt_device_id", deviceId);
      }
      const auth = await authenticateDevice(deviceId);
      setSession(auth);
    }

    void bootstrap();
  }, [setSession]);

  const socket = useSocket(session);

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading session...
      </main>
    );
  }

  if (!nickname) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const nick = formData.get("nickname") as string;
            if (nick) {
              try {
                await client.updateAccount(session, { username: nick });
              } catch (err) {
                console.error(
                  "Failed to sync nickname to Nakama account:",
                  err
                );
              }
              useAuthStore.getState().setNickname(nick);
            }
          }}
          className="flex flex-col gap-4"
        >
          <input
            name="nickname"
            className="rounded-lg bg-slate-800 px-4 py-3 text-white"
            placeholder="Enter nickname"
          />
          <button type="submit" className="rounded-lg bg-cyan-500 px-6 py-3">
            Continue
          </button>
        </form>
      </main>
    );
  }

  if (inMatchmaking && !matchId) {
    return (
      <div className="text-white">
        <p>Waiting for match...</p>
        <MatchmakingScreen socket={socket.current} />
      </div>
    );
  }

  if (matchId && winner) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-6">
        <ResultScreen
          winner={winner}
          mySymbol={mySymbol}
          onBackToLobby={() => {
            resetMatch();
            setInMatchmaking(false);
          }}
        />
      </main>
    );
  }

  if (matchId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-start justify-center px-4 py-6">
        <GameScreen socket={socket.current} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 gap-4">
      <div className="text-white text-xl">LOBBY - nickname: {nickname}</div>
      <button
        onClick={async () => {
          if (!socket.current) return;
          const result = await createCustomRoom(socket.current);
          await joinCustomRoom(socket.current, result.match_id);
        }}
        className="rounded-lg bg-slate-700 px-6 py-3 font-medium text-white"
      >
        Create Room
      </button>

      {/* Room List Section */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-medium">Active Rooms</h3>
          <button
            onClick={loadRooms}
            disabled={isLoadingRooms}
            className="text-sm text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
          >
            {isLoadingRooms ? "Loading..." : "Refresh"}
          </button>
        </div>
        {rooms.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No active rooms</p>
        ) : (
          <div className="space-y-2">
            {rooms.map((room) => (
              <div
                key={room.matchId}
                className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3"
              >
                <div className="text-white">
                  <span className="text-sm font-mono text-cyan-400">
                    {room.matchId.substring(0, 8)}...
                  </span>
                  <span className="text-sm text-slate-400 ml-2">
                    {room.playerCount}/2 players
                  </span>
                </div>
                <button
                  onClick={async () => {
                    if (!socket.current) return;
                    await joinCustomRoom(socket.current, room.matchId);
                  }}
                  disabled={room.playerCount >= 2}
                  className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-700 pt-4 w-full max-w-md">
        <p className="text-slate-400 text-center text-sm">
          Or enter Room ID manually
        </p>
        <div className="flex gap-2">
          <input
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            className="flex-1 rounded-lg bg-slate-800 px-4 py-3 text-white"
            placeholder="Enter Room ID"
          />
          <button
            onClick={async () => {
              if (!socket.current || !joinRoomId) return;
              await joinCustomRoom(socket.current, joinRoomId);
            }}
            className="rounded-lg bg-slate-600 px-4 py-3 font-medium text-white"
          >
            Join
          </button>
        </div>
      </div>
      <button
        onClick={() => setInMatchmaking(true)}
        className="rounded-lg bg-cyan-500 px-6 py-3 font-medium text-slate-950"
      >
        Start Matchmaking
      </button>
    </main>
  );
}
