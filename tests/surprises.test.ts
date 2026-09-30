import { applyHostSurprise, eventScores, planSurprises } from '../src/engine/surprises';
import { emptyLedger } from '../src/engine/types';

test('five-game sessions always get an event when surprises enabled', () => {
  for (let seed = 0; seed < 100; seed++)
    expect(Object.keys(planSurprises(5, seed, true)).length).toBeGreaterThanOrEqual(1);
  expect(planSurprises(5, 7, false)).toEqual({});
  expect(Object.keys(planSurprises(3, 7, true)).every((key) => Number(key) > 0)).toBe(true);
});
test('host event is idempotent; steal falls back to gift on tie', () => {
  const ledger = { ...emptyLedger(), scores: { a: 5, b: 1 } };
  const first = applyHostSurprise({ applied: [] }, 1, 'steal', ['a', 'b'], ledger, 17);
  expect(first.changes).toEqual([{ playerId: 'a', points: -1 }, { playerId: 'b', points: 1 }]);
  expect(applyHostSurprise(first.progress, 1, 'steal', ['a', 'b'], ledger, 17).changes).toEqual([]);
  expect(applyHostSurprise({ applied: [] }, 2, 'steal', ['a', 'b'], emptyLedger(), 17).changes).toHaveLength(1);
});
test('double event multiplies positive and negative points', () => {
  expect(eventScores([{ playerId: 'a', points: 1 }, { playerId: 'b', points: -1 }], 'double'))
    .toEqual([{ playerId: 'a', points: 2 }, { playerId: 'b', points: -2 }]);
  expect(eventScores([{ playerId: 'a', points: -1 }], 'gift'))
    .toEqual([{ playerId: 'a', points: -1 }]);
});
