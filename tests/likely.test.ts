import { createLikely, likelyReducer, voteCounts } from '../src/games/likely/reducer';
import { Participant } from '../src/engine/types';

const people: Participant[] = ['a', 'b', 'c'].map((id) => ({
  id,
  name: id,
  emoji: '🙂',
  color: '#ffffff',
  away: false,
}));

test('top-vote pickers each earn a point, including self-voters, in one result', () => {
  let state = createLikely(people, 1, 4);
  state = likelyReducer(state, { type: 'question', questionId: 'q1', seed: 5 }, people).state;
  let result = likelyReducer(state, { type: 'confirm' }, people);
  state = result.state;
  const picks: Record<string, string> = { a: 'b', b: 'b', c: 'c' };
  for (let i = 0; i < people.length; i++) {
    result = likelyReducer(state, { type: 'vote', targetId: picks[state.turnId!]! }, people);
    state = result.state;
    if (i < people.length - 1) state = likelyReducer(state, { type: 'confirm' }, people).state;
  }
  expect(state.step).toBe('results');
  expect(voteCounts(state.votes)).toEqual({ b: 2, c: 1 });
  expect(result.changes.map((c) => c.playerId).sort()).toEqual(['a', 'b']);
  expect(result.stats).toEqual([{ playerId: 'b', stat: 'gossip', amount: 1 }]);
  expect(likelyReducer(state, { type: 'next' }, people).finished).toBe(true);
});

test('a tie awards all voters who chose tied leaders', () => {
  let state = createLikely(people, 2, 8);
  state = likelyReducer(state, { type: 'question', questionId: 'q1', seed: 9 }, people).state;
  const picks: Record<string, string> = { a: 'b', b: 'c', c: 'a' };
  let result = likelyReducer(state, { type: 'confirm' }, people);
  state = result.state;
  for (let i = 0; i < people.length; i++) {
    result = likelyReducer(state, { type: 'vote', targetId: picks[state.turnId!]! }, people);
    state = result.state;
    if (i < people.length - 1) state = likelyReducer(state, { type: 'confirm' }, people).state;
  }
  expect(result.changes.map((c) => c.playerId).sort()).toEqual(['a', 'b', 'c']);
  expect(result.stats.map((c) => c.playerId).sort()).toEqual(['a', 'b', 'c']);
  expect(result.finished).toBe(false);
});

test('an absent voter can be skipped without casting a vote', () => {
  let state = createLikely(people, 1, 3);
  state = likelyReducer(state, { type: 'question', questionId: 'q1', seed: 4 }, people).state;
  const absent = state.turnId!;
  const active = people.map((p) => ({ ...p, away: p.id === absent }));
  const next = likelyReducer(state, { type: 'skipVoter' }, active);
  expect(next.state.turnId).not.toBe(absent);
  expect(next.state.votes).toEqual({});
  expect(next.changes).toEqual([]);
  const ready = likelyReducer(state, { type: 'confirm' }, active).state;
  expect(likelyReducer(ready, { type: 'vote', targetId: 'a' }, active).state).toBe(ready);
});
