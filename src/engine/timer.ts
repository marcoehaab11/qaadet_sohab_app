export type Timer = { remainingMs: number; endAt: number | null };
export const createTimer = (seconds: number): Timer => ({
  remainingMs: Math.max(0, seconds * 1000),
  endAt: null,
});
export const remaining = (timer: Timer, now: number) =>
  Math.max(0, timer.endAt === null ? timer.remainingMs : timer.endAt - now);
export const pauseTimer = (timer: Timer, now: number): Timer => ({
  remainingMs: remaining(timer, now),
  endAt: null,
});
export const resumeTimer = (timer: Timer, now: number): Timer =>
  timer.endAt === null && timer.remainingMs > 0
    ? { ...timer, endAt: now + timer.remainingMs }
    : timer;
