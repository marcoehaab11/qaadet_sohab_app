import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { addPoints, undoPoints } from '../engine/scoring';
import { emptyLedger, Ledger, ScoreChange, StatChange } from '../engine/types';
import {
  Session,
  createSession,
  currentGame,
  finishCurrentGame,
  startCurrentGame,
} from '../engine/session';
import { ar } from '../i18n/ar-EG';
import { CardsState, createCards } from '../games/cards/reducer';
import { TodState, createTod } from '../games/tod/reducer';
import { LikelyState, createLikely } from '../games/likely/reducer';
import { KnowMeState, createKnowMe } from '../games/knowme/reducer';
import { useApp } from './index';
// Ephemeral by design: scores, counters, undo and sit-out state never reach AsyncStorage.
type SessionStore = {
  ledger: Ledger;
  away: string[];
  session: Session | null;
  cardsGame: CardsState | null;
  setCardsGame: (state: CardsState | null) => void;
  startStandaloneCards: () => void;
  todGame: TodState | null;
  setTodGame: (state: TodState | null) => void;
  startStandaloneTod: () => void;
  likelyGame: LikelyState | null;
  setLikelyGame: (state: LikelyState | null) => void;
  startStandaloneLikely: () => void;
  knowMeGame: KnowMeState | null;
  setKnowMeGame: (state: KnowMeState | null) => void;
  startStandaloneKnowMe: () => void;
  begin: () => void;
  play: () => void;
  advance: () => void;
  setAway: (id: string) => boolean;
  award: (changes: ScoreChange[], stats?: StatChange[]) => void;
  undo: () => void;
  reset: () => void;
};
export const useSession = create<SessionStore>((set, get) => ({
  ledger: emptyLedger(),
  away: [],
  session: null,
  cardsGame: null,
  setCardsGame: (cardsGame) => set({ cardsGame }),
  todGame: null,
  setTodGame: (todGame) => set({ todGame }),
  likelyGame: null,
  setLikelyGame: (likelyGame) => set({ likelyGame }),
  knowMeGame: null,
  setKnowMeGame: (knowMeGame) => set({ knowMeGame }),
  startStandaloneCards: () => {
    const data = useApp.getState().data;
    set({
      ledger: emptyLedger(),
      away: [],
      session: null,
      todGame: null,
      likelyGame: null,
      knowMeGame: null,
      cardsGame: createCards(
        data.players.map((p) => ({ ...p, away: false })),
        data.config.cards?.cards ?? 8,
        Date.now(),
      ),
    });
  },
  startStandaloneTod: () => {
    const data = useApp.getState().data;
    set({
      ledger: emptyLedger(),
      away: [],
      session: null,
      cardsGame: null,
      likelyGame: null,
      knowMeGame: null,
      todGame: createTod(
        data.players.map((p) => ({ ...p, away: false })),
        data.config.tod?.turns ?? 1,
        Date.now(),
      ),
    });
  },
  startStandaloneLikely: () => {
    const data = useApp.getState().data;
    set({
      ledger: emptyLedger(),
      away: [],
      session: null,
      cardsGame: null,
      todGame: null,
      knowMeGame: null,
      likelyGame: createLikely(
        data.players.map((p) => ({ ...p, away: false })),
        data.config.likely?.questions ?? 3,
        Date.now(),
      ),
    });
  },
  startStandaloneKnowMe: () => {
    const data = useApp.getState().data;
    set({
      ledger: emptyLedger(),
      away: [],
      session: null,
      cardsGame: null,
      todGame: null,
      likelyGame: null,
      knowMeGame: createKnowMe(
        data.players.map((p) => ({ ...p, away: false })),
        data.config.knowme?.subjects ?? 3,
        Date.now(),
      ),
    });
  },
  begin: () => {
    const players = useApp.getState().data.players;
    const { vibe, length } = useApp.getState().data.lastSetup;
    set({
      ledger: emptyLedger(),
      cardsGame: null,
      todGame: null,
      likelyGame: null,
      knowMeGame: null,
      away: [],
      session: createSession(vibe, length, players.length, Date.now()),
    });
  },
  play: () => {
    const session = get().session;
    if (!session) return;
    const participants = useApp
      .getState()
      .data.players.map((p) => ({ ...p, away: get().away.includes(p.id) }));
    const maximum = useApp.getState().data.config.cards?.cards ?? 8;
    set({
      session: startCurrentGame(session),
      cardsGame:
        currentGame(session) === 'cards' ? createCards(participants, maximum, session.seed) : null,
      todGame:
        currentGame(session) === 'tod'
          ? createTod(participants, useApp.getState().data.config.tod?.turns ?? 1, session.seed)
          : null,
      likelyGame:
        currentGame(session) === 'likely'
          ? createLikely(
              participants,
              useApp.getState().data.config.likely?.questions ?? 3,
              session.seed,
            )
          : null,
      knowMeGame:
        currentGame(session) === 'knowme'
          ? createKnowMe(
              participants,
              useApp.getState().data.config.knowme?.subjects ?? 3,
              session.seed,
            )
          : null,
    });
  },
  advance: () => {
    const session = get().session;
    if (!session) return;
    const next = finishCurrentGame(session);
    set({ session: next });
    if (next.finished && !session.finished)
      useApp
        .getState()
        .update((data) => ({ ...data, completedSessions: data.completedSessions + 1 }));
  },
  setAway: (id) => {
    const away = get().away;
    const players = useApp.getState().data.players;
    if (!away.includes(id) && players.length - away.length <= 2) return false;
    set({ away: away.includes(id) ? away.filter((value) => value !== id) : [...away, id] });
    return true;
  },
  award: (changes, stats = []) => {
    set({ ledger: addPoints(get().ledger, changes, stats) });
    const players = useApp.getState().data.players;
    const message =
      changes.length > 2
        ? ar.awardsCount(changes.length)
        : changes
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
  reset: () =>
    set({
      ledger: emptyLedger(),
      away: [],
      session: null,
      cardsGame: null,
      todGame: null,
      likelyGame: null,
      knowMeGame: null,
    }),
}));
