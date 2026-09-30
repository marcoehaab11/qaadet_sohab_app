import { Ledger, PlayerId, Stat } from './types';

export type Award = { stat: Stat; value: number; playerIds: PlayerId[] };
export function sessionAwards(activeIds: readonly PlayerId[], ledger: Ledger, limit = 6): Award[] {
  return (Object.keys(ledger.stats).flatMap((id) => Object.keys(ledger.stats[id] ?? {})) as Stat[])
      .filter((stat, index, all) => all.indexOf(stat) === index)
      .flatMap((stat) => {
        const maximum = Math.max(0, ...activeIds.map((id) => ledger.stats[id]?.[stat] ?? 0));
        if (maximum <= 0) return [];
        return [{ stat, value: maximum,
          playerIds: activeIds.filter((id) => (ledger.stats[id]?.[stat] ?? 0) === maximum).slice(0, 2) }];
      })
    .sort((a, b) => b.value - a.value || a.stat.localeCompare(b.stat))
    .slice(0, limit);
}

export function lowestScorers(activeIds: readonly PlayerId[], ledger: Ledger): PlayerId[] {
  if (!activeIds.length) return [];
  const minimum = Math.min(...activeIds.map((id) => ledger.scores[id] ?? 0));
  return activeIds.filter((id) => (ledger.scores[id] ?? 0) === minimum);
}
