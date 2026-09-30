import { router } from 'expo-router';
import { useApp } from '../store';
import { useSession } from '../store/session';
import { currentGame } from '../engine/session';
import { minPlayers } from '../config/release';
import { ar } from '../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../components/ui';
import { Scoreboard } from '../components/Scoreboard';
export default function Host() {
  const players = useApp((s) => s.data.players);
  const session = useSession((s) => s.session);
  const away = useSession((s) => s.away);
  const ledger = useSession((s) => s.ledger);
  const play = useSession((s) => s.play);
  const advance = useSession((s) => s.advance);
  const undo = useSession((s) => s.undo);
  if (!session || session.finished)
    return (
      <Screen>
        <Button label={ar.back} onPress={() => router.replace('/')} />
      </Screen>
    );
  const id = currentGame(session);
  if (!id) return null;
  const eligible = players.length - away.length >= minPlayers[id];
  const skip = () => {
    advance();
    if (session.index + 1 >= session.queue.length) router.replace('/results');
  };
  return (
    <Screen>
      <Text style={styles.title}>{ar.name}</Text>
      <Text style={styles.muted}>{ar.gameProgress(session.index + 1, session.queue.length)}</Text>
      <Panel>
        <Text style={styles.muted}>{ar.nextGame}</Text>
        <Text style={styles.title}>{ar.games[id].name}</Text>
        <Text>{ar.games[id].desc}</Text>
        {ar.games[id].rules.map((line) => (
          <Text key={line}>• {line}</Text>
        ))}
      </Panel>
      <Text style={styles.muted}>{ar.passPhone}</Text>
      <Button
        label={
          (id === 'cards' ||
            id === 'tod' ||
            id === 'likely' ||
            id === 'knowme' ||
            id === 'taboo') &&
          eligible
            ? ar.playGame
            : id === 'cards' || id === 'tod' || id === 'likely' || id === 'knowme' || id === 'taboo'
              ? ar.minPlayers(minPlayers[id])
              : ar.gamePreparing
        }
        disabled={
          (id !== 'cards' &&
            id !== 'tod' &&
            id !== 'likely' &&
            id !== 'knowme' &&
            id !== 'taboo') ||
          !eligible
        }
        onPress={() => {
          play();
          router.push(
            id === 'cards'
              ? '/game/cards'
              : id === 'tod'
                ? '/game/tod'
                : id === 'likely'
                  ? '/game/likely'
                  : id === 'knowme'
                    ? '/game/knowme'
                    : '/game/taboo',
          );
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
