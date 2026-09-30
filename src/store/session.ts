import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { addPoints, undoPoints } from '../engine/scoring';
import { emptyLedger, Ledger, ScoreChange, StatChange } from '../engine/types';
import { ar } from '../i18n/ar-EG';
import { useApp } from './index';
// Ephemeral by design: scores, counters, undo and sit-out state never reach AsyncStorage.
type SessionStore = {
  ledger: Ledger;
  away: string[];
  award: (changes: ScoreChange[], stats?: StatChange[]) => void;
  undo: () => void;
  reset: () => void;
};
export const useSession = create<SessionStore>((set, get) => ({
  ledger: emptyLedger(),
  away: [],
  award: (changes, stats = []) => {
    set({ ledger: addPoints(get().ledger, changes, stats) });
    const players = useApp.getState().data.players;
    const message = changes
      .map((change) => {
        const player = players.find((p) => p.id === change.playerId);
        return `${player?.emoji ?? ''} ${player?.name ?? ''} \u2066${change.points >= 0 ? '+' : ''}${change.points}\u2069`;
      })
      .join(' · ');
    if (message) {
      useApp.getState().notify(message);
      void Haptics.selectionAsync().catch(() => {});
    }
  },
  undo: () => {
    const ledger = get().ledger;
    if (!ledger.undo.length) useApp.getState().notify(ar.noUndo);
    else set({ ledger: undoPoints(ledger) });
  },
  reset: () => set({ ledger: emptyLedger(), away: [] }),
}));
