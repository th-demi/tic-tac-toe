import { client, type NakamaSession } from './nakamaClient';

export async function fetchLeaderboard(session: NakamaSession) {
  return client.rpc(session, 'get_leaderboard');
}