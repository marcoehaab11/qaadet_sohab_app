import { Participant, PlayerId, ScoreChange, StatChange } from '../../engine/types';
import { nextPlayer } from '../../engine/players';
import { shuffle } from '../../engine/random';

export type LikelyState = {
  step: 'question' | 'pass' | 'vote' | 'results';
  order: PlayerId[];
  turnId: PlayerId | null;
  questionId: string | null;
  votes: Record<PlayerId, PlayerId>;
  completed: number;
  maximum: number;
  seed: number;
};
export type LikelyAction =
  | { type: 'question'; questionId: string; seed: number }
  | { type: 'confirm' }
  | { type: 'vote'; targetId: PlayerId }
  | { type: 'skipVoter' }
  | { type: 'next' };
export type LikelyResult = {
  state: LikelyState;
  changes: ScoreChange[];
  stats: StatChange[];
  finished: boolean;
};

export function createLikely(
  players: readonly Participant[],
  maximum: number,
  seed: number,
): LikelyState {
  const order = shuffle(
    players.filter((p) => !p.away).map((p) => p.id),
    seed,
  );
  return {
    step: 'question',
    order: order.items,
    turnId: null,
    questionId: null,
    votes: {},
    completed: 0,
    maximum,
    seed: order.seed,
  };
}

export function voteCounts(votes: Record<PlayerId, PlayerId>): Record<PlayerId, number> {
  const counts: Record<PlayerId, number> = {};
  for (const targetId of Object.values(votes)) counts[targetId] = (counts[targetId] ?? 0) + 1;
  return counts;
}

function scoreVotes(votes: Record<PlayerId, PlayerId>): {
  changes: ScoreChange[];
  stats: StatChange[];
} {
  const counts = voteCounts(votes);
  const maximum = Math.max(0, ...Object.values(counts));
  if (!maximum) return { changes: [], stats: [] };
  const leaders = new Set(
    Object.entries(counts)
      .filter(([, count]) => count === maximum)
      .map(([id]) => id),
  );
  return {
    changes: Object.entries(votes)
      .filter(([, targetId]) => leaders.has(targetId))
      .map(([playerId]) => ({ playerId, points: 1 })),
    stats: [...leaders].map((playerId) => ({ playerId, stat: 'gossip', amount: 1 })),
  };
}

export function likelyReducer(
  state: LikelyState,
  action: LikelyAction,
  players: readonly Participant[],
): LikelyResult {
  const result = (
    next: LikelyState,
    changes: ScoreChange[] = [],
    stats: StatChange[] = [],
  ): LikelyResult => ({ state: next, changes, stats, finished: next.completed >= next.maximum });
  const active = players.filter((p) => !p.away);
  if (action.type === 'question' && state.step === 'question') {
    const order = [
      ...state.order,
      ...active.filter((p) => !state.order.includes(p.id)).map((p) => p.id),
    ];
    return result({
      ...state,
      order,
      questionId: action.questionId,
      seed: action.seed,
      turnId: nextPlayer(order, null, players),
      votes: {},
      step: 'pass',
    });
  }
  if (action.type === 'confirm' && state.step === 'pass') return result({ ...state, step: 'vote' });
  if (
    (action.type !== 'vote' && action.type !== 'skipVoter') ||
    !['vote', 'pass'].includes(state.step) ||
    !state.turnId
  ) {
    if (action.type === 'next' && state.step === 'results')
      return result({
        ...state,
        completed: state.completed + 1,
        questionId: null,
        votes: {},
        turnId: null,
        step: 'question',
      });
    return result(state);
  }
  if (action.type === 'vote' && state.step !== 'vote') return result(state);
  if (action.type === 'vote' && !active.some((p) => p.id === state.turnId)) return result(state);
  if (action.type === 'vote' && !active.some((p) => p.id === action.targetId)) return result(state);
  const votes =
    action.type === 'vote' ? { ...state.votes, [state.turnId]: action.targetId } : state.votes;
  const unvoted = active.filter((p) => !Object.hasOwn(votes, p.id) && p.id !== state.turnId);
  const nextId = nextPlayer(state.order, state.turnId, unvoted);
  if (nextId) return result({ ...state, votes, turnId: nextId, step: 'pass' });
  const scored = scoreVotes(votes);
  return result({ ...state, votes, turnId: null, step: 'results' }, scored.changes, scored.stats);
}
