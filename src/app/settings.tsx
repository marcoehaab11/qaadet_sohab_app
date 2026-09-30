import { Switch, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../store';
import { Settings } from '../store/persistence';
import { ar } from '../i18n/ar-EG';
import { theme } from '../theme';
import { Button, Panel, Screen, styles, Text } from '../components/ui';
export default function SettingsScreen() {
  const settings = useApp((s) => s.data.settings);
  const change = useApp((s) => s.changeSetting);
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
      <Text style={styles.muted}>{ar.localOnly}</Text>
      <Button label={ar.back} onPress={() => router.back()} />
    </Screen>
  );
}
