import { Participant, Player, ScoreChange } from './types';
import { shuffle } from './random';

export const teamNames = ['فريق الكشري 🔴', 'فريق الفول 🔵'] as const;

export function assignTeams(players: readonly Player[], seed: number): Player[] {
  const order = shuffle(players, seed).items;
  const assignments = new Map(order.map((player, index) => [player.id, (index % 2) as 0 | 1]));
  return players.map((player) => ({ ...player, team: assignments.get(player.id) }));
}

export function teamsActive(players: readonly Participant[], enabled: boolean): boolean {
  const active = players.filter((player) => !player.away);
  return enabled && active.length >= 4 && active.every((player) => player.team === 0 || player.team === 1)
    && active.some((player) => player.team === 0) && active.some((player) => player.team === 1);
}

export function teamTurnOrder(players: readonly Participant[], seed: number): string[] {
  const first = shuffle(players.filter((player) => !player.away && player.team === 0), seed);
  const second = shuffle(players.filter((player) => !player.away && player.team === 1), first.seed);
  const result: string[] = [];
  for (let index = 0; index < Math.max(first.items.length, second.items.length); index++) {
    if (first.items[index]) result.push(first.items[index]!.id);
    if (second.items[index]) result.push(second.items[index]!.id);
  }
  return result;
}

export function expandTeamPoints(changes: readonly ScoreChange[], players: readonly Participant[]): ScoreChange[] {
  const uniqueTeams = new Map<0 | 1, number>();
  for (const change of changes) {
    const team = players.find((player) => player.id === change.playerId)?.team;
    if (team !== undefined) uniqueTeams.set(team, (uniqueTeams.get(team) ?? 0) + change.points);
  }
  return players.filter((player) => !player.away && player.team !== undefined)
    .flatMap((player) => uniqueTeams.has(player.team!)
      ? [{ playerId: player.id, points: uniqueTeams.get(player.team!)! }] : []);
}
