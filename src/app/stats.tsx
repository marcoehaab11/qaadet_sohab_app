import { useState } from 'react';
import { Modal, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../store';
import { GameId } from '../config/release';
import { ar } from '../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../components/ui';
import { theme } from '../theme';

export default function Stats() {
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const [confirm, setConfirm] = useState(false);
  const topGames = (Object.entries(data.playCounts) as [GameId, number][])
    .sort((a, b) => b[1] - a[1]).slice(0, 5);
  const recent = data.history.slice(-8).reverse();
  return <Screen>
    <Text style={styles.title}>{ar.stats}</Text>
    <Panel>
      <Text style={styles.title}>{ar.totalSessions(data.completedSessions)}</Text>
      {data.players.map((player) => {
        const summary = data.career[player.id] ?? { wins: 0, longestStreak: 0 };
        return <View key={player.id} style={{ gap: 2 }}>
          <Text>{player.emoji} {player.name}</Text>
          <Text style={styles.muted}>{ar.allTimeWins(summary.wins)} · {ar.longestStreak(summary.longestStreak)}</Text>
        </View>;
      })}
    </Panel>
    <Panel>
      <Text style={styles.title}>{ar.topGames}</Text>
      {topGames.length ? topGames.map(([id, count]) => <Text key={id}>
        {ar.games[id].name} · {count}
      </Text>) : <Text style={styles.muted}>{ar.noHistory}</Text>}
    </Panel>
    <Panel>
      <Text style={styles.title}>{ar.recentSessions}</Text>
      {recent.length ? recent.map((record) => <View key={record.id} style={{ gap: 2 }}>
        <Text>{new Date(record.date).toLocaleDateString('ar-EG')}</Text>
        <Text style={styles.muted}>{ar.historyWinner}: {record.players.filter((player) => record.winnerIds.includes(player.id))
          .map((player) => `${player.emoji} ${player.name}`).join('، ')}</Text>
      </View>) : <Text style={styles.muted}>{ar.noHistory}</Text>}
    </Panel>
    <Button secondary label={ar.clearHistory} disabled={!data.completedSessions && !topGames.length}
      onPress={() => setConfirm(true)} />
    <Button label={ar.back} onPress={() => router.back()} />
    <Modal visible={confirm} transparent animationType="none" onRequestClose={() => setConfirm(false)}>
      <View style={{ flex: 1, backgroundColor: '#000000bb', justifyContent: 'center', padding: 24 }}>
        <Panel style={{ backgroundColor: theme.surface }}>
          <Text style={styles.title}>{ar.clearHistory}</Text>
          <Text>{ar.clearHistoryConfirm}</Text>
          <Button secondary label={ar.cancel} onPress={() => setConfirm(false)} />
          <Button label={ar.clearHistory} onPress={() => {
            update((saved) => ({ ...saved, history: [], playCounts: {}, career: {}, completedSessions: 0 }));
            setConfirm(false);
          }} />
        </Panel>
      </View>
    </Modal>
  </Screen>;
}
