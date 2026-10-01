import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../store';
import { useSession } from '../../store/session';
import { ar } from '../../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../../components/ui';
import { GameControls } from '../../components/GameControls';
import { CountdownTimer } from '../../components/CountdownTimer';
import { loadContent, packs } from '../../content/loader';
import { drawFromPack } from '../../content/draw';
import { speedReducer } from '../../games/speed/reducer';
import { playerColor, theme } from '../../theme';
import { teamsActive } from '../../engine/teams';

export default function Speed() {
  const data = useApp((s) => s.data);
  const players = data.players;
  const session = useSession((s) => s.session);
  const state = useSession((s) => s.speedGame);
  const setState = useSession((s) => s.setSpeedGame);
  const away = useSession((s) => s.away);
  const award = useSession((s) => s.award);
  const undo = useSession((s) => s.undo);
  const advance = useSession((s) => s.advance);
  const participants = players.map((p) => ({ ...p, away: away.includes(p.id) }));
  const teamMode = teamsActive(participants, data.settings.teams);

  if (!state)
    return (
      <Screen>
        <Button label={ar.back} onPress={() => router.replace('/host')} />
      </Screen>
    );

  const finish = () => {
    advance();
    setState(null);
    if (session && session.index + 1 < session.queue.length) router.replace('/host');
    else router.replace('/results');
  };
  const dispatch = (action: Parameters<typeof speedReducer>[1]) => {
    const result = speedReducer(state, action, participants, teamMode);
    setState(result.state);
    if (result.changes.length || result.stats.length) award(result.changes, result.stats);
    if (result.finished) finish();
  };
  const showChallenge = () => {
    const pack = packs.find((p) => p.id === 'base-speed')!;
    const result = drawFromPack({ ...pack, items: loadContent('speed') }, state.seed);
    dispatch({ type: 'challenge', challengeId: result.item.id, seed: result.seed });
  };
  const challenge = packs
    .find((p) => p.id === 'base-speed')
    ?.items.find((item) => item.id === state.challengeId);
  const buzzed = players.find((p) => p.id === state.buzzedId);
  const winner = players.find((p) => p.id === state.winnerId);

  return (
    <Screen>
      <Text style={styles.title}>{ar.games.speed.name}</Text>
      <Text style={styles.muted}>{ar.challengeProgress(state.completed + 1, state.maximum)}</Text>
      {state.step === 'ready' && (
        <Panel>
          <Text style={styles.title}>{ar.speedReady}</Text>
          <Button label={ar.speedPrepare} onPress={showChallenge} />
        </Panel>
      )}
      {state.step === 'countdown' && (
        <>
          <Text style={styles.title}>{ar.speedCountdown}</Text>
          <CountdownTimer
            key={state.completed}
            seconds={3}
            controls={false}
            onEnd={() => dispatch({ type: 'start' })}
          />
        </>
      )}
      {state.step === 'buzz' && challenge && (
        <>
          <Panel>
            <Text style={styles.title}>{challenge.text}</Text>
            <Text style={styles.muted}>{ar.speedTap}</Text>
          </Panel>
          <View style={[styles.row, { alignItems: 'stretch' }]}>
            {(teamMode
              ? ([0, 1] as const).map((team) => participants.find((p) =>
                  !p.away && p.team === team &&
                  !state.excludedIds.some((id) => participants.find((other) => other.id === id)?.team === team)))
                  .filter((p): p is (typeof participants)[number] => !!p)
              : participants.filter((p) => !p.away && !state.excludedIds.includes(p.id)))
              .map((p) => (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${ar.speedBuzz} ${teamMode ? ar.teamNames[p.team!] : p.name}`}
                  onPress={() => dispatch({ type: 'buzz', playerId: p.id })}
                  style={{
                    flexBasis: '46%',
                    minHeight: 94,
                    justifyContent: 'center',
                    padding: 12,
                    borderRadius: 19,
                    borderBottomWidth: 5,
                    borderBottomColor: theme.night,
                    backgroundColor: playerColor(p.color, data.settings.clearColors),
                  }}
                >
                  <Text style={{ textAlign: 'center', fontFamily: theme.bold, color: theme.night }}>
                    {teamMode ? ar.teamNames[p.team!] : `${p.emoji} ${p.name}`}
                  </Text>
                </Pressable>
              ))}
          </View>
          <Button secondary label={ar.speedNobody} onPress={() => dispatch({ type: 'nobody' })} />
        </>
      )}
      {state.step === 'confirm' && buzzed && (
        <Panel>
          <Text style={styles.title}>
            {buzzed.emoji} {buzzed.name}
          </Text>
          <Text>{ar.speedConfirm}</Text>
          <Button
            tone="success"
            label={ar.speedCorrect}
            onPress={() => dispatch({ type: 'confirm', correct: true })}
          />
          <Button
            tone="danger"
            label={ar.speedWrong}
            onPress={() => dispatch({ type: 'confirm', correct: false })}
          />
        </Panel>
      )}
      {state.step === 'result' && (
        <Panel>
          <Text style={styles.title}>{winner ? ar.speedWinner(teamMode ? ar.teamNames[winner.team!] : winner.name) : ar.speedNobody}</Text>
          <Button label={ar.speedNext} onPress={() => dispatch({ type: 'next' })} />
        </Panel>
      )}
      <GameControls onUndo={undo} onPlayers={() => router.push('/players')}
        onSkip={finish} onHome={() => router.replace('/')}
        playersDisabled={state.step === 'countdown'} />
    </Screen>
  );
}
