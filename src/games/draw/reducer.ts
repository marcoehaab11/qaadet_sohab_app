import { Participant, PlayerId, ScoreChange, StatChange } from '../../engine/types';
import { nextPlayer } from '../../engine/players';
import { shuffle } from '../../engine/random';

export type DrawState = {
  step: 'pass' | 'reveal' | 'drawing' | 'turnEnd';
  order: PlayerId[];
  artistId: PlayerId | null;
  wordId: string | null;
  guesserId: PlayerId | null;
  completed: number;
  maximum: number;
  seed: number;
};
export type DrawAction =
  | { type: 'skipTurn' }
  | { type: 'showWord'; wordId: string; seed: number }
  | { type: 'start' }
  | { type: 'guessed'; playerId: PlayerId }
  | { type: 'timeUp' }
  | { type: 'nextTurn' };
export type DrawResult = { state: DrawState; changes: ScoreChange[]; stats: StatChange[]; finished: boolean };

export function createDraw(players: readonly Participant[], turnsPerPlayer: number, seed: number): DrawState {
  const shuffled = shuffle(players.filter((player) => !player.away).map((player) => player.id), seed);
  return { step: 'pass', order: shuffled.items, artistId: nextPlayer(shuffled.items, null, players),
    wordId: null, guesserId: null, completed: 0, maximum: shuffled.items.length * turnsPerPlayer,
    seed: shuffled.seed };
}

export function drawReducer(state: DrawState, action: DrawAction, players: readonly Participant[]): DrawResult {
  const result = (next: DrawState, changes: ScoreChange[] = [], stats: StatChange[] = []): DrawResult =>
    ({ state: next, changes, stats, finished: next.completed >= next.maximum });
  const order = [...state.order, ...players.filter((player) => !player.away && !state.order.includes(player.id))
    .map((player) => player.id)];
  if (action.type === 'skipTurn' && state.step === 'pass')
    return result({ ...state, order, artistId: nextPlayer(order, state.artistId, players) });
  if (action.type === 'showWord' && state.step === 'pass')
    return result({ ...state, wordId: action.wordId, seed: action.seed, step: 'reveal' });
  if (action.type === 'start' && state.step === 'reveal')
    return result({ ...state, step: 'drawing' });
  if (action.type === 'guessed' && state.step === 'drawing' && state.artistId &&
      action.playerId !== state.artistId && players.some((player) => player.id === action.playerId && !player.away))
    return result({ ...state, step: 'turnEnd', guesserId: action.playerId },
      [{ playerId: state.artistId, points: 1 }, { playerId: action.playerId, points: 1 }],
      [{ playerId: state.artistId, stat: 'artist', amount: 1 },
        { playerId: action.playerId, stat: 'guess', amount: 1 }]);
  if (action.type === 'timeUp' && state.step === 'drawing')
    return result({ ...state, step: 'turnEnd' });
  if (action.type === 'nextTurn' && state.step === 'turnEnd')
    return result({ ...state, order, artistId: nextPlayer(order, state.artistId, players),
      wordId: null, guesserId: null, completed: state.completed + 1, step: 'pass' });
  return result(state);
}
