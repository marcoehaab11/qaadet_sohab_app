import { createTod, todReducer } from '../src/games/tod/reducer';
import { Participant } from '../src/engine/types';
import { loadContent } from '../src/content/loader';

const people: Participant[] = ['a', 'b', 'c'].map((id) => ({
  id,
  name: id,
  emoji: '🙂',
  color: '#ffffff',
  away: false,
}));

test('truth or dare rotates for the configured number of turns and scores done/skip', () => {
  let state = createTod(people, 1, 42);
  expect(state.maximum).toBe(3);
  state = todReducer(state, { type: 'level', level: 'funny' }, people).state;
  state = todReducer(state, { type: 'start' }, people).state;
  const first = state.turnId!;
  state = todReducer(state, { type: 'confirm' }, people).state;
  state = todReducer(
    state,
    { type: 'choose', kind: 'truth', promptId: 'x', seed: 9 },
    people,
  ).state;
  const done = todReducer(state, { type: 'complete', done: true }, people);
  expect(done.changes).toEqual([{ playerId: first, points: 1 }]);
  expect(done.stats).toEqual([{ playerId: first, stat: 'brave', amount: 1 }]);
  state = done.state;
  expect(state.turnId).not.toBe(first);
  state = todReducer(state, { type: 'confirm' }, people).state;
  state = todReducer(
    state,
    { type: 'choose', kind: 'dare', promptId: 'y', seed: 10 },
    people,
  ).state;
  const skipped = todReducer(state, { type: 'complete', done: false }, people);
  expect(skipped.changes).toEqual([]);
  expect(skipped.stats[0]?.stat).toBe('chicken');
  state = todReducer(skipped.state, { type: 'confirm' }, people).state;
  state = todReducer(
    state,
    { type: 'choose', kind: 'truth', promptId: 'z', seed: 11 },
    people,
  ).state;
  expect(todReducer(state, { type: 'complete', done: true }, people).finished).toBe(true);
});

test('absent player can be skipped without consuming a turn and late joiner enters order', () => {
  let state = createTod(people, 1, 42);
  state = todReducer(state, { type: 'start' }, people).state;
  const absent = state.turnId!;
  const nextPeople = [
    ...people.map((p) => ({ ...p, away: p.id === absent })),
    { ...people[0]!, id: 'new' },
  ];
  const next = todReducer(state, { type: 'skipTurn' }, nextPeople);
  expect(next.state.turnId).not.toBe(absent);
  expect(next.state.completed).toBe(0);
  expect(next.state.order).toContain('new');
});

test('family content excludes bold and chaos truth or dare prompts', () => {
  const items = loadContent('tod', true);
  expect(items.length).toBeGreaterThan(0);
  expect(items.some((item) => item.level === 'bold' || item.level === 'chaos')).toBe(false);
});
