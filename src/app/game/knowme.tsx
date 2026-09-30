import { TextInput } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../store';
import { useSession } from '../../store/session';
import { ar } from '../../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../../components/ui';
import { PassPhoneScreen } from '../../components/PassPhoneScreen';
import { loadContent, packs } from '../../content/loader';
import { drawFromPack } from '../../content/draw';
import { knowMeReducer } from '../../games/knowme/reducer';
import { theme } from '../../theme';

export default function KnowMe() {
  const players = useApp((s) => s.data.players);
  const session = useSession((s) => s.session);
  const state = useSession((s) => s.knowMeGame);
  const setState = useSession((s) => s.setKnowMeGame);
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
  const dispatch = (action: Parameters<typeof knowMeReducer>[1]) => {
    const result = knowMeReducer(state, action, participants);
    setState(result.state);
    if (result.changes.length || result.stats.length) award(result.changes, result.stats);
    if (result.finished) finish();
  };
  const nextQuestion = () => {
    const pack = packs.find((p) => p.id === 'base-knowme')!;
    const result = drawFromPack({ ...pack, items: loadContent('knowme') }, state.seed);
    dispatch({ type: 'question', promptId: result.item.id, seed: result.seed });
  };
  const skipTurn = () => {
    if (!state.subjectId) return;
    const nextParticipants = participants.map((p) =>
      p.id === state.subjectId ? { ...p, away: true } : p,
    );
    if (!away.includes(state.subjectId) && !useSession.getState().setAway(state.subjectId)) {
      useApp.getState().notify(ar.needTwo);
      return;
    }
    setState(knowMeReducer(state, { type: 'skipTurn' }, nextParticipants).state);
  };
  const subject = players.find((p) => p.id === state.subjectId);
  const prompt = packs
    .find((p) => p.id === 'base-knowme')
    ?.items.find((item) => item.id === state.promptId);

  return (
    <Screen>
      <Text style={styles.title}>{ar.games.knowme.name}</Text>
      <Text style={styles.muted}>{ar.subjectProgress(state.completed + 1, state.maximum)}</Text>
      {state.step === 'question' && (
        <Panel>
          <Text style={styles.title}>{ar.knowmeReady}</Text>
          <Text style={styles.muted}>{ar.knowmeInstructions}</Text>
          <Button label={ar.knowmeShowQuestion} onPress={nextQuestion} />
        </Panel>
      )}
      {state.step === 'pass' && subject && (
        <PassPhoneScreen
          player={subject}
          onConfirm={() => {
            if (!away.includes(subject.id)) dispatch({ type: 'confirm' });
          }}
          onSkip={skipTurn}
        />
      )}
      {state.step === 'answer' && prompt && (
        <Panel>
          <Text style={styles.title}>{prompt.text}</Text>
          <Text style={styles.muted}>{ar.knowmeAnswerHint}</Text>
          <TextInput
            accessibilityLabel={ar.knowmeAnswerHint}
            value={state.answer}
            onChangeText={(answer) => dispatch({ type: 'writeAnswer', answer })}
            placeholder={ar.knowmeAnswerPlaceholder}
            placeholderTextColor={theme.muted}
            maxLength={80}
            multiline
            autoComplete="off"
            autoCorrect={false}
            style={[
              styles.text,
              { backgroundColor: theme.night, borderRadius: 14, padding: 12, minHeight: 72 },
            ]}
          />
          <Button label={ar.knowmeSaveAnswer} onPress={() => dispatch({ type: 'saveAnswer' })} />
        </Panel>
      )}
      {state.step === 'guess' && prompt && (
        <Panel>
          <Text style={styles.title}>{prompt.text}</Text>
          <Text>{ar.knowmeGuess}</Text>
          <Button label={ar.knowmeReveal} onPress={() => dispatch({ type: 'reveal' })} />
        </Panel>
      )}
      {state.step === 'reveal' && prompt && (
        <Panel>
          <Text style={styles.title}>{prompt.text}</Text>
          <Text style={{ fontSize: 23 }}>{state.answer || ar.knowmeNoAnswer}</Text>
          <Text style={styles.muted}>{ar.knowmeCorrect}</Text>
          {participants
            .filter((p) => !p.away && p.id !== state.subjectId)
            .map((p) => (
              <Button
                key={p.id}
                secondary={!state.correctIds.includes(p.id)}
                label={`${state.correctIds.includes(p.id) ? '✓ ' : ''}${p.emoji} ${p.name}`}
                onPress={() => dispatch({ type: 'toggleCorrect', playerId: p.id })}
              />
            ))}
          <Button label={ar.knowmeNext} onPress={() => dispatch({ type: 'complete' })} />
        </Panel>
      )}
      <Button secondary label={ar.undo} onPress={undo} />
      <Button secondary label={ar.players} onPress={() => router.push('/players')} />
      <Button secondary label={ar.skipGame} onPress={finish} />
      <Button secondary label={ar.exitGame} onPress={() => router.replace('/')} />
    </Screen>
  );
}
