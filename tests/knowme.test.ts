import { createKnowMe, knowMeReducer } from '../src/games/knowme/reducer';
import { Participant } from '../src/engine/types';

const people: Participant[] = ['a', 'b', 'c'].map((id) => ({
  id,
  name: id,
  emoji: '🙂',
  color: '#ffffff',
  away: false,
}));

test('private answer stays in state until reveal and multiple correct guessers score together', () => {
  let state = createKnowMe(people, 2, 12);
  state = knowMeReducer(state, { type: 'question', promptId: 'q1', seed: 13 }, people).state;
  const firstSubject = state.subjectId!;
  state = knowMeReducer(state, { type: 'confirm' }, people).state;
  state = knowMeReducer(state, { type: 'writeAnswer', answer: '  الشاي  ' }, people).state;
  state = knowMeReducer(state, { type: 'saveAnswer' }, people).state;
  expect(state.step).toBe('guess');
  expect(state.answer).toBe('الشاي');
  state = knowMeReducer(state, { type: 'reveal' }, people).state;
  const guessers = people.filter((p) => p.id !== firstSubject).map((p) => p.id);
  for (const playerId of guessers)
    state = knowMeReducer(state, { type: 'toggleCorrect', playerId }, people).state;
  expect(
    knowMeReducer(state, { type: 'toggleCorrect', playerId: firstSubject }, people).state,
  ).toBe(state);
  const result = knowMeReducer(state, { type: 'complete' }, people);
  expect(result.changes.map((c) => c.playerId).sort()).toEqual(guessers.sort());
  expect(result.stats.every((c) => c.stat === 'guess')).toBe(true);
  expect(result.state.answer).toBe('');
  state = knowMeReducer(result.state, { type: 'question', promptId: 'q2', seed: 14 }, people).state;
  expect(state.subjectId).not.toBe(firstSubject);
});

test('answer is optional and removed guessers do not score', () => {
  let state = createKnowMe(people, 1, 1);
  state = knowMeReducer(state, { type: 'question', promptId: 'q1', seed: 2 }, people).state;
  state = knowMeReducer(state, { type: 'confirm' }, people).state;
  state = knowMeReducer(state, { type: 'saveAnswer' }, people).state;
  state = knowMeReducer(state, { type: 'reveal' }, people).state;
  const guesser = people.find((p) => p.id !== state.subjectId)!;
  state = knowMeReducer(state, { type: 'toggleCorrect', playerId: guesser.id }, people).state;
  const afterAway = people.map((p) => ({ ...p, away: p.id === guesser.id }));
  const result = knowMeReducer(state, { type: 'complete' }, afterAway);
  expect(result.changes).toEqual([]);
  expect(result.finished).toBe(true);
});

test('skipping an absent subject keeps the current question', () => {
  let state = createKnowMe(people, 1, 3);
  state = knowMeReducer(state, { type: 'question', promptId: 'q1', seed: 4 }, people).state;
  const absent = state.subjectId;
  const next = knowMeReducer(
    state,
    { type: 'skipTurn' },
    people.map((p) => ({ ...p, away: p.id === absent })),
  );
  expect(next.state.subjectId).not.toBe(absent);
  expect(next.state.promptId).toBe('q1');
  expect(next.state.completed).toBe(0);
});
