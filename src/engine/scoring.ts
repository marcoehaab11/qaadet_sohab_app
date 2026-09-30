import { Ledger, ScoreChange, StatChange } from './types';

function apply(
  state: Ledger,
  changes: readonly ScoreChange[],
  statChanges: readonly StatChange[],
  sign: 1 | -1,
): Ledger {
  const scores = { ...state.scores };
  const stats = Object.fromEntries(
    Object.entries(state.stats).map(([id, value]) => [id, { ...value }]),
  );
  for (const { playerId, points } of changes) {
    if (!Number.isFinite(points)) throw new Error('Invalid score');
    scores[playerId] = (scores[playerId] ?? 0) + sign * points;
  }
  for (const { playerId, stat, amount } of statChanges) {
    if (!Number.isFinite(amount)) throw new Error('Invalid stat');
    const counters = stats[playerId] ?? {};
    counters[stat] = (counters[stat] ?? 0) + sign * amount;
    stats[playerId] = counters;
  }
  return { ...state, scores, stats };
}
export function addPoints(
  state: Ledger,
  changes: ScoreChange[],
  statChanges: StatChange[] = [],
): Ledger {
  if (!changes.length && !statChanges.length) return state;
  const entry = {
    changes: changes.map((c) => ({ ...c })),
    statChanges: statChanges.map((c) => ({ ...c })),
  };
  return { ...apply(state, changes, statChanges, 1), undo: [...state.undo, entry].slice(-60) };
}
export function undoPoints(state: Ledger): Ledger {
  const last = state.undo.at(-1);
  return last
    ? { ...apply(state, last.changes, last.statChanges, -1), undo: state.undo.slice(0, -1) }
    : state;
}
