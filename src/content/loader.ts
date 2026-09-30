import seed from './packs/seed.json';
import ramadan from './packs/ramadan.json';
import proverbs from './packs/proverbs.json';
import tabooHard from './packs/taboo-hard.json';
import drawing from './packs/draw.json';
import { packSchema } from './schema';
import { isPackAvailable } from '../entitlements';
import { GameId } from '../config/release';
import { CustomDecks, customContent } from './custom';
import { detectSeason, Season } from './seasons';
export const packs = packSchema.array().parse([...seed, ...ramadan, ...proverbs, ...tabooHard, ...drawing]);
export function activeSeason(date = new Date()): Season | null {
  const detected = detectSeason(date);
  return detected && packs.some((pack) => pack.season === detected) ? detected : null;
}
export function loadContent(game: GameId, family = false, customDecks: CustomDecks = {}, season: Season | null = activeSeason(), difficulty = 0) {
  const base = packs
    .filter((pack) => pack.game === game && (!pack.season || pack.season === season) && isPackAvailable(pack))
    .flatMap((pack) => pack.items);
  const custom = game === 'tod'
    ? [...customContent('truth', customDecks), ...customContent('dare', customDecks)]
    : game === 'likely' || game === 'charades' || game === 'taboo' || game === 'cards' || game === 'imposter'
      ? customContent(game, customDecks)
      : [];
  return [...base, ...custom]
    .filter((item) => {
      if (game === 'taboo') {
        if (difficulty === 0 && item.level === 'hard') return false;
        if (difficulty === 1 && item.level !== 'hard') return false;
      } else if (item.level === 'hard') return false;
      return (
        !family || (item.deck !== 'couples' && item.level !== 'bold' && item.level !== 'chaos')
      );
    });
}
