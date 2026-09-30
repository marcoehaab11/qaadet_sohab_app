import { createTaboo, tabooReducer } from '../src/games/taboo/reducer';
import { Participant } from '../src/engine/types';

const people: Participant[] = ['a', 'b', 'c'].map((id) => ({
  id,
  name: id,
  emoji: '🙂',
  color: '#ffffff',
  away: false,
}));

test('guessed scores +1, forbidden scores -1, skip is free, all during one timed turn', () => {
  let state = createTaboo(people, 1, 3);
  const actor = state.actorId!;
  state = tabooReducer(state, { type: 'showWord', wordId: 'one', seed: 4 }, people).state;
  state = tabooReducer(state, { type: 'start' }, people).state;
  const guessed = tabooReducer(
    state,
    { type: 'resolve', outcome: 'guessed', nextWordId: 'two', seed: 5 },
    people,
  );
  expect(guessed.changes).toEqual([{ playerId: actor, points: 1 }]);
  expect(guessed.stats[0]?.stat).toBe('tongue');
  const forbidden = tabooReducer(
    guessed.state,
    { type: 'resolve', outcome: 'forbidden', nextWordId: 'three', seed: 6 },
    people,
  );
  expect(forbidden.changes).toEqual([{ playerId: actor, points: -1 }]);
  expect(forbidden.stats[0]?.stat).toBe('oops');
  const skipped = tabooReducer(
    forbidden.state,
    { type: 'resolve', outcome: 'skip', nextWordId: 'four', seed: 7 },
    people,
  );
  expect(skipped.changes).toEqual([]);
  expect(skipped.stats).toEqual([]);
  expect(skipped.state.wordId).toBe('four');
  state = tabooReducer(skipped.state, { type: 'timeUp' }, people).state;
  expect(state.step).toBe('turnEnd');
  const next = tabooReducer(state, { type: 'nextTurn' }, people);
  expect(next.state.actorId).not.toBe(actor);
  expect(next.state.completedTurns).toBe(1);
});

test('absent actor skips without consuming a turn', () => {
  const state = createTaboo(people, 1, 3);
  const next = tabooReducer(
    state,
    { type: 'skipTurn' },
    people.map((p) => ({ ...p, away: p.id === state.actorId })),
  );
  expect(next.state.actorId).not.toBe(state.actorId);
  expect(next.state.completedTurns).toBe(0);
});
