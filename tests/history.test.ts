import { appendHistory, historySummary, makeHistoryRecord, updateCareer } from '../src/engine/history';
import { createSession } from '../src/engine/session';
import { emptyLedger } from '../src/engine/types';
import { migrateSaved } from '../src/store/persistence';

const players = ['a', 'b'].map((id) => ({ id, name: id, emoji: '🙂', color: '#ffffff' }));
test('records final winners and keeps latest 40 without duplicating a session', () => {
  const session = createSession('random', 3, 2, 100);
  const record = makeHistoryRecord(session, players, ['a', 'b'],
    { ...emptyLedger(), scores: { a: 2, b: 1 } }, 200);
  expect(record.winnerIds).toEqual(['a']);
  expect(record.players[0]?.score).toBe(2);
  expect(appendHistory([record], record)).toHaveLength(1);
  const many = Array.from({ length: 41 }, (_, index) => ({ ...record, id: String(index) }));
  expect(appendHistory(many, { ...record, id: 'last' }).map((item) => item.id))
    .toEqual([...Array.from({ length: 39 }, (_, index) => String(index + 2)), 'last']);
});
test('win streak follows history order and legacy saved data receives defaults', () => {
  const session = createSession('random', 3, 2, 100);
  const base = makeHistoryRecord(session, players, ['a', 'b'], emptyLedger(), 200);
  const history = [
    { ...base, id: '1', winnerIds: ['a'] },
    { ...base, id: '2', winnerIds: ['a'] },
    { ...base, id: '3', winnerIds: ['b'] },
    { ...base, id: '4', winnerIds: ['a'] },
  ];
  expect(historySummary(history, 'a')).toEqual({ sessions: 4, wins: 3, longestStreak: 2 });
  const saved = migrateSaved({ schemaVersion: 1, players, settings: {
    sound: true, hold: true, family: false, largeText: false, clearColors: false,
  }, config: {}, customDecks: {}, used: {}, completedSessions: 0,
    onboardingDone: true, reviewAskedVersion: null, lastSetup: { vibe: 'laugh', length: 3 } });
  expect(saved.history).toEqual([]);
  expect(saved.playCounts).toEqual({});
  expect(saved.career).toEqual({});
});
test('career totals survive history truncation and tied winners', () => {
  let career = updateCareer({}, ['a', 'b'], ['a', 'b']);
  career = updateCareer(career, ['a', 'b'], ['a']);
  career = updateCareer(career, ['a', 'b'], ['b']);
  expect(career.a).toEqual({ sessions: 3, wins: 2, currentStreak: 0, longestStreak: 2 });
  expect(career.b).toEqual({ sessions: 3, wins: 2, currentStreak: 1, longestStreak: 1 });
});
