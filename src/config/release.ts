export const release = {
  version: '1.1-preview',
  teams: false,
  history: false,
  sharing: false,
  surprises: false,
  phase: 'm7',
} as const;
export const enabledGameIds = [
  'imposter',
  'cards',
  'likely',
  'taboo',
  'tod',
  'charades',
  'speed',
  'knowme',
  'proverb',
  'memory',
  'draw',
] as const;
export type GameId = (typeof enabledGameIds)[number];
export const minPlayers: Record<GameId, number> = {
  imposter: 3,
  cards: 2,
  likely: 3,
  taboo: 2,
  tod: 2,
  charades: 2,
  speed: 2,
  knowme: 2,
  proverb: 2,
  memory: 2,
  draw: 2,
};
