import { assignTeams, expandTeamPoints, teamTurnOrder, teamsActive } from '../src/engine/teams';
import { createTaboo } from '../src/games/taboo/reducer';
import { createCharades, charadesReducer } from '../src/games/charades/reducer';
import { createSpeed, speedReducer } from '../src/games/speed/reducer';
import { Participant } from '../src/engine/types';

const players: Participant[] = ['a', 'b', 'c', 'd', 'e'].map((id) => ({
  id, name: id, emoji: '🙂', color: '#ffffff', away: false,
}));
test('teams are balanced and taboo turns alternate when possible', () => {
  const assigned = assignTeams(players, 17).map((player) => ({ ...player, away: false }));
  expect(Math.abs(assigned.filter((p) => p.team === 0).length - assigned.filter((p) => p.team === 1).length)).toBe(1);
  expect(teamsActive(assigned, true)).toBe(true);
  const order = teamTurnOrder(assigned, 23);
  const byId = new Map(assigned.map((p) => [p.id, p.team]));
  expect(new Set(order).size).toBe(players.length);
  expect(byId.get(order[0]!)).not.toBe(byId.get(order[1]!));
  expect(byId.get(order[1]!)).not.toBe(byId.get(order[2]!));
  expect(createTaboo(assigned, 1, 23, true).order).toEqual(order);
});
test('team score including penalties goes to each active teammate', () => {
  const assigned = assignTeams(players, 17).map((p) => ({ ...p, away: false }));
  const first = assigned[0]!;
  const changes = expandTeamPoints([{ playerId: first.id, points: -1 }], assigned);
  expect(changes).toEqual(assigned.filter((p) => p.team === first.team)
    .map((p) => ({ playerId: p.id, points: -1 })));
  expect(teamsActive(assigned.slice(0, 3), true)).toBe(false);
});
test('charades accepts only a teammate and speed locks a team after a wrong buzz', () => {
  const assigned = assignTeams(players, 17).map((p) => ({ ...p, away: false }));
  const charades = createCharades(assigned, 1, 7);
  const actor = assigned.find((p) => p.id === charades.actorId)!;
  const teammate = assigned.find((p) => p.team === actor.team && p.id !== actor.id)!;
  const opponent = assigned.find((p) => p.team !== actor.team)!;
  let game = charadesReducer(charades, { type: 'showScene', sceneId: 'scene', seed: 8 }, assigned, true).state;
  game = charadesReducer(game, { type: 'start' }, assigned, true).state;
  expect(charadesReducer(game, { type: 'guessed', playerId: opponent.id }, assigned, true).changes).toEqual([]);
  expect(charadesReducer(game, { type: 'guessed', playerId: teammate.id }, assigned, true).changes).toHaveLength(2);
  let speed = createSpeed(1, 7);
  speed = speedReducer(speed, { type: 'challenge', challengeId: 'x', seed: 8 }, assigned, true).state;
  speed = speedReducer(speed, { type: 'start' }, assigned, true).state;
  speed = speedReducer(speed, { type: 'buzz', playerId: actor.id }, assigned, true).state;
  speed = speedReducer(speed, { type: 'confirm', correct: false }, assigned, true).state;
  expect(speedReducer(speed, { type: 'buzz', playerId: teammate.id }, assigned, true).state).toEqual(speed);
  expect(speedReducer(speed, { type: 'buzz', playerId: opponent.id }, assigned, true).state.step).toBe('confirm');
});
