export type PlayerId = string;
export type Player = { id: PlayerId; name: string; emoji: string; color: string; team?: 0 | 1 };
export type Participant = Player & { away: boolean };
export const statKeys = [
  'act',
  'guess',
  'fox',
  'busted',
  'brave',
  'chicken',
  'gossip',
  'flash',
  'mem',
  'tongue',
  'oops',
  'nerd',
  'artist',
  'elder',
] as const;
export type Stat = (typeof statKeys)[number];
export type ScoreChange = { playerId: PlayerId; points: number };
export type StatChange = { playerId: PlayerId; stat: Stat; amount: number };
export type LedgerEntry = { changes: ScoreChange[]; statChanges: StatChange[] };
export type Ledger = {
  scores: Record<PlayerId, number>;
  stats: Record<PlayerId, Partial<Record<Stat, number>>>;
  undo: LedgerEntry[];
};
export const emptyLedger = (): Ledger => ({ scores: {}, stats: {}, undo: [] });
