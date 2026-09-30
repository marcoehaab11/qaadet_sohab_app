import { createSpeed, speedReducer } from '../src/games/speed/reducer';
import { Participant } from '../src/engine/types';

const people: Participant[] = ['a', 'b', 'c'].map((id) => ({
  id,
  name: id,
  emoji: '🙂',
  color: '#ffffff',
  away: false,
}));

test('first tap locks, a wrong answer sits out, and next correct player scores', () => {
  let state = createSpeed(2, 1);
  state = speedReducer(state, { type: 'challenge', challengeId: 'x', seed: 2 }, people).state;
  state = speedReducer(state, { type: 'start' }, people).state;
  state = speedReducer(state, { type: 'buzz', playerId: 'a' }, people).state;
  expect(state.step).toBe('confirm');
  expect(speedReducer(state, { type: 'buzz', playerId: 'b' }, people).state).toBe(state);
  state = speedReducer(state, { type: 'confirm', correct: false }, people).state;
  expect(state.excludedIds).toEqual(['a']);
  expect(speedReducer(state, { type: 'buzz', playerId: 'a' }, people).state).toBe(state);
  state = speedReducer(state, { type: 'buzz', playerId: 'b' }, people).state;
  const won = speedReducer(state, { type: 'confirm', correct: true }, people);
  expect(won.changes).toEqual([{ playerId: 'b', points: 1 }]);
  expect(won.stats).toEqual([{ playerId: 'b', stat: 'flash', amount: 1 }]);
  expect(won.state.step).toBe('result');
  const next = speedReducer(won.state, { type: 'next' }, people);
  expect(next.state.completed).toBe(1);
  expect(next.state.excludedIds).toEqual([]);
});

test('absent player cannot buzz and nobody found advances without points', () => {
  let state = createSpeed(1, 1);
  state = speedReducer(state, { type: 'challenge', challengeId: 'x', seed: 2 }, people).state;
  state = speedReducer(state, { type: 'start' }, people).state;
  const present = people.map((p) => ({ ...p, away: p.id === 'a' }));
  expect(speedReducer(state, { type: 'buzz', playerId: 'a' }, present).state).toBe(state);
  const none = speedReducer(state, { type: 'nobody' }, present);
  expect(none.changes).toEqual([]);
  expect(speedReducer(none.state, { type: 'next' }, present).finished).toBe(true);
});
