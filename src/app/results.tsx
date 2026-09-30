import { useEffect } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import * as StoreReview from 'expo-store-review';
import { useApp } from '../store';
import { useSession } from '../store/session';
import { leaders } from '../engine/session';
import { ar } from '../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../components/ui';
import { Scoreboard } from '../components/Scoreboard';
import { eligibleForReview } from '../engine/review';

let reviewPending = false;
export default function Results() {
  const players = useApp((s) => s.data.players);
  const away = useSession((s) => s.away);
  const ledger = useSession((s) => s.ledger);
  const reset = useSession((s) => s.reset);
  const completedSessions = useApp((s) => s.data.completedSessions);
  const askedVersion = useApp((s) => s.data.reviewAskedVersion);
  const update = useApp((s) => s.update);
  useEffect(() => {
    const version = Constants.expoConfig?.version;
    if (__DEV__ || Platform.OS === 'web' || !version || reviewPending ||
      !eligibleForReview(completedSessions, askedVersion, version)) return;
    const timer = setTimeout(() => {
      reviewPending = true;
      void (async () => {
        try {
          if (!(await StoreReview.isAvailableAsync()) || !(await StoreReview.hasAction())) return;
          // The OS may suppress the dialog; record the request, not a presumed rating.
          update((data) => ({ ...data, reviewAskedVersion: version }));
          await StoreReview.requestReview();
        } catch {
          // Review is optional and must never interrupt the results screen.
        } finally {
          reviewPending = false;
        }
      })();
    }, 1200);
    return () => clearTimeout(timer);
  }, [completedSessions, askedVersion, update]);
  const winners = leaders(
    players.filter((p) => !away.includes(p.id)).map((p) => p.id),
    ledger,
  );
  return (
    <Screen>
      <Text style={styles.title}>{ar.sessionDone}</Text>
      <Panel>
        <Text style={styles.title}>{ar.results}</Text>
        {winners.map((id) => {
          const p = players.find((player) => player.id === id)!;
          return (
            <Text key={id} style={{ fontSize: 24 }}>
              {p.emoji} {p.name}
            </Text>
          );
        })}
      </Panel>
      <Scoreboard
        players={players.map((p) => ({ ...p, away: away.includes(p.id) }))}
        scores={ledger.scores}
      />
      <Button
        label={ar.newSession}
        onPress={() => {
          reset();
          router.replace('/');
        }}
      />
    </Screen>
  );
}
