import seed from './packs/seed.json';
import { packSchema } from './schema';
import { isPackAvailable } from '../entitlements';
import { GameId } from '../config/release';
export const packs = packSchema.array().parse(seed);
export function loadContent(game: GameId, family = false) {
  return packs
    .filter((pack) => pack.game === game && isPackAvailable(pack))
    .flatMap((pack) => pack.items)
    .filter((item) => {
      if (item.level === 'hard') return false;
      return (
        !family || (item.deck !== 'couples' && item.level !== 'bold' && item.level !== 'chaos')
      );
    });
}
