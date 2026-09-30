import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { enabledGameIds, GameId, minPlayers } from '../config/release';
import { ar } from '../i18n/ar-EG';
import { useApp } from '../store';
import { Button, Panel, Screen, styles, Text } from '../components/ui';
import { theme, playerColor } from '../theme';
import { Vibe } from '../engine/queue';
import { useSession } from '../store/session';
import { currentGame } from '../engine/session';
import { playableRoutes } from '../config/playable';
import { activeSeason } from '../content/loader';
const icons: Record<GameId, string> = {
  imposter: '🕵️',
  cards: '🃏',
  likely: '😂',
  taboo: '🤫',
  tod: '🔥',
  charades: '🎭',
  speed: '⚡',
  knowme: '🫶',
  proverb: '📜',
  memory: '🧠',
};
const accents = [
  '#d3b4ff',
  '#ffaeae',
  '#ffda70',
  '#a3e5d9',
  '#ffbc94',
  '#bfccff',
  '#ffda70',
  '#f6b9e0',
  '#ffd766',
  '#b9eeab',
];
const vibeIcons: Record<Vibe, string> = {
  laugh: '😂',
  compete: '⚡',
  deceive: '🕵️',
  friends: '🫶',
  random: '🎲',
};
export default function Home() {
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const [selected, setSelected] = useState<GameId | null>(null);
  const session = useSession((s) => s.session);
  const begin = useSession((s) => s.begin);
  const startStandaloneCards = useSession((s) => s.startStandaloneCards);
  const startStandaloneTod = useSession((s) => s.startStandaloneTod);
  const startStandaloneLikely = useSession((s) => s.startStandaloneLikely);
  const startStandaloneKnowMe = useSession((s) => s.startStandaloneKnowMe);
  const startStandaloneTaboo = useSession((s) => s.startStandaloneTaboo);
  const startStandaloneCharades = useSession((s) => s.startStandaloneCharades);
  const startStandaloneSpeed = useSession((s) => s.startStandaloneSpeed);
  const startStandaloneImposter = useSession((s) => s.startStandaloneImposter);
  const startStandaloneProverb = useSession((s) => s.startStandaloneProverb);
  const startStandaloneMemory = useSession((s) => s.startStandaloneMemory);
  const { fontScale } = useWindowDimensions();
  const expandedVibes = data.settings.largeText || fontScale > 1.1;
  const season = activeSeason();
  useEffect(() => {
    if (!data.onboardingDone) router.replace('/onboarding');
  }, [data.onboardingDone]);
  return (
    <Screen>
      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <View>
          <Text style={local.logo}>{ar.name}</Text>
          <Text style={styles.muted}>{ar.tagline}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ar.settings}
          onPress={() => router.push('/settings')}
          style={local.iconButton}
        >
          <Text style={{ fontSize: 22 }}>⚙</Text>
        </Pressable>
      </View>
      <View style={local.badge}>
        <Text style={{ color: theme.gold, fontSize: 12 }}>{ar.offline}</Text>
      </View>
      {data.settings.family && <View style={local.badge}>
        <Text style={{ color: theme.gold, fontSize: 12 }}>👨‍👩‍👧 قعدة عائلية</Text>
      </View>}
      {season && <View style={local.badge}>
        <Text style={{ color: theme.gold, fontSize: 12 }}>{ar.seasons[season]}</Text>
      </View>}
      <Text style={styles.muted}>{ar.preview}</Text>
      <View>
        <Text style={styles.title}>{ar.welcome}</Text>
        <Text style={styles.muted}>{ar.intro}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={ar.editPlayers}
        onPress={() => router.push('/players')}
        style={styles.panel}
      >
        <View style={[styles.row, { justifyContent: 'space-between' }]}>
          <View>
            <Text style={{ fontFamily: theme.bold }}>{ar.playerCount(data.players.length)}</Text>
            <Text style={styles.muted}>{ar.editPlayers}</Text>
          </View>
          <View style={[styles.row, { gap: 0 }]}>
            {data.players.slice(0, 4).map((p) => (
              <Text
                key={p.id}
                style={[
                  local.avatar,
                  { borderWidth: 2, borderColor: playerColor(p.color, data.settings.clearColors) },
                ]}
              >
                {p.emoji}
              </Text>
            ))}
          </View>
        </View>
      </Pressable>
      <Panel>
        <Text style={{ fontFamily: theme.bold }}>{ar.chooseVibe}</Text>
        <View style={local.vibes}>
          {(Object.keys(ar.vibes) as Vibe[]).map((vibe) => (
            <Pressable
              key={vibe}
              accessibilityRole="button"
              accessibilityState={{ selected: data.lastSetup.vibe === vibe }}
              onPress={() => update((d) => ({ ...d, lastSetup: { ...d.lastSetup, vibe } }))}
              style={[
                local.vibe,
                expandedVibes && { flexBasis: '30%' },
                data.lastSetup.vibe === vibe && local.selected,
              ]}
            >
              <Text style={{ fontSize: 23, textAlign: 'center' }}>{vibeIcons[vibe]}</Text>
              <Text style={{ fontSize: 12, textAlign: 'center' }}>{ar.vibes[vibe]}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ fontFamily: theme.bold }}>{ar.chooseLength}</Text>
        <View style={styles.row}>
          {([3, 5] as const).map((length) => (
            <Pressable
              key={length}
              accessibilityRole="button"
              accessibilityState={{ selected: data.lastSetup.length === length }}
              style={[local.length, data.lastSetup.length === length && local.selected]}
              onPress={() => update((d) => ({ ...d, lastSetup: { ...d.lastSetup, length } }))}
            >
              <Text style={{ textAlign: 'center', fontFamily: theme.bold }}>
                {length === 3 ? ar.short : ar.long}
              </Text>
              <Text style={[styles.muted, { textAlign: 'center' }]}>
                {length === 3 ? ar.threeGames : ar.fiveGames}
              </Text>
            </Pressable>
          ))}
        </View>
      </Panel>
      <Button
        label={session && !session.finished ? ar.resumeSession : ar.startSession}
        onPress={() => {
          if (!session || session.finished) {
            begin();
            router.push('/host');
          } else {
            const game = currentGame(session);
            router.push(
              session.phase === 'game' && game ? (playableRoutes[game] ?? '/host') : '/host',
            );
          }
        }}
      />
      <View>
        <Text style={styles.title}>{ar.table}</Text>
        <Text style={styles.muted}>{ar.tableHint}</Text>
      </View>
      <View style={local.table}>
        {enabledGameIds.map((id, index) => (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityLabel={ar.games[id].name}
            onPress={() => {
              if (data.players.length < minPlayers[id]) {
                useApp.getState().notify(ar.minPlayers(minPlayers[id]));
                return;
              }
              if (id === 'cards' && (!session || session.finished)) {
                startStandaloneCards();
                router.push('/game/cards');
              } else if (id === 'tod' && (!session || session.finished)) {
                startStandaloneTod();
                router.push('/game/tod');
              } else if (id === 'likely' && (!session || session.finished)) {
                startStandaloneLikely();
                router.push('/game/likely');
              } else if (id === 'knowme' && (!session || session.finished)) {
                startStandaloneKnowMe();
                router.push('/game/knowme');
              } else if (id === 'taboo' && (!session || session.finished)) {
                startStandaloneTaboo();
                router.push('/game/taboo');
              } else if (id === 'charades' && (!session || session.finished)) {
                startStandaloneCharades();
                router.push('/game/charades');
              } else if (id === 'speed' && (!session || session.finished)) {
                startStandaloneSpeed();
                router.push('/game/speed');
              } else if (id === 'imposter' && (!session || session.finished)) {
                startStandaloneImposter();
                router.push('/game/imposter');
              } else if (id === 'proverb' && (!session || session.finished)) {
                startStandaloneProverb();
                router.push('/game/proverb');
              } else if (id === 'memory' && (!session || session.finished)) {
                startStandaloneMemory();
                router.push('/game/memory');
              } else setSelected(id);
            }}
            style={[
              local.card,
              {
                backgroundColor: accents[index],
                transform: [{ rotate: index % 2 ? '2deg' : '-2deg' }],
              },
            ]}
          >
            <Text style={{ fontSize: 38, lineHeight: 54 }}>{icons[id]}</Text>
            <Text style={local.cardName}>{ar.games[id].name}</Text>
            {data.settings.teams && ['taboo', 'charades', 'speed'].includes(id) &&
              <Text style={local.cardDesc}>{ar.teamBadge}</Text>}
            <Text style={local.cardDesc}>{ar.games[id].desc}</Text>
            <Text style={local.cardMeta}>{ar.minPlayers(minPlayers[id])}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.muted, { textAlign: 'center' }]}>{ar.previewNotice}</Text>
      <Modal
        visible={selected !== null}
        transparent
        animationType="none"
        onRequestClose={() => setSelected(null)}
      >
        <View style={local.scrim}>
          <View style={local.sheet} accessibilityViewIsModal>
            {selected && (
              <>
                <Text style={{ fontSize: 48, lineHeight: 64, textAlign: 'center' }}>
                  {icons[selected]}
                </Text>
                <Text style={[styles.title, { textAlign: 'center' }]}>
                  {ar.games[selected].name}
                </Text>
                <Text style={{ color: theme.gold }}>{ar.previewRules}</Text>
                {ar.games[selected].rules.map((line, i) => (
                  <Text key={line}>
                    {i + 1}. {line}
                  </Text>
                ))}
                <Button label={ar.close} onPress={() => setSelected(null)} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
const local = StyleSheet.create({
  logo: { fontFamily: theme.display, fontSize: 44, lineHeight: 57, color: theme.gold },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#342818',
  },
  avatar: {
    fontSize: 25,
    lineHeight: 38,
    backgroundColor: theme.night,
    borderRadius: 24,
    paddingHorizontal: 4,
  },
  vibes: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  vibe: {
    flex: 1,
    minHeight: 70,
    justifyContent: 'center',
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 15,
  },
  selected: { borderColor: theme.gold, backgroundColor: '#493a24', borderWidth: 2 },
  length: {
    flex: 1,
    minWidth: 115,
    minHeight: 75,
    padding: 10,
    borderColor: theme.line,
    borderWidth: 1,
    borderRadius: 16,
  },
  table: {
    backgroundColor: theme.felt,
    borderWidth: 7,
    borderColor: theme.wood,
    borderRadius: 30,
    padding: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 18,
  },
  card: {
    width: '46%',
    borderRadius: 16,
    padding: 13,
    minHeight: 200,
    borderBottomWidth: 5,
    borderBottomColor: '#00000030',
  },
  cardName: { color: theme.night, fontFamily: theme.display, fontSize: 22, lineHeight: 28 },
  cardDesc: { color: '#372a42', fontSize: 11, lineHeight: 20 },
  cardMeta: { color: '#372a42', fontFamily: theme.bold, fontSize: 11, marginTop: 9 },
  scrim: {
    flex: 1,
    backgroundColor: '#000000b0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: theme.surface,
    padding: 24,
    gap: 14,
    borderRadius: 28,
    direction: 'rtl',
  },
});
