import {
  Client,
  Session
} from '@heroiclabs/nakama-js';
import { nakamaConfig } from '../config/nakama';

export const client = new Client(
  nakamaConfig.serverKey,
  nakamaConfig.host,
  nakamaConfig.port,
  nakamaConfig.useSSL
);

export type NakamaSocket = ReturnType<typeof client.createSocket>;
export type NakamaSession = Session;

export async function authenticateDevice(deviceId: string) {
  return client.authenticateDevice(deviceId, true);
}