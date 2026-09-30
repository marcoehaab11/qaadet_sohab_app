import { random } from './random';
import { Ledger, PlayerId, ScoreChange } from './types';

export type Surprise = 'double' | 'steal' | 'gift';
export function eventScores(changes: readonly ScoreChange[], event: Surprise | undefined): ScoreChange[] {
  return changes.map((change) => ({ ...change, points: change.points * (event === 'double' ? 2 : 1) }));
}
export function planSurprises(length: number, seed: number, enabled: boolean): Record<number, Surprise> {
  if (!enabled) return {};
  const events: Record<number, Surprise> = {};
  let hasEvent = false;
  for (let index = 1; index < length; index++) {
    const chance = random(seed); seed = chance.seed;
    const selected = chance.value < 0.45 || (length === 5 && index === length - 1 && !hasEvent);
    if (!selected) continue;
    const type = random(seed); seed = type.seed;
    events[index] = (['double', 'steal', 'gift'] as const)[Math.floor(type.value * 3)]!;
    hasEvent = true;
  }
  return events;
}

export type SurpriseProgress = { applied: number[] };
export function applyHostSurprise(
  progress: SurpriseProgress, index: number, event: Surprise | undefined,
  activeIds: readonly PlayerId[], ledger: Ledger, seed: number,
): { progress: SurpriseProgress; changes: ScoreChange[] } {
  if (!event || progress.applied.includes(index)) return { progress, changes: [] };
  const next = { applied: [...progress.applied, index] };
  if (event === 'double' || !activeIds.length) return { progress: next, changes: [] };
  const min = Math.min(...activeIds.map((id) => ledger.scores[id] ?? 0));
  const last = activeIds.filter((id) => (ledger.scores[id] ?? 0) === min);
  const lastId = last[Math.floor(random(seed + index).value * last.length)]!;
  if (event === 'gift') return { progress: next, changes: [{ playerId: lastId, points: 1 }] };
  const max = Math.max(...activeIds.map((id) => ledger.scores[id] ?? 0));
  if (max <= min) return { progress: next, changes: [{ playerId: lastId, points: 1 }] };
  const first = activeIds.filter((id) => (ledger.scores[id] ?? 0) === max);
  const firstId = first[Math.floor(random(seed + index + 1).value * first.length)]!;
  return { progress: next, changes: [{ playerId: firstId, points: -1 }, { playerId: lastId, points: 1 }] };
}
