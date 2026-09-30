import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../store';
import { useSession } from '../store/session';
import { ar } from '../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../components/ui';
import { PlayerEditor } from '../components/PlayerEditor';
import { Vibe } from '../engine/queue';
export default function Onboarding() {
  const [step, setStep] = useState(0);
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const add = useApp((s) => s.addPlayer);
  const begin = useSession((s) => s.begin);
  const finish = (start: boolean) => {
    update((d) => ({ ...d, onboardingDone: true }));
    if (start) {
      begin();
      router.replace('/host');
    } else router.replace('/');
  };
  return (
    <Screen>
      <Text style={styles.title}>{ar.name}</Text>
      <Text style={styles.muted}>{ar.onboardProgress(step + 1)}</Text>
      {step === 0 && (
        <Panel>
          <Text style={{ fontSize: 68, textAlign: 'center', lineHeight: 90 }}>🎲</Text>
          <Text style={styles.title}>{ar.welcome}</Text>
          <Text>{ar.onboardConcept}</Text>
          <Text style={styles.muted}>{ar.offline}</Text>
        </Panel>
      )}
      {step === 1 && (
        <>
          <Text style={styles.title}>{ar.onboardPlayers}</Text>
          {data.players.map((p) => (
            <PlayerEditor key={p.id} player={p} canRemove={data.players.length > 2} />
          ))}
          <Button
            secondary
            disabled={data.players.length >= 8}
            label={ar.addPlayer}
            onPress={add}
          />
        </>
      )}
      {step === 2 && (
        <>
          <Text style={styles.title}>{ar.onboardSetup}</Text>
          <Panel>
            {(Object.keys(ar.vibes) as Vibe[]).map((vibe) => (
              <Button
                key={vibe}
                secondary={data.lastSetup.vibe !== vibe}
                label={ar.vibes[vibe]}
                onPress={() => update((d) => ({ ...d, lastSetup: { ...d.lastSetup, vibe } }))}
              />
            ))}
          </Panel>
          <View style={styles.row}>
            {([3, 5] as const).map((length) => (
              <View key={length} style={{ flex: 1 }}>
                <Button
                  secondary={data.lastSetup.length !== length}
                  label={length === 3 ? ar.short : ar.long}
                  onPress={() => update((d) => ({ ...d, lastSetup: { ...d.lastSetup, length } }))}
                />
              </View>
            ))}
          </View>
        </>
      )}
      <Button
        label={step === 2 ? ar.startSession : ar.onboardNext}
        onPress={() => (step === 2 ? finish(true) : setStep(step + 1))}
      />
      <Button secondary label={ar.onboardSkip} onPress={() => finish(false)} />
    </Screen>
  );
}
