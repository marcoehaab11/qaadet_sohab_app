import { loadContent, packs } from '../src/content/loader';
import { packSchema } from '../src/content/schema';
import { migrateSaved, serializeSaved, SavedData } from '../src/store/persistence';
const saved: SavedData = {
  schemaVersion: 1,
  players: ['one', 'two'].map((id) => ({ id, name: id, emoji: '🦊', color: '#ffffff' })),
  settings: { sound: true, hold: true, family: false, largeText: false, clearColors: false, teams: false },
  config: {},
  customDecks: {},
  used: { pack: ['item'] },
  completedSessions: 3,
  onboardingDone: true,
  reviewAskedVersion: null,
  lastSetup: { vibe: 'laugh', length: 3 },
};
test('every imported content pack passes validation', () =>
  expect(packs.every((pack) => packSchema.safeParse(pack).success)).toBe(true));
test('family mode excludes couples and bold/chaos', () => {
  expect(loadContent('cards', true).every((item) => item.deck !== 'couples')).toBe(true);
  expect(
    loadContent('tod', true).every((item) => item.level !== 'bold' && item.level !== 'chaos'),
  ).toBe(true);
  expect(loadContent('taboo').every((item) => item.level === 'easy')).toBe(true);
});
test('duplicate content and invalid forbidden words fail validation', () => {
  const pack = packs.find((p) => p.game === 'taboo')!;
  expect(packSchema.safeParse({ ...pack, items: [pack.items[0], pack.items[0]] }).success).toBe(
    false,
  );
  expect(
    packSchema.safeParse({ ...pack, items: [{ ...pack.items[0], forbidden: ['a', 'a', 'b'] }] })
      .success,
  ).toBe(false);
});
test('round trip keeps setup and used IDs, strips session scores and away flags', () => {
  const data = {
    ...saved,
    scores: { one: 99 },
    players: saved.players.map((p) => ({ ...p, away: true, score: 9 })),
  };
  const result = JSON.parse(serializeSaved(data));
  expect(result).toEqual(saved);
  expect(migrateSaved(result).onboardingDone).toBe(true);
});
test('future versions and duplicate player IDs are rejected without silent reset', () => {
  expect(() => migrateSaved({ ...saved, schemaVersion: 2 })).toThrow();
  expect(() => migrateSaved({ ...saved, players: [saved.players[0], saved.players[0]] })).toThrow();
});
