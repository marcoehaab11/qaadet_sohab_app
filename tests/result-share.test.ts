import { rankedResults, resultShareText } from '../src/engine/resultShare';
import { Player } from '../src/engine/types';

const players: Player[] = [
  { id: 'a', name: 'سارة', emoji: '🦊', color: '#fff' },
  { id: 'b', name: 'مروان', emoji: '🐼', color: '#fff' },
  { id: 'c', name: 'ليلى', emoji: '🐸', color: '#fff' },
];

test('share standings include only present players and keep ties in seating order', () => {
  expect(rankedResults(players, ['b', 'a'], { a: 3, b: 3, c: 99 }).map((p) => p.id)).toEqual(['b', 'a']);
  const message = resultShareText(players, ['b', 'a'], { a: 3, b: 3, c: 99 }, [
    { stat: 'guess', value: 2, playerIds: ['a'] },
  ]);
  expect(message).toContain('1. 🐼 مروان — 3 نقطة');
  expect(message).toContain('2. 🦊 سارة — 3 نقطة');
  expect(message).not.toContain('ليلى');
  expect(message).toContain('بيفهمها وهي طايرة: سارة');
  expect(message).toContain('#قعدة_صحاب');
});
