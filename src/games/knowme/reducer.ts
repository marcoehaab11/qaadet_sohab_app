import { Participant, PlayerId, ScoreChange, StatChange } from '../../engine/types';
import { nextPlayer } from '../../engine/players';
import { shuffle } from '../../engine/random';

export type KnowMeState = {
  step: 'question' | 'pass' | 'answer' | 'guess' | 'reveal';
  order: PlayerId[];
  subjectId: PlayerId | null;
  promptId: string | null;
  answer: string;
  correctIds: PlayerId[];
  completed: number;
  maximum: number;
  seed: number;
};
export type KnowMeAction =
  | { type: 'question'; promptId: string; seed: number }
  | { type: 'skipTurn' }
  | { type: 'confirm' }
  | { type: 'writeAnswer'; answer: string }
  | { type: 'saveAnswer' }
  | { type: 'reveal' }
  | { type: 'toggleCorrect'; playerId: PlayerId }
  | { type: 'complete' };
export type KnowMeResult = {
  state: KnowMeState;
  changes: ScoreChange[];
  stats: StatChange[];
  finished: boolean;
};

export function createKnowMe(
  players: readonly Participant[],
  maximum: number,
  seed: number,
): KnowMeState {
  const order = shuffle(
    players.filter((p) => !p.away).map((p) => p.id),
    seed,
  );
  return {
    step: 'question',
    order: order.items,
    subjectId: null,
    promptId: null,
    answer: '',
    correctIds: [],
    completed: 0,
    maximum,
    seed: order.seed,
  };
}

export function knowMeReducer(
  state: KnowMeState,
  action: KnowMeAction,
  players: readonly Participant[],
): KnowMeResult {
  const result = (
    next: KnowMeState,
    changes: ScoreChange[] = [],
    stats: StatChange[] = [],
  ): KnowMeResult => ({ state: next, changes, stats, finished: next.completed >= next.maximum });
  const order = [
    ...state.order,
    ...players.filter((p) => !p.away && !state.order.includes(p.id)).map((p) => p.id),
  ];
  if (action.type === 'question' && state.step === 'question')
    return result({
      ...state,
      order,
      subjectId: nextPlayer(order, state.subjectId, players),
      promptId: action.promptId,
      seed: action.seed,
      answer: '',
      correctIds: [],
      step: 'pass',
    });
  if (action.type === 'skipTurn' && state.step === 'pass')
    return result({ ...state, order, subjectId: nextPlayer(order, state.subjectId, players) });
  if (action.type === 'confirm' && state.step === 'pass')
    return result({ ...state, step: 'answer' });
  if (action.type === 'writeAnswer' && state.step === 'answer')
    return result({ ...state, answer: action.answer.slice(0, 80) });
  if (action.type === 'saveAnswer' && state.step === 'answer')
    return result({ ...state, answer: state.answer.trim(), step: 'guess' });
  if (action.type === 'reveal' && state.step === 'guess')
    return result({ ...state, step: 'reveal' });
  if (action.type === 'toggleCorrect' && state.step === 'reveal') {
    if (
      action.playerId === state.subjectId ||
      !players.some((p) => p.id === action.playerId && !p.away)
    )
      return result(state);
    return result({
      ...state,
      correctIds: state.correctIds.includes(action.playerId)
        ? state.correctIds.filter((id) => id !== action.playerId)
        : [...state.correctIds, action.playerId],
    });
  }
  if (action.type === 'complete' && state.step === 'reveal') {
    const selected = state.correctIds.filter((id) =>
      players.some((p) => p.id === id && !p.away && id !== state.subjectId),
    );
    return result(
      {
        ...state,
        order,
        completed: state.completed + 1,
        subjectId: state.subjectId,
        promptId: null,
        answer: '',
        correctIds: [],
        step: 'question',
      },
      selected.map((playerId) => ({ playerId, points: 1 })),
      selected.map((playerId) => ({ playerId, stat: 'guess', amount: 1 })),
    );
  }
  return result(state);
}
