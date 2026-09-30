import { createSession, finishWithTie } from '../src/engine/session';
import { emptyLedger } from '../src/engine/types';
import { createSpeed, speedReducer } from '../src/games/speed/reducer';

const players = ['a', 'b'].map((id) => ({ id, name: id, emoji: '🙂', color: '#ffffff', away: false }));
test('final game with tied leaders enters tiebreak; clear winner goes to results', () => {
  const session = createSession('random', 3, 2, 17);
  session.index = session.queue.length - 1;
  session.phase = 'game';
  expect(finishWithTie(session, ['a', 'b'], emptyLedger()).phase).toBe('tiebreak');
  expect(finishWithTie(session, ['a', 'b'], { ...emptyLedger(), scores: { a: 2, b: 1 } }).phase).toBe('results');
  expect(finishWithTie(session, ['a'], emptyLedger()).phase).toBe('results');
});
test('wrong tiebreak claim excludes claimant; another player can win', () => {
  let state = createSpeed(1, 17);
  state = speedReducer(state, { type: 'challenge', challengeId: 'q', seed: 18 }, players).state;
  state = speedReducer(state, { type: 'start' }, players).state;
  state = speedReducer(state, { type: 'buzz', playerId: 'a' }, players).state;
  state = speedReducer(state, { type: 'confirm', correct: false }, players).state;
  expect(speedReducer(state, { type: 'buzz', playerId: 'a' }, players).state).toEqual(state);
  state = speedReducer(state, { type: 'buzz', playerId: 'b' }, players).state;
  expect(speedReducer(state, { type: 'confirm', correct: true }, players).changes)
    .toEqual([{ playerId: 'b', points: 1 }]);
});
