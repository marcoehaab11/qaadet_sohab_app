import { Participant, PlayerId, ScoreChange, StatChange } from '../../engine/types';
import { random, shuffle } from '../../engine/random';

const symbols = ['🐈','🚀','🍋','🎩','🌙','🎸','🦊','🍕','🪁','🐢','⭐','🎈','🦋','🍉','🎲','🐙','🌵','⚽'];
export type MemoryState = {
  step: 'ready' | 'look' | 'ask' | 'result';
  completed: number;
  maximum: number;
  seed: number;
  size: number;
  playerId: PlayerId | null;
  sequence: string[];
  mode: 'where' | 'missing';
  target: number;
  options: string[];
  selected: number | null;
};
export type MemoryAction = { type: 'start' } | { type: 'hide' } | { type: 'answer'; index: number } | { type: 'next' };
export function createMemory(maximum: number, size: number, seed: number): MemoryState {
  return { step: 'ready', completed: 0, maximum, seed, size, playerId: null,
    sequence: [], mode: 'where', target: 0, options: [], selected: null };
}
export function memoryReducer(state: MemoryState, action: MemoryAction, players: readonly Participant[]): {
  state: MemoryState; changes: ScoreChange[]; stats: StatChange[]; finished: boolean;
} {
  const active = players.filter((p) => !p.away);
  const empty: { changes: ScoreChange[]; stats: StatChange[]; finished: boolean } = { changes: [], stats: [], finished: false };
  if (action.type === 'start' && state.step === 'ready' && active.length) {
    const order = shuffle(symbols, state.seed);
    const sequence = order.items.slice(0, state.size);
    const pick = random(order.seed);
    const target = Math.floor(pick.value * sequence.length);
    const mode: MemoryState['mode'] = state.completed % 2 === 0 ? 'where' : 'missing';
    const distractors = order.items.slice(state.size, state.size + 3);
    const optionOrder = shuffle([sequence[target]!, ...distractors], pick.seed);
    return { ...empty, state: { ...state, step: 'look' as const,
      playerId: active[state.completed % active.length]!.id, sequence, mode, target,
      options: optionOrder.items, selected: null, seed: optionOrder.seed } };
  }
  if (action.type === 'hide' && state.step === 'look')
    return { ...empty, state: { ...state, step: 'ask' as const } };
  if (action.type === 'answer' && state.step === 'ask' && state.playerId) {
    const answer = state.mode === 'where' ? state.target : state.options.indexOf(state.sequence[state.target]!);
    const correct = action.index === answer && active.some((p) => p.id === state.playerId);
    return { state: { ...state, step: 'result' as const, selected: action.index },
      changes: correct ? [{ playerId: state.playerId, points: 1 }] : [],
      stats: correct ? [{ playerId: state.playerId, stat: 'mem' as const, amount: 1 }] : [],
      finished: false };
  }
  if (action.type === 'next' && state.step === 'result') {
    const completed = state.completed + 1;
    return { ...empty, state: { ...state, step: 'ready' as const, completed, playerId: null },
      finished: completed >= state.maximum };
  }
  return { ...empty, state };
}
