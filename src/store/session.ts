import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { addPoints, undoPoints } from '../engine/scoring';
import { emptyLedger, Ledger, ScoreChange, StatChange } from '../engine/types';
import {
  Session,
  createSession,
  currentGame,
  finishWithTie,
  leaders,
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
import { DrawState, createDraw } from '../games/draw/reducer';
import { applyHostSurprise, eventScores, SurpriseProgress } from '../engine/surprises';
import { useApp } from './index';
// Ephemeral by design: scores, counters, undo and sit-out state never reach AsyncStorage.
type SessionStore = {
  ledger: Ledger;
  away: string[];
  session: Session | null;
  tieGame: SpeedState | null;
  tiedIds: string[];
  setTieGame: (state: SpeedState | null) => void;
  resolveTie: () => void;
  surpriseProgress: SurpriseProgress;
  prepareHost: () => void;
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
  drawGame: DrawState | null;
  setDrawGame: (state: DrawState | null) => void;
  startStandaloneDraw: () => void;
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
  tieGame: null,
  tiedIds: [],
  setTieGame: (tieGame) => set({ tieGame }),
  resolveTie: () => {
    const session = get().session;
    if (!session || session.phase !== 'tiebreak') return;
    set({ session: { ...session, phase: 'results', finished: true }, tieGame: null });
    useApp.getState().update((data) => ({ ...data, completedSessions: data.completedSessions + 1 }));
  },
  surpriseProgress: { applied: [] },
  prepareHost: () => {
    const { session, surpriseProgress, ledger, away } = get();
    if (!session || session.phase !== 'host' || session.finished) return;
    const activeIds = useApp.getState().data.players.filter((player) => !away.includes(player.id))
      .map((player) => player.id);
    const result = applyHostSurprise(surpriseProgress, session.index,
      session.surprises[session.index], activeIds, ledger, session.seed);
    if (result.progress !== surpriseProgress) set({ surpriseProgress: result.progress });
    if (result.changes.length) get().award(result.changes);
  },
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
  drawGame: null,
  setDrawGame: (drawGame) => set({ drawGame }),
  startStandaloneCards: () => {
    const data = useApp.getState().data;
    set({
      ledger: emptyLedger(),
      away: [],
      session: null,
      tieGame: null,
      tiedIds: [],
      surpriseProgress: { applied: [] },
      todGame: null,
      likelyGame: null,
      knowMeGame: null,
      tabooGame: null,
      charadesGame: null,
      speedGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
      drawGame: null,
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
      tieGame: null,
      tiedIds: [],
      surpriseProgress: { applied: [] },
      cardsGame: null,
      likelyGame: null,
      knowMeGame: null,
      tabooGame: null,
      charadesGame: null,
      speedGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
      drawGame: null,
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
      tieGame: null,
      tiedIds: [],
      surpriseProgress: { applied: [] },
      cardsGame: null,
      todGame: null,
      knowMeGame: null,
      tabooGame: null,
      charadesGame: null,
      speedGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
      drawGame: null,
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
      tieGame: null,
      tiedIds: [],
      surpriseProgress: { applied: [] },
      cardsGame: null,
      todGame: null,
      likelyGame: null,
      tabooGame: null,
      charadesGame: null,
      speedGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
      drawGame: null,
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
      tieGame: null,
      tiedIds: [],
      surpriseProgress: { applied: [] },
      cardsGame: null,
      todGame: null,
      likelyGame: null,
      knowMeGame: null,
      charadesGame: null,
      speedGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
      drawGame: null,
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
      tieGame: null,
      tiedIds: [],
      surpriseProgress: { applied: [] },
      cardsGame: null,
      todGame: null,
      likelyGame: null,
      knowMeGame: null,
      tabooGame: null,
      speedGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
      drawGame: null,
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
      tieGame: null,
      tiedIds: [],
      surpriseProgress: { applied: [] },
      cardsGame: null,
      todGame: null,
      likelyGame: null,
      knowMeGame: null,
      tabooGame: null,
      charadesGame: null,
      imposterGame: null,
      proverbGame: null,
      memoryGame: null,
      drawGame: null,
      speedGame: createSpeed(data.config.speed?.challenges ?? 5, Date.now()),
    });
  },
  startStandaloneImposter: () => {
    set({
      ledger: emptyLedger(),
      away: [],
      session: null,
      tieGame: null,
      tiedIds: [],
      surpriseProgress: { applied: [] },
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
      drawGame: null,
    });
  },
  startStandaloneProverb: () => {
    const data = useApp.getState().data;
    set({
      ledger: emptyLedger(), away: [], session: null,
      tieGame: null,
      tiedIds: [], surpriseProgress: { applied: [] },
      cardsGame: null, todGame: null, likelyGame: null, knowMeGame: null,
      tabooGame: null, charadesGame: null, speedGame: null, imposterGame: null,
      proverbGame: createProverb(data.config.proverb?.rounds ?? 6, Date.now()),
      memoryGame: null,
      drawGame: null,
    });
  },
  startStandaloneMemory: () => {
    const data = useApp.getState().data;
    const config = data.config.memory;
    set({ ledger: emptyLedger(), away: [], session: null,
      tieGame: null,
      tiedIds: [], surpriseProgress: { applied: [] },
      cardsGame: null, todGame: null, likelyGame: null, knowMeGame: null,
      tabooGame: null, charadesGame: null, speedGame: null, imposterGame: null, proverbGame: null,
      memoryGame: createMemory(data.players.length * (config?.turns ?? 1), config?.difficulty ?? 9, Date.now()) });
  },
  startStandaloneDraw: () => {
    const data = useApp.getState().data;
    set({ ledger: emptyLedger(), away: [], session: null,
      tieGame: null,
      tiedIds: [], surpriseProgress: { applied: [] },
      cardsGame: null, todGame: null, likelyGame: null, knowMeGame: null,
      tabooGame: null, charadesGame: null, speedGame: null, imposterGame: null,
      proverbGame: null, memoryGame: null,
      drawGame: createDraw(data.players.map((player) => ({ ...player, away: false })),
        data.config.draw?.turns ?? 1, Date.now()) });
  },
  begin: () => {
    const players = useApp.getState().data.players;
    const { vibe, length } = useApp.getState().data.lastSetup;
    set({
      ledger: emptyLedger(),
      tieGame: null,
      tiedIds: [],
      surpriseProgress: { applied: [] },
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
      drawGame: null,
      away: [],
      session: createSession(vibe, length, players.length, Date.now(),
        useApp.getState().data.settings.surprises),
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
      drawGame: currentGame(session) === 'draw'
        ? createDraw(participants, useApp.getState().data.config.draw?.turns ?? 1, session.seed)
        : null,
    });
  },
  advance: () => {
    const session = get().session;
    if (!session || session.finished || session.phase === 'tiebreak') return;
    const activeIds = useApp.getState().data.players.filter((player) => !get().away.includes(player.id))
      .map((player) => player.id);
    const next = finishWithTie(session, activeIds, get().ledger);
    const tiedIds = next.phase === 'tiebreak' ? leaders(activeIds, get().ledger) : [];
    set({ session: next, tiedIds, tieGame: next.phase === 'tiebreak' ? createSpeed(1, next.seed) : null });
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
    const live = get().session;
    if (live?.phase === 'game') changes = eventScores(changes, live.surprises[live.index]);
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
      tieGame: null,
      tiedIds: [],
      surpriseProgress: { applied: [] },
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
      drawGame: null,
    }),
}));




