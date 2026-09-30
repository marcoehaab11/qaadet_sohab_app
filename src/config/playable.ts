import { GameId } from './release';

export const playableRoutes: Partial<
  Record<
    GameId,
    '/game/cards' | '/game/tod' | '/game/likely' | '/game/knowme' | '/game/taboo' | '/game/charades'
  >
> = {
  cards: '/game/cards',
  tod: '/game/tod',
  likely: '/game/likely',
  knowme: '/game/knowme',
  taboo: '/game/taboo',
  charades: '/game/charades',
};
