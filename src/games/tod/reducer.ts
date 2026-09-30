import { Participant, PlayerId, ScoreChange, StatChange } from '../../engine/types';
import { nextPlayer } from '../../engine/players';
import { shuffle } from '../../engine/random';

export type Level = 'chill' | 'funny' | 'bold' | 'chaos';
export type Kind = 'truth' | 'dare';
export type TodState = {
  level: Level;
  step: 'level' | 'pass' | 'choice' | 'prompt';
  order: PlayerId[];
  turnId: PlayerId | null;
  kind: Kind | null;
  promptId: string | null;
  completed: number;
  maximum: number;
  seed: number;
};
export type TodAction =
  | { type: 'level'; level: Level }
  | { type: 'start' }
  | { type: 'skipTurn' }
  | { type: 'confirm' }
  | { type: 'choose'; kind: Kind; promptId: string; seed: number }
  | { type: 'complete'; done: boolean };
export type TodResult = {
  state: TodState;
  changes: ScoreChange[];
  stats: StatChange[];
  finished: boolean;
};

export function createTod(players: readonly Participant[], turns: number, seed: number): TodState {
  const order = shuffle(
    players.filter((p) => !p.away).map((p) => p.id),
    seed,
  );
  return {
    level: 'chill',
    step: 'level',
    order: order.items,
    turnId: null,
    kind: null,
    promptId: null,
    completed: 0,
    maximum: order.items.length * turns,
    seed: order.seed,
  };
}

export function todReducer(
  state: TodState,
  action: TodAction,
  players: readonly Participant[],
): TodResult {
  const result = (
    next: TodState,
    changes: ScoreChange[] = [],
    stats: StatChange[] = [],
  ): TodResult => ({ state: next, changes, stats, finished: next.completed >= next.maximum });
  const order = [
    ...state.order,
    ...players.filter((p) => !p.away && !state.order.includes(p.id)).map((p) => p.id),
  ];
  if (action.type === 'level' && state.step === 'level')
    return result({ ...state, level: action.level });
  if (action.type === 'start' && state.step === 'level')
    return result({ ...state, order, step: 'pass', turnId: nextPlayer(order, null, players) });
  if (action.type === 'skipTurn' && state.step === 'pass')
    return result({ ...state, order, turnId: nextPlayer(order, state.turnId, players) });
  if (action.type === 'confirm' && state.step === 'pass')
    return result({ ...state, step: 'choice' });
  if (action.type === 'choose' && state.step === 'choice')
    return result({
      ...state,
      kind: action.kind,
      promptId: action.promptId,
      seed: action.seed,
      step: 'prompt',
    });
  if (action.type === 'complete' && state.step === 'prompt' && state.turnId) {
    return result(
      {
        ...state,
        order,
        completed: state.completed + 1,
        turnId: nextPlayer(order, state.turnId, players),
        kind: null,
        promptId: null,
        step: 'pass',
      },
      action.done ? [{ playerId: state.turnId, points: 1 }] : [],
      [{ playerId: state.turnId, stat: action.done ? 'brave' : 'chicken', amount: 1 }],
    );
  }
  return result(state);
}
