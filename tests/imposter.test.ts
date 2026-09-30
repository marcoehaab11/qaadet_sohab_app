import { createImposter, imposterReducer, ImposterState } from '../src/games/imposter/reducer';
import { Participant } from '../src/engine/types';

const people: Participant[] = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({
  id,
  name: id,
  emoji: '🙂',
  color: '#ffffff',
  away: false,
}));
const start = (state: ImposterState, players = people) =>
  imposterReducer(
    state,
    {
      type: 'begin',
      wordId: 'w1',
      imposterWord: 'قهوة',
      options: ['شاي', 'قهوة', 'عصير', 'لبن'],
      seed: 12,
    },
    players,
    null,
  ).state;
const revealAll = (input: ImposterState, players = people) => {
  let state = input;
  for (let i = 0; i < state.order.length; i++) {
    state = imposterReducer(state, { type: 'confirmRole' }, players, 'شاي').state;
    state = imposterReducer(state, { type: 'nextRole' }, players, 'شاي').state;
  }
  return imposterReducer(state, { type: 'endDiscussion' }, players, 'شاي').state;
};

test('classic caught imposter awards non-imposters then a correct word guess awards caught player', () => {
  let state = start(createImposter(1));
  expect(state.imposters).toHaveLength(1);
  expect(new Set(state.order).size).toBe(6);
  state = revealAll(state);
  expect(state.step).toBe('vote');
  state = imposterReducer(
    state,
    { type: 'toggleSuspect', playerId: state.imposters[0]! },
    people,
    'شاي',
  ).state;
  const vote = imposterReducer(state, { type: 'confirmVote' }, people, 'شاي');
  expect(vote.state.step).toBe('guess');
  expect(vote.changes).toHaveLength(5);
  expect(vote.changes.every((c) => c.points === 1 && !state.imposters.includes(c.playerId))).toBe(
    true,
  );
  expect(vote.stats).toEqual([{ playerId: state.imposters[0]!, stat: 'busted', amount: 1 }]);
  const guessed = imposterReducer(vote.state, { type: 'guess', word: 'شاي' }, people, 'شاي');
  expect(guessed.changes).toEqual([{ playerId: state.imposters[0]!, points: 1 }]);
  expect(guessed.state.step).toBe('result');
  expect(imposterReducer(guessed.state, { type: 'again' }, people, 'شاي').state.round).toBe(2);
});

test('two imposters: caught one rewards group once and escaped one gets +2', () => {
  let state = imposterReducer(createImposter(1), { type: 'count', count: 2 }, people, null).state;
  state = revealAll(start(state));
  state = imposterReducer(
    state,
    { type: 'toggleSuspect', playerId: state.imposters[0]! },
    people,
    'شاي',
  ).state;
  const innocent = state.order.find((id) => !state.imposters.includes(id))!;
  state = imposterReducer(
    state,
    { type: 'toggleSuspect', playerId: innocent },
    people,
    'شاي',
  ).state;
  const vote = imposterReducer(state, { type: 'confirmVote' }, people, 'شاي');
  expect(vote.changes.filter((c) => c.points === 1)).toHaveLength(4);
  expect(vote.changes).toContainEqual({ playerId: state.imposters[1], points: 2 });
  expect(vote.stats).toContainEqual({ playerId: state.imposters[1], stat: 'fox', amount: 1 });
  expect(
    imposterReducer(vote.state, { type: 'guess', word: 'لبن' }, people, 'شاي').changes,
  ).toEqual([]);
});

test('voting needs exact suspect count, and two imposters need six active players', () => {
  const five = people.slice(0, 5);
  let state = imposterReducer(createImposter(1), { type: 'count', count: 2 }, five, null).state;
  expect(start(state, five)).toBe(state);
  state = revealAll(start(createImposter(1)));
  expect(imposterReducer(state, { type: 'confirmVote' }, people, 'شاي').state).toBe(state);
});
