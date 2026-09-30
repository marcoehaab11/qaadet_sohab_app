import { GameId } from '../config/release';
import { Session, leaders } from './session';
import { Ledger, Player, PlayerId } from './types';

export type HistoryPlayer = { id: PlayerId; name: string; emoji: string; score: number };
export type HistoryRecord = {
  id: string;
  date: string;
  winnerIds: PlayerId[];
  gameIds: GameId[];
  players: HistoryPlayer[];
};
export type Career = { sessions: number; wins: number; currentStreak: number; longestStreak: number };
export function updateCareer(
  career: Readonly<Record<PlayerId, Career>>, activeIds: readonly PlayerId[], winners: readonly PlayerId[],
): Record<PlayerId, Career> {
  const next = { ...career };
  for (const id of activeIds) {
    const previous = next[id] ?? { sessions: 0, wins: 0, currentStreak: 0, longestStreak: 0 };
    const won = winners.includes(id);
    const currentStreak = won ? previous.currentStreak + 1 : 0;
    next[id] = { sessions: previous.sessions + 1, wins: previous.wins + Number(won),
      currentStreak, longestStreak: Math.max(previous.longestStreak, currentStreak) };
  }
  return next;
}
export function makeHistoryRecord(
  session: Session, players: readonly Player[], activeIds: readonly PlayerId[], ledger: Ledger,
  completedAt: number,
): HistoryRecord {
  return { id: String(session.startedAt), date: new Date(completedAt).toISOString(),
    winnerIds: leaders(activeIds, ledger), gameIds: [...session.queue],
    players: players.map((player) => ({ id: player.id, name: player.name, emoji: player.emoji,
      score: ledger.scores[player.id] ?? 0 })) };
}
export function appendHistory(history: readonly HistoryRecord[], record: HistoryRecord): HistoryRecord[] {
  if (history.some((item) => item.id === record.id)) return [...history];
  return [...history, record].slice(-40);
}
export function historySummary(history: readonly HistoryRecord[], id: PlayerId) {
  let wins = 0;
  let streak = 0;
  let longestStreak = 0;
  let sessions = 0;
  for (const record of history) {
    if (!record.players.some((player) => player.id === id)) continue;
    sessions++;
    if (record.winnerIds.includes(id)) {
      wins++; streak++; longestStreak = Math.max(longestStreak, streak);
    } else streak = 0;
  }
  return { sessions, wins, longestStreak };
}
