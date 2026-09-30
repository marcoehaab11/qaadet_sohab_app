import { Participant, PlayerId, ScoreChange, StatChange } from '../../engine/types';
import { shuffle } from '../../engine/random';

export type ImposterMode = 'classic' | 'undercover';
export type ImposterState = {
  mode: ImposterMode;
  count: 1 | 2;
  category: string | null;
  step: 'setup' | 'pass' | 'secret' | 'discussion' | 'vote' | 'guess' | 'result';
  order: PlayerId[];
  roleIndex: number;
  imposters: PlayerId[];
  wordId: string | null;
  imposterWord: string | null;
  options: string[];
  starterId: PlayerId | null;
  suspects: PlayerId[];
  guessedWord: string | null;
  round: number;
  seed: number;
};
export type ImposterAction =
  | { type: 'mode'; mode: ImposterMode }
  | { type: 'count'; count: 1 | 2 }
  | { type: 'category'; category: string | null }
  | { type: 'begin'; wordId: string; imposterWord: string | null; options: string[]; seed: number }
  | { type: 'confirmRole' }
  | { type: 'nextRole' }
  | { type: 'endDiscussion' }
  | { type: 'toggleSuspect'; playerId: PlayerId }
  | { type: 'confirmVote' }
  | { type: 'guess'; word: string }
  | { type: 'again' };
export type ImposterResult = {
  state: ImposterState;
  changes: ScoreChange[];
  stats: StatChange[];
};

export function createImposter(seed: number): ImposterState {
  return {
    mode: 'classic',
    count: 1,
    category: null,
    step: 'setup',
    order: [],
    roleIndex: 0,
    imposters: [],
    wordId: null,
    imposterWord: null,
    options: [],
    starterId: null,
    suspects: [],
    guessedWord: null,
    round: 1,
    seed,
  };
}

export function imposterReducer(
  state: ImposterState,
  action: ImposterAction,
  players: readonly Participant[],
  groupWord: string | null,
): ImposterResult {
  const result = (
    next: ImposterState,
    changes: ScoreChange[] = [],
    stats: StatChange[] = [],
  ): ImposterResult => ({ state: next, changes, stats });
  if (action.type === 'mode' && state.step === 'setup')
    return result({ ...state, mode: action.mode, category: null });
  if (action.type === 'count' && state.step === 'setup')
    return result({ ...state, count: action.count });
  if (action.type === 'category' && state.step === 'setup')
    return result({ ...state, category: action.category });
  if (action.type === 'begin' && state.step === 'setup') {
    const activeIds = players.filter((p) => !p.away).map((p) => p.id);
    if (activeIds.length < 3 || (state.count === 2 && activeIds.length < 6)) return result(state);
    const roles = shuffle(activeIds, action.seed);
    const order = shuffle(activeIds, roles.seed);
    const starter = shuffle(activeIds, order.seed);
    return result({
      ...state,
      order: order.items,
      roleIndex: 0,
      imposters: roles.items.slice(0, state.count),
      wordId: action.wordId,
      imposterWord: action.imposterWord,
      options: action.options,
      starterId: starter.items[0] ?? null,
      suspects: [],
      guessedWord: null,
      seed: starter.seed,
      step: 'pass',
    });
  }
  if (action.type === 'confirmRole' && state.step === 'pass')
    return result({ ...state, step: 'secret' });
  if (action.type === 'nextRole' && state.step === 'secret') {
    const index = state.roleIndex + 1;
    return result({
      ...state,
      roleIndex: index,
      step: index >= state.order.length ? 'discussion' : 'pass',
    });
  }
  if (action.type === 'endDiscussion' && state.step === 'discussion')
    return result({ ...state, step: 'vote' });
  if (action.type === 'toggleSuspect' && state.step === 'vote') {
    if (!state.order.includes(action.playerId)) return result(state);
    if (state.suspects.includes(action.playerId))
      return result({ ...state, suspects: state.suspects.filter((id) => id !== action.playerId) });
    if (state.suspects.length >= state.count) return result(state);
    return result({ ...state, suspects: [...state.suspects, action.playerId] });
  }
  if (action.type === 'confirmVote' && state.step === 'vote') {
    if (state.suspects.length !== state.count) return result(state);
    const caught = state.imposters.filter((id) => state.suspects.includes(id));
    const escaped = state.imposters.filter((id) => !state.suspects.includes(id));
    const changes: ScoreChange[] = [
      ...state.order
        .filter((id) => !state.imposters.includes(id) && caught.length)
        .map((playerId) => ({ playerId, points: caught.length })),
      ...escaped.map((playerId) => ({ playerId, points: 2 })),
    ];
    const stats: StatChange[] = [
      ...caught.map((playerId) => ({ playerId, stat: 'busted' as const, amount: 1 })),
      ...escaped.map((playerId) => ({ playerId, stat: 'fox' as const, amount: 1 })),
    ];
    return result({ ...state, step: caught.length ? 'guess' : 'result' }, changes, stats);
  }
  if (action.type === 'guess' && state.step === 'guess') {
    if (!state.options.includes(action.word)) return result(state);
    const caught = state.imposters.filter((id) => state.suspects.includes(id));
    return result(
      { ...state, guessedWord: action.word, step: 'result' },
      action.word === groupWord ? caught.map((playerId) => ({ playerId, points: 1 })) : [],
    );
  }
  if (action.type === 'again' && state.step === 'result')
    return result({
      ...createImposter(state.seed),
      mode: state.mode,
      count: state.count,
      category: state.category,
      round: state.round + 1,
    });
  return result(state);
}
