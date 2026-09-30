import { GameId } from '../config/release';
import { Ledger, PlayerId } from './types';
import { buildQueue, Vibe } from './queue';
export type Session = {
  queue: GameId[];
  index: number;
  phase: 'host' | 'game' | 'results';
  seed: number;
  finished: boolean;
};
export function createSession(
  vibe: Vibe,
  length: 3 | 5,
  activeCount: number,
  seed: number,
): Session {
  const built = buildQueue(vibe, length, activeCount, seed);
  if (!built.queue.length) throw new Error('Not enough players');
  return { queue: built.queue, index: 0, phase: 'host', seed: built.seed, finished: false };
}
export const currentGame = (session: Session) => session.queue[session.index] ?? null;
export function startCurrentGame(session: Session): Session {
  return currentGame(session) && !session.finished ? { ...session, phase: 'game' } : session;
}
export function finishCurrentGame(session: Session): Session {
  if (session.finished) return session;
  const index = session.index + 1;
  return index >= session.queue.length
    ? { ...session, index, phase: 'results', finished: true }
    : { ...session, index, phase: 'host' };
}
export function leaders(activeIds: readonly PlayerId[], ledger: Ledger): PlayerId[] {
  if (!activeIds.length) return [];
  const maximum = Math.max(...activeIds.map((id) => ledger.scores[id] ?? 0));
  return activeIds.filter((id) => (ledger.scores[id] ?? 0) === maximum);
}
