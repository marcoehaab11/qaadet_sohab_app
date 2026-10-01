import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { enabledGameIds, GameId, minPlayers } from '../config/release';
import { ar } from '../i18n/ar-EG';
import { useApp } from '../store';
import { Button, Panel, Screen, Text } from '../components/ui';
import { theme, playerColor } from '../theme';
import { Vibe } from '../engine/queue';
import { useSession } from '../store/session';
import { currentGame } from '../engine/session';
import { playableRoutes } from '../config/playable';
import { activeSeason } from '../content/loader';

const gameVisuals: Record<GameId, { emoji: string; accent: string; caption: string }> = {
  imposter: { emoji: '🕵️', accent: '#9b6bff', caption: 'واحد بس مش عارف الكلمة' },
  cards: { emoji: '🃏', accent: '#ff5d5d', caption: 'كل كارت عليه Action' },
  memory: { emoji: '🧠', accent: '#35d0c9', caption: 'احفظ قبل ما تختفي' },
  likely: { emoji: '😂', accent: '#ffc83d', caption: 'صوّتوا على مين فيكم' },
  taboo: { emoji: '🎤', accent: '#ff7ab6', caption: 'من غير الكلمات الممنوعة' },
  speed: { emoji: '⚡', accent: '#ff9f43', caption: 'هاتها ودوس الأول' },
  knowme: { emoji: '👀', accent: '#5ea8ff', caption: 'خمّنوا إجابتي السرية' },
  tod: { emoji: '🔥', accent: '#ff5d5d', caption: 'حسب مستوى الجرأة' },
  charades: { emoji: '🎭', accent: '#9be15d', caption: 'من غير ولا كلمة' },
  proverb: { emoji: '📜', accent: '#ffc83d', caption: 'أول واحد يكمّله' },
  draw: { emoji: '🎨', accent: '#ff7ab6', caption: 'ارسم والباقي يخمّنوا' },
};
const tableOrder: GameId[] = [
  'imposter', 'cards', 'memory', 'likely', 'taboo', 'speed', 'knowme', 'tod', 'charades', 'proverb', 'draw',
];
const vibeIcons: Record<Vibe, string> = {
  laugh: '😂', compete: '🧠', deceive: '🕵️', friends: '❤️', random: '🎲',
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
  const startStandaloneDraw = useSession((s) => s.startStandaloneDraw);
  const { fontScale } = useWindowDimensions();
  const expandedVibes = data.settings.largeText || fontScale > 1.1;
  const season = activeSeason(new Date(), data.seasonOverride);

  useEffect(() => {
    if (!data.onboardingDone) router.replace('/onboarding');
  }, [data.onboardingDone]);

  const startSession = () => {
    if (!session || session.finished) {
      begin();
      router.push('/host');
    } else {
      const game = currentGame(session);
      router.push(session.phase === 'tiebreak' ? '/tiebreak'
        : session.phase === 'game' && game ? (playableRoutes[game] ?? '/host') : '/host');
    }
  };

  const launchGame = (id: GameId) => {
    if (data.players.length < minPlayers[id]) {
      useApp.getState().notify(ar.minPlayers(minPlayers[id]));
      return;
    }
    setSelected(id);
  };

  const startSelectedGame = () => {
    if (!selected) return;
    const starters: Partial<Record<GameId, () => void>> = {
      cards: startStandaloneCards, tod: startStandaloneTod, likely: startStandaloneLikely,
      knowme: startStandaloneKnowMe, taboo: startStandaloneTaboo, charades: startStandaloneCharades,
      speed: startStandaloneSpeed, imposter: startStandaloneImposter, proverb: startStandaloneProverb,
      memory: startStandaloneMemory, draw: startStandaloneDraw,
    };
    const start = starters[selected];
    const route = playableRoutes[selected];
    if (start && route) {
      setSelected(null);
      start();
      router.push(route);
    }
  };

  return (
    <Screen>
      <View style={local.header}>
        <View style={local.headerActions}>
          <Pressable accessibilityRole="button" accessibilityLabel={ar.settings}
            onPress={() => router.push('/settings')} style={local.iconButton}>
            <Text style={local.iconButtonText}>⚙</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={ar.stats}
            onPress={() => router.push('/stats')} style={local.iconButton}>
            <Text style={local.iconButtonText}>📊</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="أسئلة الشلة"
            onPress={() => router.push('/custom')} style={local.iconButton}>
            <Text style={local.iconButtonText}>✍️</Text>
          </Pressable>
        </View>
        <View style={local.brand}>
          <View style={local.brandRow}>
            <Text style={[local.logoWord, local.logoGold]}>قعدة</Text>
            <Text style={[local.logoWord, local.logoCream]}>صحاب</Text>
          </View>
          <Text style={local.tagline}>التطبيق هو الـhost بتاع القعدة 🎲</Text>
        </View>
      </View>

      {(data.settings.family || season) && <View style={local.badges}>
        {data.settings.family && <Text style={local.badge}>👨‍👩‍👧 قعدة عائلية</Text>}
        {season && <Text style={local.badge}>{ar.seasons[season]}</Text>}
      </View>}

      <Pressable accessibilityRole="button" accessibilityLabel={ar.editPlayers}
        onPress={() => router.push('/players')} style={local.playerStrip}>
        <View style={local.playerCopy}>
          <Text style={local.playerTitle}>مين قاعدين؟ 👤 {data.players.length}</Text>
          <Text style={local.playerSubtitle}>{data.players.length} لاعبين · دوس للتعديل</Text>
        </View>
        <View style={local.avatarStack}>
          {data.players.slice(0, 4).map((p) => <View key={p.id} style={[
            local.avatarBubble,
            { backgroundColor: playerColor(p.color, data.settings.clearColors) },
          ]}><Text style={local.avatarEmoji}>{p.emoji}</Text></View>)}
        </View>
        <Text style={local.arrow}>←</Text>
      </Pressable>

      <Panel style={local.setupPanel}>
        <Text style={local.sectionTitle}>اختاروا القعدة</Text>
        <View style={local.vibes}>
          {(Object.keys(ar.vibes) as Vibe[]).map((vibe) => {
            const active = data.lastSetup.vibe === vibe;
            return <Pressable key={vibe} accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => update((d) => ({ ...d, lastSetup: { ...d.lastSetup, vibe } }))}
              style={[local.vibe, expandedVibes && local.vibeExpanded, active && local.vibeSelected]}>
              <Text style={local.vibeEmoji}>{vibeIcons[vibe]}</Text>
              <Text numberOfLines={1} style={local.vibeLabel}>{ar.vibes[vibe]}</Text>
            </Pressable>;
          })}
        </View>
        <View style={local.lengthSegment}>
          {([3, 5] as const).map((length) => {
            const active = data.lastSetup.length === length;
            return <Pressable key={length} accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => update((d) => ({ ...d, lastSetup: { ...d.lastSetup, length } }))}
              style={[local.lengthOption, active && local.lengthSelected]}>
              <Text style={[local.lengthTitle, active && local.lengthTextSelected]}>
                {length === 3 ? '🎉 ' : '🔥 '}{length === 3 ? ar.short : ar.long}
              </Text>
              <Text style={[local.lengthDetail, active && local.lengthDetailSelected]}>
                {length === 3 ? '٣ ألعاب · ١٠ دقايق' : '٥ ألعاب ونقط · ٣٠ دقيقة'}
              </Text>
            </Pressable>;
          })}
        </View>
        <Button label={session && !session.finished ? ar.resumeSession : ar.startSession} onPress={startSession} />
      </Panel>

      <Text style={local.tableHeading}>أو اختاروا لعبة من على الترابيزة 👇</Text>
      <LinearGradient colors={[theme.woodLight, '#71421f', theme.wood]} style={local.tableFrame}>
        <LinearGradient colors={[theme.feltLight, theme.felt, theme.feltDark]} style={local.felt}>
          {tableOrder.filter((id) => enabledGameIds.includes(id)).map((id, index) => {
            const visual = gameVisuals[id];
            const needsPlayers = data.players.length < minPlayers[id];
            return <Pressable key={id} accessibilityRole="button"
              accessibilityLabel={ar.games[id].name} accessibilityHint={visual.caption}
              onPress={() => launchGame(id)}
              style={({ pressed }) => [local.card, {
                transform: [{ rotate: pressed ? '0deg' : index % 2 ? '2deg' : '-2deg' }, { scale: pressed ? 0.97 : 1 }],
              }]}>
              <View pointerEvents="none" style={[local.cardOutline, { borderColor: visual.accent + '77' }]} />
              <View pointerEvents="none" style={[local.cardBand, { backgroundColor: visual.accent }]} />
              {needsPlayers && <Text style={local.needBadge}>{ar.minPlayers(minPlayers[id])}</Text>}
              <Text style={local.cardEmoji}>{visual.emoji}</Text>
              <Text numberOfLines={2} style={local.cardName}>{ar.games[id].name}</Text>
              <Text numberOfLines={2} style={local.cardCaption}>{visual.caption}</Text>
              {data.settings.teams && ['taboo', 'charades', 'speed'].includes(id) &&
                <Text style={local.teamBadge}>{ar.teamBadge}</Text>}
            </Pressable>;
          })}
        </LinearGradient>
      </LinearGradient>
      <Text style={local.footer}>{ar.offline} · نسخة للتجربة</Text>

      <Modal visible={selected !== null} transparent animationType="fade"
        onRequestClose={() => setSelected(null)}>
        <View style={local.scrim}>
          <View style={local.sheet} accessibilityViewIsModal>
            {selected && <>
              <Text style={local.sheetEmoji}>{gameVisuals[selected].emoji}</Text>
              <Text style={local.sheetTitle}>{ar.games[selected].name}</Text>
              <Text style={local.sheetIntro}>{ar.previewRules}</Text>
              {ar.games[selected].rules.map((line, i) =>
                <Text key={line} style={local.sheetRule}>{i + 1}. {line}</Text>)}
              {session && !session.finished &&
                <Text style={local.sheetWarning}>{ar.previewActiveWarning}</Text>}
              <Button label={ar.previewStart} onPress={startSelectedGame} />
              <Button secondary label={ar.previewBack} onPress={() => setSelected(null)} />
            </>}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const local = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  headerActions: { flexDirection: 'row', gap: 6, paddingTop: 5 },
  iconButton: { width: 41, height: 41, borderRadius: 14, backgroundColor: '#ffffff14', borderWidth: 1,
    borderColor: '#ffffff20', alignItems: 'center', justifyContent: 'center' },
  iconButtonText: { fontSize: 19, lineHeight: 27, textAlign: 'center' },
  brand: { alignItems: 'flex-end', flexShrink: 1 },
  brandRow: { flexDirection: 'row', gap: 5, transform: [{ rotate: '-2deg' }] },
  logoWord: { fontFamily: theme.display, fontSize: 44, lineHeight: 54,
    textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 1 },
  logoGold: { color: theme.gold, textShadowColor: '#8a4b00' },
  logoCream: { color: theme.cream, textShadowColor: theme.coral },
  tagline: { color: theme.muted, fontSize: 12, marginTop: 1, textAlign: 'right' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { color: theme.gold, fontSize: 12, fontFamily: theme.bold, backgroundColor: '#46351d',
    borderRadius: 12, borderWidth: 1, borderColor: '#ffc83d50', paddingHorizontal: 10, paddingVertical: 2 },
  playerStrip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: '#2b2138', borderWidth: 1, borderColor: '#ffffff23', borderRadius: 20, minHeight: 78 },
  playerCopy: { flex: 1, gap: 1 },
  playerTitle: { fontFamily: theme.bold, fontSize: 16 },
  playerSubtitle: { color: theme.muted, fontSize: 11 },
  avatarStack: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  avatarBubble: { width: 33, height: 33, borderRadius: 17, borderWidth: 2, borderColor: theme.night,
    marginHorizontal: -4, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 20, lineHeight: 28, textAlign: 'center' },
  arrow: { color: theme.muted, fontSize: 23, lineHeight: 30 },
  setupPanel: { gap: 12 },
  sectionTitle: { fontFamily: theme.display, fontSize: 24, lineHeight: 32 },
  vibes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  vibe: { flexGrow: 1, flexBasis: 0, minWidth: 55, minHeight: 82, borderRadius: 16, borderWidth: 2,
    borderColor: 'transparent', backgroundColor: '#130d1d99', alignItems: 'center', justifyContent: 'center', gap: 3 },
  vibeExpanded: { flexBasis: '30%' },
  vibeSelected: { borderColor: theme.gold, backgroundColor: '#493823' },
  vibeEmoji: { fontSize: 25, lineHeight: 33, textAlign: 'center' },
  vibeLabel: { fontFamily: theme.bold, fontSize: 12, textAlign: 'center' },
  lengthSegment: { flexDirection: 'row', gap: 6, backgroundColor: '#130d1d99', borderRadius: 16, padding: 5 },
  lengthOption: { flex: 1, minHeight: 66, borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 5 },
  lengthSelected: { backgroundColor: theme.cream },
  lengthTitle: { fontFamily: theme.bold, fontSize: 14, textAlign: 'center' },
  lengthDetail: { color: theme.muted, fontSize: 11, textAlign: 'center' },
  lengthTextSelected: { color: theme.ink },
  lengthDetailSelected: { color: '#6f5f84' },
  tableHeading: { fontFamily: theme.display, fontSize: 23, lineHeight: 34, textAlign: 'center' },
  tableFrame: { borderRadius: 36, padding: 11, shadowColor: '#000', shadowOpacity: 0.4,
    shadowRadius: 26, shadowOffset: { width: 0, height: 16 }, elevation: 8 },
  felt: { borderRadius: 27, padding: 12, flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 12 },
  card: { width: '46%', minHeight: 144, paddingHorizontal: 8, paddingVertical: 13, borderRadius: 16,
    backgroundColor: theme.cream, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    borderBottomWidth: 5, borderBottomColor: '#00000035', gap: 1 },
  cardOutline: { position: 'absolute', top: 7, right: 7, bottom: 8, left: 7,
    borderWidth: 1, borderStyle: 'dashed', borderRadius: 11 },
  cardBand: { position: 'absolute', top: 0, left: 0, right: 0, height: 7 },
  cardEmoji: { fontSize: 35, lineHeight: 46, textAlign: 'center' },
  cardName: { color: theme.ink, fontFamily: theme.bold, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  cardCaption: { color: '#6f5f84', fontSize: 11, lineHeight: 17, textAlign: 'center' },
  needBadge: { position: 'absolute', top: 8, left: 8, zIndex: 1, color: '#fff',
    backgroundColor: theme.coral, borderRadius: 8, paddingHorizontal: 5, fontSize: 9 },
  teamBadge: { color: theme.ink, backgroundColor: theme.cyan, fontSize: 10,
    paddingHorizontal: 6, borderRadius: 6, marginTop: 2 },
  footer: { color: theme.muted, fontSize: 12, textAlign: 'center', opacity: 0.8 },
  scrim: { flex: 1, backgroundColor: '#000000b9', alignItems: 'center', justifyContent: 'center', padding: 20 },
  sheet: { width: '100%', maxWidth: 410, backgroundColor: theme.cream, padding: 22, gap: 10,
    borderRadius: 24, direction: 'rtl', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 25 },
  sheetEmoji: { fontSize: 52, lineHeight: 68, textAlign: 'center' },
  sheetTitle: { color: theme.ink, fontFamily: theme.display, fontSize: 31, lineHeight: 40, textAlign: 'center' },
  sheetIntro: { color: '#8a4b00', fontFamily: theme.bold, fontSize: 16 },
  sheetRule: { color: theme.ink, fontSize: 15, lineHeight: 26 },
  sheetWarning: { color: '#963b35', fontFamily: theme.bold, fontSize: 13,
    backgroundColor: '#ff5d5d1c', padding: 10, borderRadius: 10 },
});
