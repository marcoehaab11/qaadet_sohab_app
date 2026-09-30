import { Player, PlayerId } from './types';
import { Award } from './awards';
import { ar } from '../i18n/ar-EG';

export function rankedResults(players: readonly Player[], activeIds: readonly PlayerId[], scores: Record<PlayerId, number>) {
  return players.filter((player) => activeIds.includes(player.id))
    .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0) || activeIds.indexOf(a.id) - activeIds.indexOf(b.id));
}

export function resultShareText(
  players: readonly Player[], activeIds: readonly PlayerId[], scores: Record<PlayerId, number>, awards: readonly Award[],
) {
  const ranked = rankedResults(players, activeIds, scores);
  const standings = ranked.map((player, index) => `${index + 1}. ${player.emoji} ${player.name} — ${scores[player.id] ?? 0} نقطة`);
  const titles = awards.slice(0, 5).map((award) =>
    `${ar.awardNames[award.stat]}: ${award.playerIds.map((id) => players.find((p) => p.id === id)?.name).filter(Boolean).join('، ')}`);
  return [`🎉 ${ar.name} — ${ar.results}`, ...standings, ...(titles.length ? ['', ar.awardsTitle, ...titles] : []), '', '#قعدة_صحاب'].join('\n');
}
