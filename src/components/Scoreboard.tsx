import { View } from 'react-native';
import { Participant } from '../engine/types';
import { ar } from '../i18n/ar-EG';
import { Panel, styles, Text } from './ui';
export function Scoreboard({
  players,
  scores,
}: {
  players: Participant[];
  scores: Record<string, number>;
}) {
  return (
    <Panel>
      <Text style={styles.title}>{ar.score}</Text>
      {[...players]
        .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
        .map((player) => (
          <View key={player.id} style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text>
              {player.emoji} {player.name} {player.away ? '💤' : ''}
            </Text>
            <Text style={{ writingDirection: 'ltr' }}>{scores[player.id] ?? 0}</Text>
          </View>
        ))}
    </Panel>
  );
}
