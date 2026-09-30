import seed from './packs/seed.json';
import { packSchema } from './schema';
import { isPackAvailable } from '../entitlements';
import { GameId } from '../config/release';
import { CustomDecks, customContent } from './custom';
export const packs = packSchema.array().parse(seed);
export function loadContent(game: GameId, family = false, customDecks: CustomDecks = {}) {
  const base = packs
    .filter((pack) => pack.game === game && isPackAvailable(pack))
    .flatMap((pack) => pack.items);
  const custom = game === 'tod'
    ? [...customContent('truth', customDecks), ...customContent('dare', customDecks)]
    : game === 'likely' || game === 'charades' || game === 'taboo' || game === 'cards' || game === 'imposter'
      ? customContent(game, customDecks)
      : [];
  return [...base, ...custom]
    .filter((item) => {
      if (item.level === 'hard') return false;
      return (
        !family || (item.deck !== 'couples' && item.level !== 'bold' && item.level !== 'chaos')
      );
    });
}
