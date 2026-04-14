import { useEffect, useRef } from "react";
import {
  client,
  type NakamaSession,
  type NakamaSocket,
} from "../services/nakamaClient";
import { useMatchStore } from "../store/matchStore";

export function useSocket(session: NakamaSession | null) {
  const socketRef = useRef<NakamaSocket | null>(null);
  const connectedRef = useRef(false);

  const setMatchState = useMatchStore((state) => state.setMatchState);

  useEffect(() => {
    if (!session || connectedRef.current) return;

    const activeSession = session;
    connectedRef.current = true;

    let mounted = true;

    async function connect() {
      const socket = client.createSocket();

      await socket.connect(activeSession, true);

      socket.onmatchdata = (message) => {
        const payload = JSON.parse(new TextDecoder().decode(message.data));

        setMatchState({
          board: payload.board,
          currentTurn: payload.current_turn,
          winner: payload.winner || null,
          timer: payload.timer,
          matchId: payload.match_id || null,
        });
      };

      socket.onmatchpresence = (presence) => {
        console.log("presence:", presence);
      };

      if (mounted) {
        socketRef.current = socket;
      }
    }

    void connect();

    return () => {
      mounted = false;
      socketRef.current?.disconnect(false);
    };
  }, [session, setMatchState]);

  return socketRef;
}
