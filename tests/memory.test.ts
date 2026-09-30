import { createMemory, memoryReducer } from '../src/games/memory/reducer';
import { Participant } from '../src/engine/types';

const players: Participant[] = ['a', 'b'].map((id) => ({ id, name: id, emoji: '🙂', color: '#ffffff', away: false }));
test('memory round reveals answer and scores only one correct response', () => {
  let state = memoryReducer(createMemory(1, 6, 7), { type: 'start' }, players).state;
  expect(state.sequence).toHaveLength(6);
  expect(state.playerId).toBe('a');
  state = memoryReducer(state, { type: 'hide' }, players).state;
  const answer = memoryReducer(state, { type: 'answer', index: state.target }, players);
  expect(answer.changes).toEqual([{ playerId: 'a', points: 1 }]);
  expect(answer.stats).toEqual([{ playerId: 'a', stat: 'mem', amount: 1 }]);
  expect(memoryReducer(answer.state, { type: 'answer', index: state.target }, players).changes).toEqual([]);
  expect(memoryReducer(answer.state, { type: 'next' }, players).finished).toBe(true);
});
test('missing symbol question and absent player rotation', () => {
  let state = createMemory(3, 9, 13);
  state = { ...state, completed: 1 };
  state = memoryReducer(state, { type: 'start' }, players).state;
  expect(state.mode).toBe('missing');
  expect(state.playerId).toBe('b');
  state = memoryReducer(state, { type: 'hide' }, players).state;
  const wrong = memoryReducer(state, { type: 'answer', index: 99 }, players);
  expect(wrong.changes).toEqual([]);
  const awayState = memoryReducer(createMemory(3, 6, 7), { type: 'start' }, [{ ...players[0]!, away: true }, players[1]!]).state;
  expect(awayState.playerId).toBe('b');
  expect(memoryReducer(state, { type: 'answer', index: state.options.indexOf(state.sequence[state.target]!) },
    [players[0]!, { ...players[1]!, away: true }]).changes).toEqual([]);
});
