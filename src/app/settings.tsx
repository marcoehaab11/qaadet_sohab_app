import { Switch, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../store';
import { Settings } from '../store/persistence';
import { ar } from '../i18n/ar-EG';
import { theme } from '../theme';
import { Button, Panel, Screen, styles, Text } from '../components/ui';
import { GameId } from '../config/release';
const configOptions: { game: GameId; key: string; choices: number[] }[] = [
  { game: 'imposter', key: 'time', choices: [60, 120, 180] },
  { game: 'cards', key: 'cards', choices: [5, 8, 12] },
  { game: 'cards', key: 'time', choices: [15, 20, 30] },
  { game: 'likely', key: 'questions', choices: [3, 5, 8] },
  { game: 'taboo', key: 'time', choices: [30, 60, 90] },
  { game: 'taboo', key: 'turns', choices: [1, 2, 3] },
  { game: 'taboo', key: 'difficulty', choices: [0, 1, 2] },
  { game: 'tod', key: 'turns', choices: [1, 2, 3] },
  { game: 'charades', key: 'time', choices: [30, 60, 90] },
  { game: 'charades', key: 'turns', choices: [3, 5, 8] },
  { game: 'speed', key: 'challenges', choices: [3, 5, 8] },
  { game: 'knowme', key: 'subjects', choices: [2, 3, 5] },
  { game: 'proverb', key: 'rounds', choices: [4, 6, 10] },
  { game: 'memory', key: 'time', choices: [3, 5, 8] },
  { game: 'memory', key: 'turns', choices: [1, 2, 3] },
  { game: 'memory', key: 'difficulty', choices: [6, 9, 12] },
  { game: 'draw', key: 'time', choices: [45, 60, 90] },
  { game: 'draw', key: 'turns', choices: [1, 2, 3] },
];
export default function SettingsScreen() {
  const settings = useApp((s) => s.data.settings);
  const change = useApp((s) => s.changeSetting);
  const config = useApp((s) => s.data.config);
  const update = useApp((s) => s.update);
  const reshuffleTeams = useApp((s) => s.reshuffleTeams);
  const playerCount = useApp((s) => s.data.players.length);
  return (
    <Screen>
      <Text style={styles.title}>{ar.settings}</Text>
      <Text style={styles.muted}>{ar.settingsHint}</Text>
      <Panel>
        {(Object.keys(settings) as (keyof Settings)[]).map((key) => (
          <View key={key} style={[styles.row, { justifyContent: 'space-between', minHeight: 58 }]}>
            <Text>{ar[key]}</Text>
            <Switch
              accessibilityLabel={ar[key]}
              value={settings[key]}
              onValueChange={() => change(key)}
              trackColor={{ false: theme.line, true: theme.gold }}
              thumbColor={theme.cream}
              style={{ minHeight: 48 }}
            />
          </View>
        ))}
      </Panel>
      {settings.teams && <Panel>
        {playerCount < 4 && <Text style={styles.muted}>{ar.teamsNeedFour}</Text>}
        <Button secondary label={ar.reshuffleTeams} onPress={reshuffleTeams} />
      </Panel>}
      <Text style={styles.title}>{ar.gameSettings}</Text>
      {configOptions.map(({ game, key, choices }) => (
        <Panel key={`${game}:${key}`}>
          <Text style={{ fontFamily: theme.bold }}>
            {ar.games[game].name} ·{' '}
            {(ar.settingsOptions as Record<GameId, Record<string, string>>)[game][key]}
          </Text>
          <View style={styles.row}>
            {choices.map((choice) => (
              <View key={choice} style={{ flex: 1, minWidth: 65 }}>
                <Button
                  secondary={config[game]?.[key] !== choice}
                  label={game === 'taboo' && key === 'difficulty'
                    ? ar.tabooDifficulty[choice as 0 | 1 | 2] : String(choice)}
                  onPress={() =>
                    update((data) => ({
                      ...data,
                      config: { ...data.config, [game]: { ...data.config[game], [key]: choice } },
                    }))
                  }
                />
              </View>
            ))}
          </View>
        </Panel>
      ))}
      <Text style={styles.muted}>{ar.localOnly}</Text>
      <Button secondary label="أسئلة الشلة 🫶" onPress={() => router.push('/custom')} />
      <Button secondary label="الخصوصية" onPress={() => router.push('/privacy')} />
      <Button secondary label={ar.soon} onPress={() => router.push('/soon')} />
      <Button secondary label={ar.replayOnboarding} onPress={() => router.push('/onboarding')} />
      <Button label={ar.back} onPress={() => router.back()} />
    </Screen>
  );
}
