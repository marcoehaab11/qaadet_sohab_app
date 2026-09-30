import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../store';
import { useSession } from '../../store/session';
import { ar } from '../../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../../components/ui';
import { CountdownTimer } from '../../components/CountdownTimer';
import { loadContent, packs } from '../../content/loader';
import { drawFromPack } from '../../content/draw';
import { speedReducer } from '../../games/speed/reducer';
import { playerColor, theme } from '../../theme';

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
    const result = speedReducer(state, action, participants);
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
            {participants
              .filter((p) => !p.away && !state.excludedIds.includes(p.id))
              .map((p) => (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${ar.speedBuzz} ${p.name}`}
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
                    {p.emoji} {p.name}
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
            label={ar.speedCorrect}
            onPress={() => dispatch({ type: 'confirm', correct: true })}
          />
          <Button
            secondary
            label={ar.speedWrong}
            onPress={() => dispatch({ type: 'confirm', correct: false })}
          />
        </Panel>
      )}
      {state.step === 'result' && (
        <Panel>
          <Text style={styles.title}>{winner ? ar.speedWinner(winner.name) : ar.speedNobody}</Text>
          <Button label={ar.speedNext} onPress={() => dispatch({ type: 'next' })} />
        </Panel>
      )}
      <Button secondary label={ar.undo} onPress={undo} />
      <Button
        secondary
        label={ar.players}
        disabled={state.step === 'countdown'}
        onPress={() => router.push('/players')}
      />
      <Button secondary label={ar.skipGame} onPress={finish} />
      <Button secondary label={ar.exitGame} onPress={() => router.replace('/')} />
    </Screen>
  );
}
