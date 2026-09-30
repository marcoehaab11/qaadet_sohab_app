import { createCharades, charadesReducer } from '../src/games/charades/reducer';
import { Participant } from '../src/engine/types';

const people: Participant[] = ['a', 'b', 'c'].map((id) => ({
  id,
  name: id,
  emoji: '🙂',
  color: '#ffffff',
  away: false,
}));

test('first correct guesser and actor get one point each, once', () => {
  let state = createCharades(people, 2, 1);
  const actor = state.actorId!;
  const guesser = people.find((p) => p.id !== actor)!;
  state = charadesReducer(state, { type: 'showScene', sceneId: 's1', seed: 2 }, people).state;
  state = charadesReducer(state, { type: 'start' }, people).state;
  const result = charadesReducer(state, { type: 'guessed', playerId: guesser.id }, people);
  expect(result.changes).toEqual([
    { playerId: actor, points: 1 },
    { playerId: guesser.id, points: 1 },
  ]);
  expect(result.stats).toEqual([
    { playerId: actor, stat: 'act', amount: 1 },
    { playerId: guesser.id, stat: 'guess', amount: 1 },
  ]);
  expect(result.state.step).toBe('turnEnd');
  expect(
    charadesReducer(result.state, { type: 'guessed', playerId: guesser.id }, people).changes,
  ).toEqual([]);
  const next = charadesReducer(result.state, { type: 'nextTurn' }, people);
  expect(next.state.actorId).not.toBe(actor);
  expect(next.state.sceneId).toBeNull();
});

test('actor cannot score as own guesser and time up gives no points', () => {
  let state = createCharades(people, 1, 1);
  state = charadesReducer(state, { type: 'showScene', sceneId: 's1', seed: 2 }, people).state;
  state = charadesReducer(state, { type: 'start' }, people).state;
  expect(charadesReducer(state, { type: 'guessed', playerId: state.actorId! }, people).state).toBe(
    state,
  );
  const timeout = charadesReducer(state, { type: 'timeUp' }, people);
  expect(timeout.changes).toEqual([]);
  expect(charadesReducer(timeout.state, { type: 'nextTurn' }, people).finished).toBe(true);
});

test('absent actor can be skipped without consuming a turn', () => {
  const state = createCharades(people, 1, 1);
  const result = charadesReducer(
    state,
    { type: 'skipTurn' },
    people.map((p) => ({ ...p, away: p.id === state.actorId })),
  );
  expect(result.state.actorId).not.toBe(state.actorId);
  expect(result.state.completed).toBe(0);
});
