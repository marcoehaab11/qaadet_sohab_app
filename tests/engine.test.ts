import { addPoints, undoPoints } from '../src/engine/scoring';
import { emptyLedger, Participant } from '../src/engine/types';
import { draw, shuffle } from '../src/engine/random';
import { nextPlayer, lateJoinScore } from '../src/engine/players';
import { createTimer, pauseTimer, remaining, resumeTimer } from '../src/engine/timer';
import { buildQueue } from '../src/engine/queue';
import { minPlayers } from '../src/config/release';

const players: Participant[] = ['a', 'b', 'c'].map((id) => ({
  id,
  name: id,
  emoji: '🦊',
  color: '#ffffff',
  away: false,
}));
describe('score ledger', () => {
  test('undo reverts one award and linked stats without changing the input', () => {
    const before = emptyLedger();
    const awarded = addPoints(
      before,
      [{ playerId: 'a', points: 1 }],
      [{ playerId: 'a', stat: 'act', amount: 1 }],
    );
    expect(before).toEqual(emptyLedger());
    expect(awarded.scores.a).toBe(1);
    expect(undoPoints(awarded)).toMatchObject({
      scores: { a: 0 },
      stats: { a: { act: 0 } },
      undo: [],
    });
  });
  test('bulk and negative changes are one atomic undo entry', () => {
    const initial = addPoints(emptyLedger(), [{ playerId: 'a', points: 7 }]);
    const changed = addPoints(initial, [
      { playerId: 'a', points: -2 },
      { playerId: 'b', points: 2 },
    ]);
    const undone = undoPoints(changed);
    expect(undone.scores).toEqual({ a: 7, b: 0 });
    expect(undone.undo).toHaveLength(1);
  });
  test('stat-only actions are undoable', () => {
    const changed = addPoints(emptyLedger(), [], [{ playerId: 'a', stat: 'chicken', amount: 1 }]);
    expect(undoPoints(changed).stats.a?.chicken).toBe(0);
  });
  test('keeps the most recent 60 entries', () => {
    let state = emptyLedger();
    for (let i = 0; i < 80; i++) state = addPoints(state, [{ playerId: 'a', points: 1 }]);
    expect(state.undo).toHaveLength(60);
    for (let i = 0; i < 60; i++) state = undoPoints(state);
    expect(state.scores.a).toBe(20);
    expect(undoPoints(state)).toBe(state);
  });
  test('rejects nonfinite points', () =>
    expect(() => addPoints(emptyLedger(), [{ playerId: 'a', points: NaN }])).toThrow());
});
describe('seeded content draws', () => {
  const pool = ['1', '2', '3'].map((id) => ({ id }));
  test('exhausts a pool before reset and survives serialization', () => {
    let used: string[] = [],
      seed = 42;
    for (let i = 0; i < 3; i++) {
      const next = draw(pool, JSON.parse(JSON.stringify(used)), seed);
      expect(used).not.toContain(next.item.id);
      used = next.used;
      seed = next.seed;
    }
    expect(draw(pool, used, seed).used).toHaveLength(1);
  });
  test('same seed replays exactly, shuffle does not mutate', () => {
    expect(shuffle(pool, 765)).toEqual(shuffle(pool, 765));
    expect(pool.map((p) => p.id)).toEqual(['1', '2', '3']);
  });
  test('handles removed content and one-item packs', () => {
    expect(draw([{ id: 'new' }], ['old'], 1).used).toEqual(['new']);
    expect(draw([{ id: 'new' }], ['new'], 2).used).toEqual(['new']);
  });
  test('rejects empty packs and duplicate IDs', () => {
    expect(() => draw([], [], 1)).toThrow();
    expect(() => draw([{ id: 'x' }, { id: 'x' }], [], 1)).toThrow();
  });
});
describe('time and turns', () => {
  test('pause freezes remaining time and resume moves the deadline', () => {
    const started = resumeTimer(createTimer(30), 1000);
    expect(remaining(started, 11000)).toBe(20000);
    const paused = pauseTimer(started, 11000);
    expect(remaining(paused, 90000)).toBe(20000);
    expect(remaining(resumeTimer(paused, 90000), 95000)).toBe(15000);
  });
  test('double resume does not extend the deadline, expiry clamps to zero', () => {
    const started = resumeTimer(createTimer(1), 0);
    expect(resumeTimer(started, 500)).toEqual(started);
    expect(remaining(started, 2000)).toBe(0);
  });
  test('checks current away flags on every advance, wraps by stable ID', () => {
    const away = players.map((p) => ({ ...p, away: p.id === 'b' }));
    expect(nextPlayer(['a', 'b', 'c'], 'a', away)).toBe('c');
    expect(nextPlayer(['a', 'b', 'c'], 'a', players)).toBe('b');
    expect(nextPlayer(['a', 'b', 'c'], 'c', away)).toBe('a');
    expect(nextPlayer(['a', 'b', 'c'], null, [])).toBeNull();
  });
  test('late joiner uses active rounded mean only in live session', () => {
    const away = players.map((p) => ({ ...p, away: p.id === 'c' }));
    expect(lateJoinScore(away, { a: 1, b: 4, c: 99 }, true)).toBe(3);
    expect(lateJoinScore(away, { a: 1, b: 4 }, false)).toBe(0);
  });
});
describe('queue', () => {
  test.each(['laugh', 'compete', 'deceive', 'friends', 'random'] as const)(
    '%s: distinct eligible games for two players',
    (vibe) => {
      const { queue } = buildQueue(vibe, 5, 2, 123);
      expect(queue).toHaveLength(5);
      expect(new Set(queue).size).toBe(5);
      expect(queue.every((id) => minPlayers[id] <= 2)).toBe(true);
    },
  );
  test('deceive starts with imposter when eligible', () =>
    expect(buildQueue('deceive', 3, 3, 42).queue[0]).toBe('imposter'));
  test('too few players produces no queue', () =>
    expect(buildQueue('laugh', 3, 1, 42).queue).toEqual([]));
});
