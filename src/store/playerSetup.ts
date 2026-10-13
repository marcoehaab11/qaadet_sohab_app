import { Player } from '../engine/types';
import { ar } from '../i18n/ar-EG';

export function isPlaceholderName(name: string): boolean {
  return Array.from({ length: 8 }, (_, index) => ar.playerName(index + 1)).includes(name.trim());
}

export function removeUnusedPlayers(players: readonly Player[]): Player[] {
  const named = players.filter((player) => !isPlaceholderName(player.name));
  return named.length >= 2 ? named : [...players];
}
