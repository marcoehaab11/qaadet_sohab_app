import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { ar } from '../i18n/ar-EG';
import { avatars, colors } from '../theme';
import { Player } from '../engine/types';
import { assignTeams } from '../engine/teams';
import { SavedData, Settings, migrateSaved, serializeSaved, storageKey } from './persistence';

const defaults = (): SavedData => ({
  schemaVersion: 1,
  players: Array.from({ length: 4 }, (_, i) => ({
    id: Crypto.randomUUID(),
    name: ar.playerName(i + 1),
    emoji: avatars[i]!,
    color: colors[i]!,
  })),
  settings: { sound: true, hold: true, family: false, largeText: false, clearColors: false, teams: false, surprises: false },
  config: {
    imposter: { time: 120 },
    cards: { cards: 8, time: 20 },
    likely: { questions: 3 },
    taboo: { time: 30, turns: 1, difficulty: 0 },
    tod: { turns: 1 },
    charades: { time: 60, turns: 5 },
    speed: { challenges: 5 },
    knowme: { subjects: 3 },
    proverb: { rounds: 6 },
    memory: { time: 5, turns: 1, difficulty: 9 },
    draw: { time: 60, turns: 1 },
  },
  customDecks: {},
  used: {},
  completedSessions: 0,
  onboardingDone: false,
  reviewAskedVersion: null,
  lastSetup: { vibe: 'laugh', length: 3 },
});
type Store = {
  data: SavedData;
  ready: boolean;
  storageBlocked: boolean;
  toast: string | null;
  hydrate: () => Promise<void>;
  update: (fn: (data: SavedData) => SavedData) => void;
  changeSetting: (key: keyof Settings) => void;
  reshuffleTeams: () => void;
  updatePlayer: (id: string, change: Partial<Pick<Player, 'name' | 'emoji'>>) => void;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  notify: (text: string | null) => void;
};
let saveQueue: Promise<void> = Promise.resolve();
export const useApp = create<Store>((set, get) => ({
  data: defaults(),
  ready: false,
  storageBlocked: false,
  toast: null,
  hydrate: async () => {
    if (get().ready) return;
    try {
      const raw = await AsyncStorage.getItem(storageKey);
      if (raw) set({ data: migrateSaved(JSON.parse(raw)) });
    } catch {
      set({ toast: ar.loadError, storageBlocked: true });
    } finally {
      set({ ready: true });
    }
  },
  update: (fn) => {
    const data = fn(get().data);
    const json = serializeSaved(data);
    set({ data });
    if (!get().ready || get().storageBlocked) return;
    saveQueue = saveQueue
      .then(() => AsyncStorage.setItem(storageKey, json))
      .catch(() => {
        set({ toast: ar.saveError });
      });
  },
  changeSetting: (key) =>
    get().update((data) => {
      const enabled = !data.settings[key];
      return {
        ...data,
        settings: { ...data.settings, [key]: enabled },
        players: key === 'teams' && enabled ? assignTeams(data.players, Date.now()) : data.players,
      };
    }),
  reshuffleTeams: () => get().update((data) => ({ ...data, players: assignTeams(data.players, Date.now()) })),
  updatePlayer: (id, change) =>
    get().update((data) => ({
      ...data,
      players: data.players.map((p) => (p.id === id ? { ...p, ...change } : p)),
    })),
  addPlayer: () => {
    const n = get().data.players.length;
    if (n >= 8) return;
    get().update((data) => {
      const players = [
        ...data.players,
        {
          id: Crypto.randomUUID(),
          name: ar.playerName(n + 1),
          emoji: avatars[n]!,
          color: colors[n]!,
        },
      ];
      return { ...data, players: data.settings.teams ? assignTeams(players, Date.now()) : players };
    });
  },
  removePlayer: (id) => {
    if (get().data.players.length > 2)
      get().update((data) => {
        const players = data.players.filter((p) => p.id !== id);
        return { ...data, players: data.settings.teams ? assignTeams(players, Date.now()) : players };
      });
  },
  notify: (toast) => set({ toast }),
}));
