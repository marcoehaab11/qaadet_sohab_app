import { View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../store';
import { useSession } from '../../store/session';
import { ar } from '../../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../../components/ui';
import { GameControls } from '../../components/GameControls';
import { CountdownTimer } from '../../components/CountdownTimer';
import { memoryReducer } from '../../games/memory/reducer';
import { theme } from '../../theme';

export default function Memory() {
  const data = useApp((s) => s.data);
  const session = useSession((s) => s.session);
  const state = useSession((s) => s.memoryGame);
  const setState = useSession((s) => s.setMemoryGame);
  const away = useSession((s) => s.away);
  const award = useSession((s) => s.award);
  const undo = useSession((s) => s.undo);
  const advance = useSession((s) => s.advance);
  const participants = data.players.map((p) => ({ ...p, away: away.includes(p.id) }));
  if (!state) return <Screen><Button label={ar.back} onPress={() => router.replace('/host')} /></Screen>;
  const finish = () => {
    advance(); setState(null);
    if (session && session.index + 1 < session.queue.length) router.replace('/host');
    else router.replace('/results');
  };
  const dispatch = (action: Parameters<typeof memoryReducer>[1]) => {
    const result = memoryReducer(state, action, participants);
    setState(result.state);
    if (result.changes.length || result.stats.length) award(result.changes, result.stats);
    if (result.finished) finish();
  };
  const player = data.players.find((p) => p.id === state.playerId);
  const correct = state.mode === 'where' ? state.target : state.options.indexOf(state.sequence[state.target]!);
  const answer = state.mode === 'where' ? String(state.target + 1) : state.sequence[state.target];
  const choices = state.mode === 'where'
    ? state.sequence.map((_, index) => String(index + 1)) : state.options;
  return <Screen>
    <Text style={styles.title}>{ar.games.memory.name}</Text>
    <Text style={styles.muted}>{ar.memoryProgress(state.completed + 1, state.maximum)}</Text>
    {state.step === 'ready' && <Panel>
      <Text style={styles.title}>{ar.memoryReady(participants.filter((p) => !p.away)[state.completed % participants.filter((p) => !p.away).length]?.name ?? '')}</Text>
      <Button label={ar.memoryStart} onPress={() => dispatch({ type: 'start' })} />
    </Panel>}
    {state.step === 'look' && <>
      <Text style={styles.title}>{ar.memoryLook}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {state.sequence.map((symbol, index) => <View key={index} style={{ width: '30%', minHeight: 70, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: theme.surface }}>
          <Text style={{ fontSize: 34 }}>{symbol}</Text>
        </View>)}
      </View>
      <CountdownTimer key={state.completed} seconds={data.config.memory?.time ?? 5} controls={false}
        onEnd={() => dispatch({ type: 'hide' })} />
    </>}
    {state.step === 'ask' && <Panel>
      <Text style={styles.title}>{state.mode === 'where' ? ar.memoryWhere(state.sequence[state.target]!) : ar.memoryMissing}</Text>
      {state.mode === 'missing' && <Text style={{ fontSize: 25, lineHeight: 46, textAlign: 'center' }}>
        {state.sequence.map((symbol, index) => index === state.target ? '❓' : symbol).join('  ')}
      </Text>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {choices.map((choice, index) => <View key={index} style={{ width: state.mode === 'where' ? '30%' : '47%' }}>
          <Button secondary label={choice} onPress={() => dispatch({ type: 'answer', index })} />
        </View>)}
      </View>
    </Panel>}
    {state.step === 'result' && <Panel>
      <Text style={styles.title}>{state.selected === correct ? ar.memoryCorrect : ar.memoryWrong}</Text>
      <Text>{ar.memoryAnswer}: {answer}</Text>
      <Text style={{ fontSize: 24, lineHeight: 42, textAlign: 'center' }}>{state.sequence.join('  ')}</Text>
      <Text>{player?.emoji} {player?.name}</Text>
      <Button label={ar.memoryNext} onPress={() => dispatch({ type: 'next' })} />
    </Panel>}
    <GameControls onUndo={undo} onPlayers={() => router.push('/players')}
      onSkip={finish} onHome={() => router.replace('/')}
      playersDisabled={state.step === 'look'} />
  </Screen>;
}
