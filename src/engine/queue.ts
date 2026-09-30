import { enabledGameIds, GameId, minPlayers } from '../config/release';
import { shuffle } from './random';
export type Vibe = 'laugh' | 'compete' | 'deceive' | 'friends' | 'random';
const pools: Record<Vibe, readonly GameId[]> = {
  laugh: ['charades', 'likely', 'cards', 'tod'],
  compete: ['speed', 'taboo'],
  deceive: ['imposter', 'knowme', 'likely', 'taboo'],
  friends: ['knowme', 'cards', 'likely', 'tod'],
  random: enabledGameIds,
};
export function buildQueue(vibe: Vibe, count: 3 | 5, activeCount: number, seed: number) {
  const eligible = enabledGameIds.filter((id) => minPlayers[id] <= activeCount);
  const first = shuffle(
    pools[vibe].filter((id) => eligible.includes(id)),
    seed,
  );
  const rest = shuffle(
    eligible.filter((id) => !first.items.includes(id)),
    first.seed,
  );
  const queue = [...first.items, ...rest.items];
  if (vibe === 'deceive' && queue.includes('imposter')) {
    queue.splice(queue.indexOf('imposter'), 1);
    queue.unshift('imposter');
  }
  return { queue: queue.slice(0, count), seed: rest.seed };
}
