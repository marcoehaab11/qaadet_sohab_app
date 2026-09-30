// Stateless PRNG: each call returns its next seed, so replay is deterministic.
export function random(seed: number): { value: number; seed: number } {
  const next = (seed + 0x6d2b79f5) >>> 0;
  let t = Math.imul(next ^ (next >>> 15), next | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: next };
}
export function shuffle<T>(items: readonly T[], seed: number): { items: T[]; seed: number } {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const next = random(seed);
    seed = next.seed;
    const j = Math.floor(next.value * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return { items: result, seed };
}
export function draw<T extends { id: string }>(
  pool: readonly T[],
  used: readonly string[],
  seed: number,
) {
  if (!pool.length) throw new Error('Cannot draw from an empty pack');
  if (new Set(pool.map((item) => item.id)).size !== pool.length)
    throw new Error('Duplicate content IDs');
  const validUsed = used.filter((id) => pool.some((item) => item.id === id));
  let remaining = pool.filter((item) => !validUsed.includes(item.id));
  const reset = !remaining.length;
  if (reset) remaining = [...pool];
  const next = random(seed);
  const item = remaining[Math.floor(next.value * remaining.length)]!;
  return { item, used: [...(reset ? [] : validUsed), item.id], seed: next.seed };
}
