import { router } from 'expo-router';
import { useApp } from '../store';
import { useSession } from '../store/session';
import { leaders } from '../engine/session';
import { ar } from '../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../components/ui';
import { Scoreboard } from '../components/Scoreboard';
export default function Results() {
  const players = useApp((s) => s.data.players);
  const away = useSession((s) => s.away);
  const ledger = useSession((s) => s.ledger);
  const reset = useSession((s) => s.reset);
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
