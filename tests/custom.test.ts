import { customContent, validateCustom } from '../src/content/custom';
import { loadContent } from '../src/content/loader';
import { migrateSaved, SavedData } from '../src/store/persistence';

const decks = {
  likely: [{ id: 'likely-1', text: 'مين هيضحك الأول؟' }],
  truth: [{ id: 'truth-1', text: 'إيه أجمل ذكرى؟' }],
  dare: [{ id: 'dare-1', text: 'قلّد صوت قطة' }],
  taboo: [{ id: 'taboo-1', text: 'بحر', forbidden: ['موج', 'سمك', 'شاطئ'] }],
  cards: [{ id: 'cards-1', text: 'قول موقف مضحك', kind: 'tell' as const }],
  imposter: [{ id: 'imposter-1', text: 'فشار' }],
};

test('custom prompts enter the right pools and every truth-or-dare level', () => {
  expect(loadContent('likely', false, decks).some((item) => item.text === 'مين هيضحك الأول؟')).toBe(true);
  expect(loadContent('taboo', false, decks).find((item) => item.id === 'custom:taboo-1')?.forbidden).toEqual(['موج', 'سمك', 'شاطئ']);
  expect(loadContent('cards', false, decks).find((item) => item.id === 'custom:cards-1')?.deck).toBe('custom');
  expect(customContent('truth', decks).map((item) => item.level)).toEqual(['chill', 'funny', 'bold', 'chaos']);
  expect(loadContent('tod', true, decks).filter((item) => item.source === 'custom').map((item) => item.level)).toEqual(['chill', 'funny', 'chill', 'funny']);
});

test('custom input rejects blanks, long strings, duplicate text and malformed forbidden lists', () => {
  expect(validateCustom('likely', ' ', '', [])).toBeTruthy();
  expect(validateCustom('likely', 'x'.repeat(91), '', [])).toBeTruthy();
  expect(validateCustom('likely', 'مين هيضحك الأول؟', '', decks.likely)).toBeTruthy();
  expect(validateCustom('taboo', 'بحر', 'موج، سمك', [])).toBeTruthy();
  expect(validateCustom('taboo', 'بحر', 'موج، سمك, شاطئ', [])).toBeNull();
});

test('saved custom decks reject malformed entries', () => {
  const saved: SavedData = {
    schemaVersion: 1,
    players: ['a', 'b'].map((id) => ({ id, name: id, emoji: '😀', color: '#ffffff' })),
    settings: { sound: true, hold: true, family: false, largeText: false, clearColors: false, teams: false, surprises: false },
    config: {}, customDecks: decks, used: {}, completedSessions: 0, onboardingDone: true,
    reviewAskedVersion: null, lastSetup: { vibe: 'laugh', length: 3 },
  };
  expect(migrateSaved(saved).customDecks.cards).toEqual(decks.cards);
  expect(() => migrateSaved({ ...saved, customDecks: { cards: [{ id: '', text: '' }] } })).toThrow();
});
