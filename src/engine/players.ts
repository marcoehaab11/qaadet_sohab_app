import { Participant, PlayerId } from './types';
export const activePlayers = (players: readonly Participant[]) => players.filter((p) => !p.away);
export function nextPlayer(
  order: readonly PlayerId[],
  current: PlayerId | null,
  players: readonly Participant[],
): PlayerId | null {
  const active = new Set(activePlayers(players).map((p) => p.id));
  const index = current === null ? -1 : order.indexOf(current);
  for (let offset = 1; offset <= order.length; offset++) {
    const candidate = order[(index + offset) % order.length]!;
    if (active.has(candidate)) return candidate;
  }
  return null;
}
export function lateJoinScore(
  players: readonly Participant[],
  scores: Record<PlayerId, number>,
  sessionLive: boolean,
): number {
  const active = activePlayers(players);
  if (!sessionLive || !active.length || !Object.values(scores).some(Boolean)) return 0;
  return Math.round(active.reduce((sum, p) => sum + (scores[p.id] ?? 0), 0) / active.length);
}
