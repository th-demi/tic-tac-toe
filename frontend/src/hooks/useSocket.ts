import { useEffect, useRef } from "react";
import {
  client,
  type NakamaSession,
  type NakamaSocket,
} from "../services/nakamaClient";
import { useMatchStore } from "../store/matchStore";
import { joinCustomRoom } from "../services/matchmakingService";

export function useSocket(session: NakamaSession | null) {
  const socketRef = useRef<NakamaSocket | null>(null);
  const connectedRef = useRef(false);
  const reconnectingRef = useRef(false);

  const setMatchState = useMatchStore((state) => state.setMatchState);
  const setMyUserId = useMatchStore((state) => state.setMyUserId);
  const reset = useMatchStore((state) => state.reset);
  const getStoredMatchId = useMatchStore((state) => state.getStoredMatchId);

  // Function to attempt reconnection to stored match
  async function attemptReconnect(socket: NakamaSocket) {
    if (reconnectingRef.current) {
      console.log("[useSocket] Already attempting reconnect, skipping");
      return;
    }

    const storedMatchId = getStoredMatchId();
    if (!storedMatchId) {
      console.log("[useSocket] No stored matchId found");
      return;
    }

    reconnectingRef.current = true;
    console.log("[useSocket] Attempting to reconnect to match:", storedMatchId);

    try {
      await joinCustomRoom(socket, storedMatchId);
      console.log("[useSocket] Successfully rejoined match:", storedMatchId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log("[useSocket] Failed to rejoin match:", errorMessage);
      // Clear stored match if rejoin failed (match probably ended)
      useMatchStore.getState().reset();
    } finally {
      reconnectingRef.current = false;
    }
  }

  useEffect(() => {
    if (!session || connectedRef.current) return;

    const activeSession = session;
    connectedRef.current = true;

    let mounted = true;

    async function connect() {
      try {
        const socket = client.createSocket();

        socket.ondisconnect = (err) => {
          console.log("[ondisconnect] socket disconnected, code:", err);
          // Don't reset on disconnect - we want to persist match state for reconnection
        };

        console.log("[useSocket] connecting socket...");
        await socket.connect(activeSession, true);
        console.log("[useSocket] connected successfully");

        // Set the user ID in the store after connecting
        if (activeSession.user_id) {
          console.log("[useSocket] setting myUserId:", activeSession.user_id);
          setMyUserId(activeSession.user_id);
        }

        socket.onmatchdata = (message) => {
          const opCode =
            typeof message.op_code === "number"
              ? message.op_code
              : parseInt(message.op_code as string, 10);
          console.log(
            "[onmatchdata] received, op_code:",
            opCode,
            "type:",
            typeof message.op_code,
            "data length:",
            message.data?.length
          );
          try {
            const payload = JSON.parse(new TextDecoder().decode(message.data));
            console.log(
              "[onmatchdata] parsed payload:",
              JSON.stringify(payload)
            );

            if (opCode === 1 && payload.board) {
              setMatchState({
                board: payload.board,
                currentTurn: payload.current_turn || "X",
                winner: payload.winner || null,
                timer: payload.timer ?? 30,
                matchId: message.match_id || null,
                players: payload.players || [],
              });
              console.log("[onmatchdata] state updated with board");
            } else if (opCode === 1) {
              console.log(
                "[onmatchdata] ignoring move-only payload, waiting for full state"
              );
            }
          } catch (err) {
            console.error("[onmatchdata] error parsing:", err);
          }
        };

        socket.onmatchpresence = (presence) => {
          console.log("[onmatchpresence] presence:", presence);
        };

        if (mounted) {
          socketRef.current = socket;
          console.log("[useSocket] socket ref set");

          // After socket is set, try to reconnect to stored match
          await attemptReconnect(socket);
        }
      } catch (err) {
        console.error("[useSocket] connection error:", err);
      }
    }

    void connect();

    return () => {
      console.log("[useSocket] cleanup, disconnecting socket");
      mounted = false;
      socketRef.current?.disconnect(false);
    };
  }, [session, setMatchState, reset, getStoredMatchId]);

  return socketRef;
}
