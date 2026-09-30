import { router } from 'expo-router';
import { ar } from '../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../components/ui';
export default function Soon() {
  return (
    <Screen>
      <Text style={styles.title}>{ar.soon}</Text>
      {[ar.onlineSoon, ar.dialectSoon, ar.packsSoon].map((item) => (
        <Panel key={item}>
          <Text style={{ fontSize: 24 }}>{item}</Text>
          <Text style={styles.muted}>{ar.soon}</Text>
        </Panel>
      ))}
      <Button label={ar.back} onPress={() => router.back()} />
    </Screen>
  );
}
