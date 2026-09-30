import { lowestScorers, sessionAwards } from '../src/engine/awards';
import { Ledger } from '../src/engine/types';

const ledger: Ledger = { scores: { a: 5, b: 1, c: 1 }, stats: {
  a: { act: 3, guess: 1 }, b: { act: 3, guess: 2 }, c: { guess: 2 },
}, undo: [] };
test('awards show up to two tied names sorted by value and hide zero counters', () => {
  expect(sessionAwards(['a', 'b', 'c'], ledger)).toEqual([
    { stat: 'act', value: 3, playerIds: ['a', 'b'] },
    { stat: 'guess', value: 2, playerIds: ['b', 'c'] },
  ]);
  expect(sessionAwards(['a', 'b', 'c'], ledger, 1)).toHaveLength(1);
  expect(sessionAwards(['c'], { ...ledger, stats: {} })).toEqual([]);
});
test('punishment pool uses lowest active scorers including ties', () => {
  expect(lowestScorers(['a', 'b', 'c'], ledger)).toEqual(['b', 'c']);
  expect(lowestScorers(['a', 'c'], ledger)).toEqual(['c']);
});
