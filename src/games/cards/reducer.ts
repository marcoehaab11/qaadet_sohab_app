import { Participant, PlayerId, ScoreChange, StatChange } from '../../engine/types';
import { nextPlayer } from '../../engine/players';
import { shuffle } from '../../engine/random';
export type DeckId = 'friends' | 'couples' | 'crazy' | 'deep' | 'funny' | 'custom';
export type CardsState = {
  deck: DeckId;
  step: 'deck' | 'pass' | 'back' | 'face';
  order: PlayerId[];
  turnId: PlayerId | null;
  cardId: string | null;
  completed: number;
  maximum: number;
  seed: number;
};
export type CardsAction =
  | { type: 'choose'; deck: DeckId }
  | { type: 'start' }
  | { type: 'confirm' }
  | { type: 'skipTurn' }
  | { type: 'flip'; cardId: string; seed: number }
  | { type: 'complete'; done: boolean };
export type CardsResult = {
  state: CardsState;
  changes: ScoreChange[];
  stats: StatChange[];
  finished: boolean;
};
export function createCards(
  players: readonly Participant[],
  maximum: number,
  seed: number,
): CardsState {
  const order = shuffle(
    players.filter((p) => !p.away).map((p) => p.id),
    seed,
  );
  return {
    deck: 'friends',
    step: 'deck',
    order: order.items,
    turnId: null,
    cardId: null,
    completed: 0,
    maximum,
    seed: order.seed,
  };
}
export function cardsReducer(
  state: CardsState,
  action: CardsAction,
  players: readonly Participant[],
): CardsResult {
  const result = (
    next: CardsState,
    changes: ScoreChange[] = [],
    stats: StatChange[] = [],
  ): CardsResult => ({ state: next, changes, stats, finished: next.completed >= next.maximum });
  const order = [
    ...state.order,
    ...players.filter((p) => !p.away && !state.order.includes(p.id)).map((p) => p.id),
  ];
  if (action.type === 'choose' && state.step === 'deck')
    return result({ ...state, deck: action.deck });
  if (action.type === 'start' && state.step === 'deck')
    return result({ ...state, order, step: 'pass', turnId: nextPlayer(order, null, players) });
  if (action.type === 'skipTurn' && state.step === 'pass')
    return result({ ...state, order, turnId: nextPlayer(order, state.turnId, players) });
  if (action.type === 'confirm' && state.step === 'pass') return result({ ...state, step: 'back' });
  if (action.type === 'flip' && state.step === 'back')
    return result({ ...state, step: 'face', cardId: action.cardId, seed: action.seed });
  if (action.type === 'complete' && state.step === 'face' && state.turnId) {
    const next = {
      ...state,
      order,
      completed: state.completed + 1,
      step: 'pass' as const,
      cardId: null,
      turnId: nextPlayer(order, state.turnId, players),
    };
    return result(next, action.done ? [{ playerId: state.turnId, points: 1 }] : [], [
      { playerId: state.turnId, stat: action.done ? 'brave' : 'chicken', amount: 1 },
    ]);
  }
  return result(state);
}
