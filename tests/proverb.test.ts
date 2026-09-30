import { createProverb, proverbReducer } from '../src/games/proverb/reducer';
import { Participant } from '../src/engine/types';

const players: Participant[] = ['a', 'b'].map((id) => ({
  id, name: id, emoji: '🙂', color: '#ffffff', away: false,
}));
test('first correct proverb answer scores once and advances after reveal', () => {
  let state = createProverb(1, 7);
  state = proverbReducer(state, { type: 'draw', proverbId: 'p1', seed: 8 }, players).state;
  expect(proverbReducer(state, { type: 'answer', playerId: 'a' }, players).changes).toEqual([]);
  state = proverbReducer(state, { type: 'reveal' }, players).state;
  const answer = proverbReducer(state, { type: 'answer', playerId: 'a' }, players);
  expect(answer.changes).toEqual([{ playerId: 'a', points: 1 }]);
  expect(answer.stats).toEqual([{ playerId: 'a', stat: 'elder', amount: 1 }]);
  expect(proverbReducer(answer.state, { type: 'answer', playerId: 'b' }, players).changes).toEqual([]);
  expect(proverbReducer(answer.state, { type: 'next' }, players).finished).toBe(true);
});
test('absent players cannot win and nobody gives no points', () => {
  let state = createProverb(2, 7);
  state = proverbReducer(state, { type: 'draw', proverbId: 'p1', seed: 8 }, players).state;
  state = proverbReducer(state, { type: 'reveal' }, players).state;
  expect(proverbReducer(state, { type: 'answer', playerId: 'b' }, [{ ...players[0]!, away: false }, { ...players[1]!, away: true }]).state).toEqual(state);
  expect(proverbReducer(state, { type: 'answer', playerId: null }, players).changes).toEqual([]);
});
