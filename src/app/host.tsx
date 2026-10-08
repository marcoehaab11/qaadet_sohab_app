import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../store';
import { useSession } from '../store/session';
import { currentGame } from '../engine/session';
import { minPlayers } from '../config/release';
import { playableRoutes } from '../config/playable';
import { ar } from '../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../components/ui';
import { Scoreboard } from '../components/Scoreboard';
import { theme } from '../theme';
import { useBetweenGamesAd } from '../ads/useBetweenGamesAd';
const gameEmoji: Record<string, string> = {
  imposter: '🕵️', cards: '🃏', memory: '🧠', likely: '😂', taboo: '🎤',
  speed: '⚡', knowme: '👀', tod: '🔥', charades: '🎭', proverb: '📜', draw: '🎨',
};
export default function Host() {
  const players = useApp((s) => s.data.players);
  const session = useSession((s) => s.session);
  const away = useSession((s) => s.away);
  const ledger = useSession((s) => s.ledger);
  const play = useSession((s) => s.play);
  const advance = useSession((s) => s.advance);
  const undo = useSession((s) => s.undo);
  const prepareHost = useSession((s) => s.prepareHost);
  const adBreak = useBetweenGamesAd(session);
  useEffect(() => { prepareHost(); }, [session?.index, session?.phase, prepareHost]);
  if (adBreak) return <Screen><Text style={styles.title}>فاصل قصير ✦</Text></Screen>;
  if (!session || session.finished)
    return (
      <Screen>
        <Button label={ar.back} onPress={() => router.replace('/')} />
      </Screen>
    );
  const id = currentGame(session);
  if (!id) return null;
  const eligible = players.length - away.length >= minPlayers[id];
  const route = playableRoutes[id];
  const surprise = session.surprises[session.index];
  const skip = () => {
    advance();
    if (session.index + 1 >= session.queue.length) router.replace('/results');
  };
  return (
    <Screen>
      <View style={local.header}>
        <Text style={local.kicker}>قعدة صحاب ✦</Text>
        <Text style={styles.title}>{ar.gameProgress(session.index + 1, session.queue.length)}</Text>
        <View style={local.progressTrack}><View style={[local.progressFill,
          { width: `${((session.index + 1) / session.queue.length) * 100}%` }]} /></View>
      </View>
      {surprise && <Panel>
        <Text style={local.surpriseTitle}>{ar.surpriseTitle}</Text>
        <Text>{ar.surpriseDescriptions[surprise]}</Text>
      </Panel>}
      <View style={local.gameFrame}>
        <View style={local.card}>
          <Text style={local.gameEmoji}>{gameEmoji[id]}</Text>
          <Text style={local.next}>{ar.nextGame}</Text>
          <Text style={local.gameName}>{ar.games[id].name}</Text>
          <Text style={local.gameDesc}>{ar.games[id].desc}</Text>
          <View style={local.divider} />
          {ar.games[id].rules.map((line, index) => (
            <Text key={line} style={local.rule}>{index + 1}. {line}</Text>
          ))}
        </View>
      </View>
      <Text style={local.passHint}>📱 {ar.passPhone}</Text>
      <Button
        label={
          route && eligible ? ar.playGame : route ? ar.minPlayers(minPlayers[id]) : ar.gamePreparing
        }
        disabled={!route || !eligible}
        onPress={() => {
          if (route) {
            play();
            router.push(route);
          }
        }}
      />
      <Button secondary label={ar.skipGame} onPress={skip} />
      {session.index > 0 && (
        <Scoreboard
          players={players.map((p) => ({ ...p, away: away.includes(p.id) }))}
          scores={ledger.scores}
        />
      )}
      <Button secondary label={ar.undo} onPress={undo} />
      <Button secondary label={ar.players} onPress={() => router.push('/players')} />
      <Button secondary label={ar.exitGame} onPress={() => router.replace('/')} />
    </Screen>
  );
}
const local = StyleSheet.create({
  header: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  kicker: { color: theme.gold, fontFamily: theme.bold, fontSize: 14 },
  progressTrack: { width: '100%', height: 7, backgroundColor: '#ffffff20', borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: 7, backgroundColor: theme.gold, borderRadius: 7 },
  surpriseTitle: { color: theme.gold, fontFamily: theme.display, fontSize: 26 },
  gameFrame: { backgroundColor: theme.wood, borderColor: theme.woodLight, borderWidth: 6,
    borderRadius: 28, padding: 15, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  card: { backgroundColor: theme.cream, borderRadius: 19, borderTopWidth: 8,
    borderTopColor: theme.coral, padding: 20, alignItems: 'center', gap: 7 },
  gameEmoji: { fontSize: 63, lineHeight: 76 },
  next: { color: '#74627c', fontSize: 13 },
  gameName: { color: theme.ink, fontFamily: theme.display, fontSize: 36, lineHeight: 48, textAlign: 'center' },
  gameDesc: { color: '#6a536d', textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#d9cfc2', width: '100%', marginVertical: 7 },
  rule: { color: theme.ink, alignSelf: 'stretch', fontSize: 14 },
  passHint: { color: theme.muted, textAlign: 'center', fontSize: 14 },
});
