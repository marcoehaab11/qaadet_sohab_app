import { Participant, PlayerId, ScoreChange, StatChange } from '../../engine/types';

export type SpeedState = {
  step: 'ready' | 'countdown' | 'buzz' | 'confirm' | 'result';
  challengeId: string | null;
  buzzedId: PlayerId | null;
  excludedIds: PlayerId[];
  winnerId: PlayerId | null;
  completed: number;
  maximum: number;
  seed: number;
};
export type SpeedAction =
  | { type: 'challenge'; challengeId: string; seed: number }
  | { type: 'start' }
  | { type: 'buzz'; playerId: PlayerId }
  | { type: 'confirm'; correct: boolean }
  | { type: 'nobody' }
  | { type: 'next' };
export type SpeedResult = {
  state: SpeedState;
  changes: ScoreChange[];
  stats: StatChange[];
  finished: boolean;
};

export function createSpeed(maximum: number, seed: number): SpeedState {
  return {
    step: 'ready',
    challengeId: null,
    buzzedId: null,
    excludedIds: [],
    winnerId: null,
    completed: 0,
    maximum,
    seed,
  };
}

export function speedReducer(
  state: SpeedState,
  action: SpeedAction,
  players: readonly Participant[],
): SpeedResult {
  const result = (
    next: SpeedState,
    changes: ScoreChange[] = [],
    stats: StatChange[] = [],
  ): SpeedResult => ({ state: next, changes, stats, finished: next.completed >= next.maximum });
  if (action.type === 'challenge' && state.step === 'ready')
    return result({
      ...state,
      challengeId: action.challengeId,
      seed: action.seed,
      step: 'countdown',
    });
  if (action.type === 'start' && state.step === 'countdown')
    return result({ ...state, step: 'buzz' });
  if (action.type === 'buzz' && state.step === 'buzz') {
    if (
      state.excludedIds.includes(action.playerId) ||
      !players.some((p) => p.id === action.playerId && !p.away)
    )
      return result(state);
    return result({ ...state, buzzedId: action.playerId, step: 'confirm' });
  }
  if (action.type === 'confirm' && state.step === 'confirm' && state.buzzedId) {
    if (action.correct)
      return result(
        { ...state, winnerId: state.buzzedId, step: 'result' },
        [{ playerId: state.buzzedId, points: 1 }],
        [{ playerId: state.buzzedId, stat: 'flash', amount: 1 }],
      );
    return result({
      ...state,
      excludedIds: [...state.excludedIds, state.buzzedId],
      buzzedId: null,
      step: 'buzz',
    });
  }
  if (action.type === 'nobody' && state.step === 'buzz')
    return result({ ...state, winnerId: null, step: 'result' });
  if (action.type === 'next' && state.step === 'result')
    return result({
      ...state,
      challengeId: null,
      buzzedId: null,
      excludedIds: [],
      winnerId: null,
      completed: state.completed + 1,
      step: 'ready',
    });
  return result(state);
}
