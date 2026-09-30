import { router } from 'expo-router';
import { useApp } from '../store';
import { useSession } from '../store/session';
import { ar } from '../i18n/ar-EG';
import { Button, Screen, styles, Text } from '../components/ui';
import { PlayerEditor } from '../components/PlayerEditor';
export default function Players() {
  const players = useApp((s) => s.data.players);
  const add = useApp((s) => s.addPlayer);
  const notify = useApp((s) => s.notify);
  const session = useSession((s) => s.session);
  const away = useSession((s) => s.away);
  const setAway = useSession((s) => s.setAway);
  const ledger = useSession((s) => s.ledger);
  const award = useSession((s) => s.award);
  const teams = useApp((s) => s.data.settings.teams);
  const reshuffleTeams = useApp((s) => s.reshuffleTeams);
  const live = !!session && !session.finished;
  const addJoiningPlayer = () => {
    const active = players.filter((p) => !away.includes(p.id));
    const scores = active.map((p) => ledger.scores[p.id] ?? 0);
    const score =
      live && scores.some(Boolean)
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    add();
    if (live && scores.some(Boolean)) {
      const newcomer = useApp.getState().data.players.at(-1)!;
      if (score) award([{ playerId: newcomer.id, points: score }]);
      notify(ar.lateJoin(newcomer.name, score));
    }
  };
  return (
    <Screen>
      <Text style={styles.title}>{ar.players}</Text>
      <Text style={styles.muted}>{ar.localOnly}</Text>
      {players.map((player) => (
        <PlayerEditor
          key={player.id}
          player={player}
          canRemove={players.length > 2 && session?.phase !== 'game'}
        />
      ))}
      {teams && <>
        {players.length - away.length < 4 && <Text style={styles.muted}>{ar.teamsNeedFour}</Text>}
        {players.map((player) => <Text key={`team:${player.id}`}>
          {player.emoji} {player.name}: {player.team === 0 || player.team === 1 ? ar.teamNames[player.team] : ''}
        </Text>)}
        <Button secondary label={ar.reshuffleTeams} onPress={reshuffleTeams} />
      </>}
      {live &&
        players.map((player) => (
          <Button
            key={player.id}
            secondary
            label={`${player.emoji} ${player.name}: ${away.includes(player.id) ? ar.away : ar.present}`}
            onPress={() => {
              if (!setAway(player.id)) notify(ar.needTwo);
            }}
          />
        ))}
      <Button
        secondary
        disabled={players.length >= 8}
        label={players.length >= 8 ? ar.maxPlayers : ar.addPlayer}
        onPress={addJoiningPlayer}
      />
      <Button label={ar.done} onPress={() => router.back()} />
    </Screen>
  );
}
