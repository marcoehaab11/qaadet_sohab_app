export const release = {
  version: '1.0',
  teams: false,
  history: false,
  sharing: false,
  surprises: false,
  phase: 'm6',
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
};
