import { loadContent } from '../src/content/loader';

test('taboo difficulty selects easy, hard and mixed word pools', () => {
  const easy = loadContent('taboo', false, {}, null, 0);
  const hard = loadContent('taboo', false, {}, null, 1);
  const mixed = loadContent('taboo', false, {}, null, 2);
  expect(easy.length).toBeGreaterThan(0);
  expect(hard.length).toBeGreaterThan(0);
  expect(easy.every((item) => item.level !== 'hard')).toBe(true);
  expect(hard.every((item) => item.level === 'hard')).toBe(true);
  expect(mixed.length).toBe(easy.length + hard.length);
});
