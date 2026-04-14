import { useEffect, useRef } from 'react';
import {
  client,
  type NakamaSession,
  type NakamaSocket
} from '../services/nakamaClient';
import { useMatchStore } from '../store/matchStore';

export function useSocket(session: NakamaSession | null) {
  const socketRef = useRef<NakamaSocket | null>(null);
  const setMatchState = useMatchStore((s) => s.setMatchState);

  useEffect(() => {
    if (!session) return;

    let mounted = true;

    async function connect() {
      const socket = client.createSocket();

      await socket.connect(session, true);

      socket.onmatchdata = (message: { data: Uint8Array }) => {
        const payload = JSON.parse(
          new TextDecoder().decode(message.data)
        );

        setMatchState(payload);
      };

      if (mounted) {
        socketRef.current = socket;
      }
    }

    void connect();

    return () => {
      mounted = false;
      socketRef.current?.disconnect();
    };
  }, [session, setMatchState]);

  return socketRef;
}