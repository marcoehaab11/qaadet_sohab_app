import { ContentPack } from './schema';
import { draw } from '../engine/random';
import { useApp } from '../store';
// Persist only used IDs. RNG seeds and the selected secret remain ephemeral.
export function drawFromPack(pack: ContentPack, seed: number) {
  const store = useApp.getState();
  const result = draw(pack.items, store.data.used[pack.id] ?? [], seed);
  store.update((data) => ({ ...data, used: { ...data.used, [pack.id]: result.used } }));
  return { item: result.item, seed: result.seed };
}
