import { Participant, PlayerId, ScoreChange, StatChange } from '../../engine/types';
import { nextPlayer } from '../../engine/players';
import { shuffle } from '../../engine/random';

export type TabooState = {
  step: 'pass' | 'reveal' | 'playing' | 'turnEnd';
  order: PlayerId[];
  actorId: PlayerId | null;
  wordId: string | null;
  completedTurns: number;
  maximumTurns: number;
  seed: number;
};
export type TabooAction =
  | { type: 'skipTurn' }
  | { type: 'showWord'; wordId: string; seed: number }
  | { type: 'start' }
  | { type: 'resolve'; outcome: 'guessed' | 'forbidden' | 'skip'; nextWordId: string; seed: number }
  | { type: 'timeUp' }
  | { type: 'nextTurn' };
export type TabooResult = {
  state: TabooState;
  changes: ScoreChange[];
  stats: StatChange[];
  finished: boolean;
};

export function createTaboo(
  players: readonly Participant[],
  turnsPerPlayer: number,
  seed: number,
): TabooState {
  const shuffled = shuffle(
    players.filter((p) => !p.away).map((p) => p.id),
    seed,
  );
  return {
    step: 'pass',
    order: shuffled.items,
    actorId: nextPlayer(shuffled.items, null, players),
    wordId: null,
    completedTurns: 0,
    maximumTurns: shuffled.items.length * turnsPerPlayer,
    seed: shuffled.seed,
  };
}

export function tabooReducer(
  state: TabooState,
  action: TabooAction,
  players: readonly Participant[],
): TabooResult {
  const result = (
    next: TabooState,
    changes: ScoreChange[] = [],
    stats: StatChange[] = [],
  ): TabooResult => ({
    state: next,
    changes,
    stats,
    finished: next.completedTurns >= next.maximumTurns,
  });
  const order = [
    ...state.order,
    ...players.filter((p) => !p.away && !state.order.includes(p.id)).map((p) => p.id),
  ];
  if (action.type === 'skipTurn' && state.step === 'pass')
    return result({ ...state, order, actorId: nextPlayer(order, state.actorId, players) });
  if (action.type === 'showWord' && state.step === 'pass')
    return result({ ...state, wordId: action.wordId, seed: action.seed, step: 'reveal' });
  if (action.type === 'start' && state.step === 'reveal')
    return result({ ...state, step: 'playing' });
  if (action.type === 'resolve' && state.step === 'playing' && state.actorId) {
    const changes: ScoreChange[] =
      action.outcome === 'skip'
        ? []
        : [{ playerId: state.actorId, points: action.outcome === 'guessed' ? 1 : -1 }];
    const stats: StatChange[] =
      action.outcome === 'skip'
        ? []
        : [
            {
              playerId: state.actorId,
              stat: action.outcome === 'guessed' ? 'tongue' : 'oops',
              amount: 1,
            },
          ];
    return result({ ...state, wordId: action.nextWordId, seed: action.seed }, changes, stats);
  }
  if (action.type === 'timeUp' && state.step === 'playing')
    return result({ ...state, step: 'turnEnd' });
  if (action.type === 'nextTurn' && state.step === 'turnEnd')
    return result({
      ...state,
      order,
      actorId: nextPlayer(order, state.actorId, players),
      wordId: null,
      completedTurns: state.completedTurns + 1,
      step: 'pass',
    });
  return result(state);
}
