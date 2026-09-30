import { activeSeason, loadContent } from '../src/content/loader';
import { detectSeason, hijriDay } from '../src/content/seasons';

test('religious seasons beat Gregorian seasons and only shipped packs activate', () => {
  expect(hijriDay(new Date(2026, 1, 20, 12))?.month).toBe(9);
  expect(hijriDay(new Date(2026, 1, 20, 12), false)).toEqual({ month: 9, day: 3 });
  expect(detectSeason(new Date(2026, 1, 20, 12))).toBe('ramadan');
  expect(detectSeason(new Date(2026, 2, 20, 12))).toBe('eid');
  expect(detectSeason(new Date(2026, 6, 15, 12))).toBe('sahel');
  expect(activeSeason(new Date(2026, 6, 15, 12))).toBe('sahel');
  expect(activeSeason(new Date(2026, 6, 15, 12), 'eid')).toBe('eid');
});

test.each(['eid', 'sahel', 'exams'] as const)('%s has 20 imposter and 15 items in the other seasonal games', (season) => {
  expect(loadContent('imposter', false, {}, season).filter((item) => item.id.startsWith(`${season}-`))).toHaveLength(20);
  for (const game of ['likely', 'charades', 'taboo'] as const)
    expect(loadContent(game, false, {}, season).filter((item) => item.id.startsWith(`${season}-`))).toHaveLength(15);
  expect(loadContent('likely', false, {}, null).every((item) => !item.id.startsWith(`${season}-`))).toBe(true);
});

test('Ramadan adds its packs only during the season', () => {
  expect(loadContent('likely', false, {}, 'ramadan').filter((item) => item.id.startsWith('ramadan-'))).toHaveLength(15);
  expect(loadContent('charades', false, {}, null).some((item) => item.id.startsWith('ramadan-'))).toBe(false);
  expect(loadContent('taboo', true, {}, 'ramadan').filter((item) => item.id.startsWith('ramadan-'))).toHaveLength(15);
  expect(loadContent('imposter', false, {}, 'ramadan').filter((item) => item.id.startsWith('ramadan-'))).toHaveLength(20);
});
