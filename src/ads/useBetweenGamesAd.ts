import { useEffect, useState } from 'react';
import { Session } from '../engine/session';
import { showBetweenGames } from './interstitial';

let lastAttemptedBreak: string | null = null;

export function useBetweenGamesAd(session: Session | null): boolean {
  const key = session && !session.finished && session.phase === 'host' && session.index > 0
    ? `${session.seed}:${session.index}` : null;
  const [pending, setPending] = useState<string | null>(null);
  useEffect(() => {
    if (!key || lastAttemptedBreak === key) return;
    lastAttemptedBreak = key;
    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      setPending(key);
      try { await showBetweenGames(); }
      finally { if (active) setPending(null); }
    });
    return () => { active = false; };
  }, [key]);
  return !!key && (lastAttemptedBreak !== key || pending === key);
}
