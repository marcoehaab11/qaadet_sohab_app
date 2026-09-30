import { Participant, PlayerId, ScoreChange, StatChange } from '../../engine/types';

export type ProverbState = {
  step: 'ready' | 'show' | 'revealed' | 'result';
  proverbId: string | null;
  winnerId: PlayerId | null;
  completed: number;
  maximum: number;
  seed: number;
};
export type ProverbAction =
  | { type: 'draw'; proverbId: string; seed: number }
  | { type: 'reveal' }
  | { type: 'answer'; playerId: PlayerId | null }
  | { type: 'next' };
export type ProverbResult = {
  state: ProverbState;
  changes: ScoreChange[];
  stats: StatChange[];
  finished: boolean;
};

export function createProverb(maximum: number, seed: number): ProverbState {
  return { step: 'ready', proverbId: null, winnerId: null, completed: 0, maximum, seed };
}

export function proverbReducer(
  state: ProverbState,
  action: ProverbAction,
  players: readonly Participant[],
): ProverbResult {
  const result = (next: ProverbState, changes: ScoreChange[] = [], stats: StatChange[] = []): ProverbResult =>
    ({ state: next, changes, stats, finished: next.completed >= next.maximum });
  if (action.type === 'draw' && state.step === 'ready')
    return result({ ...state, proverbId: action.proverbId, seed: action.seed, step: 'show' });
  if (action.type === 'reveal' && state.step === 'show')
    return result({ ...state, step: 'revealed' });
  if (action.type === 'answer' && state.step === 'revealed') {
    if (action.playerId && !players.some((p) => p.id === action.playerId && !p.away)) return result(state);
    return result(
      { ...state, winnerId: action.playerId, step: 'result' },
      action.playerId ? [{ playerId: action.playerId, points: 1 }] : [],
      action.playerId ? [{ playerId: action.playerId, stat: 'elder', amount: 1 }] : [],
    );
  }
  if (action.type === 'next' && state.step === 'result')
    return result({ ...state, step: 'ready', proverbId: null, winnerId: null, completed: state.completed + 1 });
  return result(state);
}
