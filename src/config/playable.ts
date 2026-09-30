import { GameId } from './release';

export const playableRoutes: Partial<
  Record<
    GameId,
    | '/game/cards'
    | '/game/tod'
    | '/game/likely'
    | '/game/knowme'
    | '/game/taboo'
    | '/game/charades'
    | '/game/speed'
    | '/game/imposter'
    | '/game/proverb'
    | '/game/memory'
    | '/game/draw'
  >
> = {
  cards: '/game/cards',
  tod: '/game/tod',
  likely: '/game/likely',
  knowme: '/game/knowme',
  taboo: '/game/taboo',
  charades: '/game/charades',
  speed: '/game/speed',
  imposter: '/game/imposter',
  proverb: '/game/proverb',
  memory: '/game/memory',
  draw: '/game/draw',
};
