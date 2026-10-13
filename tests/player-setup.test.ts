import { removeUnusedPlayers } from '../src/store/playerSetup';
import { Player } from '../src/engine/types';

const player = (id: string, name: string): Player => ({ id, name, emoji: '🙂', color: '#123456' });

describe('player setup', () => {
  it('removes untouched default slots after two friends are named', () => {
    const players = [player('1', 'مريم'), player('2', 'أحمد'), player('3', 'صاحبنا 3'), player('4', 'صاحبنا 4')];
    expect(removeUnusedPlayers(players).map(({ id }) => id)).toEqual(['1', '2']);
  });

  it('keeps placeholders when fewer than two names are ready', () => {
    const players = [player('1', 'مريم'), player('2', 'صاحبنا 2')];
    expect(removeUnusedPlayers(players)).toEqual(players);
  });

  it('keeps every named friend', () => {
    const players = [player('1', 'مريم'), player('2', 'أحمد'), player('3', 'سارة')];
    expect(removeUnusedPlayers(players)).toEqual(players);
  });
});
