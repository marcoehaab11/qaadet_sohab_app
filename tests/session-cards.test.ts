import {
  createSession,
  currentGame,
  finishCurrentGame,
  leaders,
  startCurrentGame,
} from '../src/engine/session';
import { addPoints } from '../src/engine/scoring';
import { emptyLedger, Participant } from '../src/engine/types';
import { availableDeck, cardsReducer, createCards } from '../src/games/cards/reducer';

test('family mode and deleted custom cards fall back to friends deck', () => {
  expect(availableDeck('couples', true, 0)).toBe('friends');
  expect(availableDeck('couples', false, 0)).toBe('couples');
  expect(availableDeck('custom', false, 0)).toBe('friends');
  expect(availableDeck('custom', true, 1)).toBe('custom');
});
const people: Participant[] = ['a', 'b', 'c'].map((id) => ({
  id,
  name: id,
  emoji: '🦊',
  color: '#ffffff',
  away: false,
}));
test('session advances once per game and ends only after its queue', () => {
  let session = createSession('friends', 3, 3, 123);
  expect(session.queue).toHaveLength(3);
  for (let i = 0; i < 3; i++) {
    expect(currentGame(session)).not.toBeNull();
    session = startCurrentGame(session);
    expect(session.phase).toBe('game');
    session = finishCurrentGame(session);
  }
  expect(session.finished).toBe(true);
  expect(session.phase).toBe('results');
  expect(finishCurrentGame(session)).toBe(session);
});
test('all tied leaders are shown, away players can be excluded by caller', () => {
  const ledger = addPoints(emptyLedger(), [
    { playerId: 'a', points: 3 },
    { playerId: 'b', points: 3 },
    { playerId: 'c', points: 8 },
  ]);
  expect(leaders(['a', 'b'], ledger)).toEqual(['a', 'b']);
});
test('cards award +1 brave on done and chicken only when skipped', () => {
  let state = createCards(people, 2, 7);
  state = cardsReducer(state, { type: 'start' }, people).state;
  const first = state.turnId!;
  state = cardsReducer(state, { type: 'confirm' }, people).state;
  state = cardsReducer(state, { type: 'flip', cardId: 'x', seed: 9 }, people).state;
  const done = cardsReducer(state, { type: 'complete', done: true }, people);
  expect(done.changes).toEqual([{ playerId: first, points: 1 }]);
  expect(done.stats).toEqual([{ playerId: first, stat: 'brave', amount: 1 }]);
  state = cardsReducer(done.state, { type: 'confirm' }, people).state;
  state = cardsReducer(state, { type: 'flip', cardId: 'y', seed: 10 }, people).state;
  const skipped = cardsReducer(state, { type: 'complete', done: false }, people);
  expect(skipped.changes).toEqual([]);
  expect(skipped.stats[0]?.stat).toBe('chicken');
  expect(skipped.finished).toBe(true);
});
test('card turn advance checks away players on the current step', () => {
  let state = createCards(people, 2, 1);
  state = cardsReducer(state, { type: 'start' }, people).state;
  state = cardsReducer(state, { type: 'confirm' }, people).state;
  state = cardsReducer(state, { type: 'flip', cardId: 'x', seed: 5 }, people).state;
  const nextId = state.order[(state.order.indexOf(state.turnId!) + 1) % state.order.length]!;
  const next = cardsReducer(
    state,
    { type: 'complete', done: false },
    people.map((p) => ({ ...p, away: p.id === nextId })),
  );
  expect(next.state.turnId).not.toBe(nextId);
});
test('skipping an absent player does not consume a card, and a newcomer joins the order', () => {
  let state = createCards(people, 2, 1);
  state = cardsReducer(state, { type: 'start' }, people).state;
  const absent = state.turnId!;
  const newcomer = { ...people[0]!, id: 'new' };
  const result = cardsReducer(state, { type: 'skipTurn' }, [
    ...people.map((p) => ({ ...p, away: p.id === absent })),
    newcomer,
  ]);
  expect(result.state.completed).toBe(0);
  expect(result.state.turnId).not.toBe(absent);
  expect(result.state.order).toContain('new');
  expect(result.changes).toEqual([]);
});
