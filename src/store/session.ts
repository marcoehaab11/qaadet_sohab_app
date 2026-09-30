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
import { TabooState, createTaboo } from '../games/taboo/reducer';
import { CharadesState, createCharades } from '../games/charades/reducer';
import { SpeedState, createSpeed } from '../games/speed/reducer';
import { ImposterState, createImposter } from '../games/imposter/reducer';
import { ProverbState, createProverb } from '../games/proverb/reducer';
import { MemoryState, createMemory } from '../games/memory/reducer';
import { expandTeamPoints, teamsActive } from '../engine/teams';
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
  tabooGame: TabooState | null;
  setTabooGame: (state: TabooState | null) => void;
  startStandaloneTaboo: () => void;
  charadesGame: CharadesState | null;
  setCharadesGame: (state: CharadesState | null) => void;
  startStandaloneCharades: () => void;
  speedGame: SpeedState | null;
  setSpeedGame: (state: SpeedState | null) => void;
  startStandaloneSpeed: () => void;
  imposterGame: ImposterState | null;
  setImposterGame: (state: ImposterState | null) => void;
  startStandaloneImposter: () => void;
  proverbGame: ProverbState | null;
  setProverbGame: (state: ProverbState | null) => void;
  startStandaloneProverb: () => void;
  memoryGame: MemoryState | null;
  setMemoryGame: (state: MemoryState | null) => void;
  startStandaloneMemory: () => void;
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
  tabooGame: null,
  setTabooGame: (tabooGame) => set({ tabooGame }),
  charadesGame: null,
  setCharadesGame: (charadesGame) => set({ charadesGame }),
  speedGame: null,
  setSpeedGame: (speedGame) => set({ speedGame }),
  imposterGame: null,
  setImposterGame: (imposterGame) => set({ imposterGame }),
  proverbGame: null,
  setProverbGame: (proverbGame) => set({ proverbGame }),
  memoryGame: null,
  setMemoryGame: (memoryGame) => set({ memoryGame }),
  startStandaloneCards: () => {
    const data = useApp.getState().data;
    set({
      ledger: emptyLedger(),
      away: [],
      session: null,
      todGame: null,
      likelyGame: null,
      knowMeGame: null,
      tabooGame: null,
      charadesGame: null,
      speedGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
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
      tabooGame: null,
      charadesGame: null,
      speedGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
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
      tabooGame: null,
      charadesGame: null,
      speedGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
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
      tabooGame: null,
      charadesGame: null,
      speedGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
      knowMeGame: createKnowMe(
        data.players.map((p) => ({ ...p, away: false })),
        data.config.knowme?.subjects ?? 3,
        Date.now(),
      ),
    });
  },
  startStandaloneTaboo: () => {
    const data = useApp.getState().data;
    set({
      ledger: emptyLedger(),
      away: [],
      session: null,
      cardsGame: null,
      todGame: null,
      likelyGame: null,
      knowMeGame: null,
      charadesGame: null,
      speedGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
      tabooGame: createTaboo(
        data.players.map((p) => ({ ...p, away: false })),
        data.config.taboo?.turns ?? 1,
        Date.now(),
        data.settings.teams,
      ),
    });
  },
  startStandaloneCharades: () => {
    const data = useApp.getState().data;
    set({
      ledger: emptyLedger(),
      away: [],
      session: null,
      cardsGame: null,
      todGame: null,
      likelyGame: null,
      knowMeGame: null,
      tabooGame: null,
      speedGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
      charadesGame: createCharades(
        data.players.map((p) => ({ ...p, away: false })),
        data.config.charades?.turns ?? 5,
        Date.now(),
      ),
    });
  },
  startStandaloneSpeed: () => {
    const data = useApp.getState().data;
    set({
      ledger: emptyLedger(),
      away: [],
      session: null,
      cardsGame: null,
      todGame: null,
      likelyGame: null,
      knowMeGame: null,
      tabooGame: null,
      charadesGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
      speedGame: createSpeed(data.config.speed?.challenges ?? 5, Date.now()),
    });
  },
  startStandaloneImposter: () => {
    set({
      ledger: emptyLedger(),
      away: [],
      session: null,
      cardsGame: null,
      todGame: null,
      likelyGame: null,
      knowMeGame: null,
      tabooGame: null,
      charadesGame: null,
      speedGame: null,
      imposterGame: createImposter(Date.now()),
      proverbGame: null,
      memoryGame: null,
    });
  },
  startStandaloneProverb: () => {
    const data = useApp.getState().data;
    set({
      ledger: emptyLedger(), away: [], session: null,
      cardsGame: null, todGame: null, likelyGame: null, knowMeGame: null,
      tabooGame: null, charadesGame: null, speedGame: null, imposterGame: null,
      proverbGame: createProverb(data.config.proverb?.rounds ?? 6, Date.now()),
      memoryGame: null,
    });
  },
  startStandaloneMemory: () => {
    const data = useApp.getState().data;
    const config = data.config.memory;
    set({ ledger: emptyLedger(), away: [], session: null,
      cardsGame: null, todGame: null, likelyGame: null, knowMeGame: null,
      tabooGame: null, charadesGame: null, speedGame: null, imposterGame: null, proverbGame: null,
      memoryGame: createMemory(data.players.length * (config?.turns ?? 1), config?.difficulty ?? 9, Date.now()) });
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
      tabooGame: null,
      charadesGame: null,
      speedGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
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
      tabooGame:
        currentGame(session) === 'taboo'
          ? createTaboo(participants, useApp.getState().data.config.taboo?.turns ?? 1, session.seed,
              useApp.getState().data.settings.teams)
          : null,
      charadesGame:
        currentGame(session) === 'charades'
          ? createCharades(
              participants,
              useApp.getState().data.config.charades?.turns ?? 5,
              session.seed,
            )
          : null,
      speedGame:
        currentGame(session) === 'speed'
          ? createSpeed(useApp.getState().data.config.speed?.challenges ?? 5, session.seed)
          : null,
      imposterGame: currentGame(session) === 'imposter' ? createImposter(session.seed) : null,
      proverbGame: currentGame(session) === 'proverb'
        ? createProverb(useApp.getState().data.config.proverb?.rounds ?? 6, session.seed)
        : null,
      memoryGame: currentGame(session) === 'memory'
        ? createMemory(participants.length * (useApp.getState().data.config.memory?.turns ?? 1),
            useApp.getState().data.config.memory?.difficulty ?? 9, session.seed)
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
    const players = useApp.getState().data.players;
    const participants = players.map((player) => ({ ...player, away: get().away.includes(player.id) }));
    const game = get().session?.phase === 'game' ? currentGame(get().session!)
      : get().tabooGame ? 'taboo' : get().charadesGame ? 'charades' : get().speedGame ? 'speed' : null;
    if (game && ['taboo', 'charades', 'speed'].includes(game) &&
      teamsActive(participants, useApp.getState().data.settings.teams))
      changes = expandTeamPoints(changes, participants);
    set({ ledger: addPoints(get().ledger, changes, stats) });
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
      tabooGame: null,
      charadesGame: null,
      speedGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
    }),
}));


