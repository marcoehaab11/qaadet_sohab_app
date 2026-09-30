import { Participant, PlayerId, ScoreChange, StatChange } from '../../engine/types';
import { nextPlayer } from '../../engine/players';
import { shuffle } from '../../engine/random';
import { teamsActive } from '../../engine/teams';

export type CharadesState = {
  step: 'pass' | 'reveal' | 'playing' | 'turnEnd';
  order: PlayerId[];
  actorId: PlayerId | null;
  sceneId: string | null;
  guesserId: PlayerId | null;
  completed: number;
  maximum: number;
  seed: number;
};
export type CharadesAction =
  | { type: 'skipTurn' }
  | { type: 'showScene'; sceneId: string; seed: number }
  | { type: 'start' }
  | { type: 'guessed'; playerId: PlayerId }
  | { type: 'timeUp' }
  | { type: 'nextTurn' };
export type CharadesResult = {
  state: CharadesState;
  changes: ScoreChange[];
  stats: StatChange[];
  finished: boolean;
};

export function createCharades(
  players: readonly Participant[],
  maximum: number,
  seed: number,
): CharadesState {
  const shuffled = shuffle(
    players.filter((p) => !p.away).map((p) => p.id),
    seed,
  );
  return {
    step: 'pass',
    order: shuffled.items,
    actorId: nextPlayer(shuffled.items, null, players),
    sceneId: null,
    guesserId: null,
    completed: 0,
    maximum,
    seed: shuffled.seed,
  };
}

export function charadesReducer(
  state: CharadesState,
  action: CharadesAction,
  players: readonly Participant[],
  teamMode = false,
): CharadesResult {
  const result = (
    next: CharadesState,
    changes: ScoreChange[] = [],
    stats: StatChange[] = [],
  ): CharadesResult => ({ state: next, changes, stats, finished: next.completed >= next.maximum });
  const order = [
    ...state.order,
    ...players.filter((p) => !p.away && !state.order.includes(p.id)).map((p) => p.id),
  ];
  if (action.type === 'skipTurn' && state.step === 'pass')
    return result({ ...state, order, actorId: nextPlayer(order, state.actorId, players) });
  if (action.type === 'showScene' && state.step === 'pass')
    return result({ ...state, sceneId: action.sceneId, seed: action.seed, step: 'reveal' });
  if (action.type === 'start' && state.step === 'reveal')
    return result({ ...state, step: 'playing' });
  if (action.type === 'guessed' && state.step === 'playing' && state.actorId) {
    if (
      action.playerId === state.actorId ||
      !players.some((p) => p.id === action.playerId && !p.away) ||
      (teamsActive(players, teamMode) && players.find((p) => p.id === action.playerId)?.team !==
        players.find((p) => p.id === state.actorId)?.team)
    )
      return result(state);
    return result(
      { ...state, step: 'turnEnd', guesserId: action.playerId },
      [
        { playerId: state.actorId, points: 1 },
        { playerId: action.playerId, points: 1 },
      ],
      [
        { playerId: state.actorId, stat: 'act', amount: 1 },
        { playerId: action.playerId, stat: 'guess', amount: 1 },
      ],
    );
  }
  if (action.type === 'timeUp' && state.step === 'playing')
    return result({ ...state, step: 'turnEnd' });
  if (action.type === 'nextTurn' && state.step === 'turnEnd')
    return result({
      ...state,
      order,
      actorId: nextPlayer(order, state.actorId, players),
      sceneId: null,
      guesserId: null,
      completed: state.completed + 1,
      step: 'pass',
    });
  return result(state);
}
