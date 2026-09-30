import { router } from 'expo-router';
import { useApp } from '../../store';
import { useSession } from '../../store/session';
import { ar } from '../../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../../components/ui';
import { PassPhoneScreen } from '../../components/PassPhoneScreen';
import { HoldToReveal } from '../../components/HoldToReveal';
import { CountdownTimer } from '../../components/CountdownTimer';
import { loadContent, packs } from '../../content/loader';
import { drawFromPack } from '../../content/draw';
import { charadesReducer } from '../../games/charades/reducer';
import { teamsActive } from '../../engine/teams';

export default function Charades() {
  const data = useApp((s) => s.data);
  const players = data.players;
  const session = useSession((s) => s.session);
  const state = useSession((s) => s.charadesGame);
  const setState = useSession((s) => s.setCharadesGame);
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
  const dispatch = (action: Parameters<typeof charadesReducer>[1]) => {
    const result = charadesReducer(state, action, participants, teamMode);
    setState(result.state);
    if (result.changes.length || result.stats.length) award(result.changes, result.stats);
    if (result.finished) finish();
  };
  const showScene = () => {
    const pack = packs.find((p) => p.id === 'base-charades')!;
    const result = drawFromPack({ ...pack, items: loadContent('charades', false, data.customDecks) }, state.seed);
    dispatch({ type: 'showScene', sceneId: result.item.id, seed: result.seed });
  };
  const skipTurn = () => {
    if (!state.actorId) return;
    const nextParticipants = participants.map((p) =>
      p.id === state.actorId ? { ...p, away: true } : p,
    );
    if (!away.includes(state.actorId) && !useSession.getState().setAway(state.actorId)) {
      useApp.getState().notify(ar.needTwo);
      return;
    }
    setState(charadesReducer(state, { type: 'skipTurn' }, nextParticipants).state);
  };
  const actor = players.find((p) => p.id === state.actorId);
  const guesser = players.find((p) => p.id === state.guesserId);
  const scene = loadContent('charades', false, data.customDecks)
    .find((item) => item.id === state.sceneId);

  return (
    <Screen>
      <Text style={styles.title}>{ar.games.charades.name}</Text>
      <Text style={styles.muted}>{ar.turnProgress(state.completed + 1, state.maximum)}</Text>
      {state.step === 'pass' && actor && (
        <PassPhoneScreen
          player={actor}
          onConfirm={() => {
            if (!away.includes(actor.id)) showScene();
          }}
          onSkip={skipTurn}
        />
      )}
      {state.step === 'reveal' && scene && (
        <Panel>
          <Text style={styles.title}>{ar.charadesSecret}</Text>
          <HoldToReveal secret={scene.text} enabled={data.settings.hold} />
          <Text style={styles.muted}>{ar.charadesStartHint}</Text>
          <Button label={ar.tabooStart} onPress={() => dispatch({ type: 'start' })} />
        </Panel>
      )}
      {state.step === 'playing' && (
        <>
          <CountdownTimer
            key={state.completed}
            seconds={data.config.charades?.time ?? 60}
            onEnd={() => dispatch({ type: 'timeUp' })}
          />
          <Panel>
            <Text style={styles.title}>{ar.charadesActing}</Text>
            <Text style={styles.muted}>{ar.charadesHidden}</Text>
            {teamMode && <Text style={styles.muted}>{ar.charadesTeamHint}</Text>}
            {participants
              .filter((p) => !p.away && p.id !== state.actorId &&
                (!teamMode || p.team === actor?.team))
              .map((p) => (
                <Button
                  key={p.id}
                  secondary
                  label={`${p.emoji} ${p.name}`}
                  onPress={() => dispatch({ type: 'guessed', playerId: p.id })}
                />
              ))}
          </Panel>
        </>
      )}
      {state.step === 'turnEnd' && (
        <Panel>
          <Text style={styles.title}>{guesser ? ar.charadesWinner(guesser.name) : ar.timeUp}</Text>
          <Button label={ar.knowmeNext} onPress={() => dispatch({ type: 'nextTurn' })} />
        </Panel>
      )}
      <Button secondary label={ar.undo} onPress={undo} />
      <Button
        secondary
        label={ar.players}
        disabled={state.step === 'playing'}
        onPress={() => router.push('/players')}
      />
      <Button secondary label={ar.skipGame} onPress={finish} />
      <Button secondary label={ar.exitGame} onPress={() => router.replace('/')} />
    </Screen>
  );
}
