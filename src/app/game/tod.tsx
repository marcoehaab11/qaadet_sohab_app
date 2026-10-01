import { router } from 'expo-router';
import { useApp } from '../../store';
import { useSession } from '../../store/session';
import { ar } from '../../i18n/ar-EG';
import { Button, Panel, PromptCard, Screen, styles, Text } from '../../components/ui';
import { GameControls } from '../../components/GameControls';
import { PassPhoneScreen } from '../../components/PassPhoneScreen';
import { loadContent, packs } from '../../content/loader';
import { drawFromPack } from '../../content/draw';
import { Level, Kind, todReducer } from '../../games/tod/reducer';

const levels: Level[] = ['chill', 'funny', 'bold', 'chaos'];
const kinds: Kind[] = ['truth', 'dare'];

export default function TruthOrDare() {
  const players = useApp((s) => s.data.players);
  const family = useApp((s) => s.data.settings.family);
  const session = useSession((s) => s.session);
  const state = useSession((s) => s.todGame);
  const setState = useSession((s) => s.setTodGame);
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
  const dispatch = (action: Parameters<typeof todReducer>[1]) => {
    const result = todReducer(state, action, participants);
    setState(result.state);
    if (result.changes.length || result.stats.length) award(result.changes, result.stats);
    if (result.finished) finish();
  };
  const level =
    family && (state.level === 'bold' || state.level === 'chaos') ? 'chill' : state.level;
  const choose = (kind: Kind) => {
    const pack = packs.find((p) => p.id === 'base-tod')!;
    const items = loadContent('tod', family, useApp.getState().data.customDecks).filter(
      (item) => item.level === level && item.kind === kind,
    );
    const scopedPack = { ...pack, id: `${pack.id}:${level}:${kind}`, items };
    const result = drawFromPack(scopedPack, state.seed);
    dispatch({ type: 'choose', kind, promptId: result.item.id, seed: result.seed });
  };
  const skipTurn = () => {
    if (!state.turnId) return;
    const nextParticipants = participants.map((p) =>
      p.id === state.turnId ? { ...p, away: true } : p,
    );
    if (!away.includes(state.turnId) && !useSession.getState().setAway(state.turnId)) {
      useApp.getState().notify(ar.needTwo);
      return;
    }
    setState(todReducer(state, { type: 'skipTurn' }, nextParticipants).state);
  };
  const player = players.find((p) => p.id === state.turnId);
  const prompt = loadContent('tod', family, useApp.getState().data.customDecks)
    .find((item) => item.id === state.promptId);

  return (
    <Screen>
      <Text style={styles.title}>{ar.games.tod.name}</Text>
      <Text style={styles.muted}>{ar.turnProgress(state.completed + 1, state.maximum)}</Text>
      {state.step === 'level' && (
        <Panel>
          <Text style={styles.title}>{ar.todLevel}</Text>
          {levels
            .filter((id) => !family || (id !== 'bold' && id !== 'chaos'))
            .map((id) => (
              <Button
                key={id}
                secondary={level !== id}
                label={ar.todLevels[id]}
                onPress={() => dispatch({ type: 'level', level: id })}
              />
            ))}
          <Button label={ar.playGame} onPress={() => dispatch({ type: 'start' })} />
        </Panel>
      )}
      {state.step === 'pass' && player && (
        <PassPhoneScreen
          player={player}
          onConfirm={() => {
            if (!away.includes(player.id)) dispatch({ type: 'confirm' });
          }}
          onSkip={skipTurn}
        />
      )}
      {state.step === 'choice' && (
        <Panel>
          <Text style={styles.title}>{ar.todChoose}</Text>
          {kinds.map((kind) => (
            <Button key={kind} label={ar.todKinds[kind]} onPress={() => choose(kind)} />
          ))}
        </Panel>
      )}
      {state.step === 'prompt' && prompt && (
        <Panel>
          <PromptCard emoji={state.kind === 'dare' ? '🔥' : '💬'}
            label={ar.todKinds[state.kind ?? 'truth']} text={prompt.text}
            accent={state.kind === 'dare' ? '#ff5d5d' : '#9b6bff'} />
          <Button tone="success" label={ar.cardsDone} onPress={() => dispatch({ type: 'complete', done: true })} />
          <Button
            secondary
            label={ar.cardsSkip}
            onPress={() => dispatch({ type: 'complete', done: false })}
          />
        </Panel>
      )}
      <GameControls onUndo={undo} onPlayers={() => router.push('/players')}
        onSkip={finish} onHome={() => router.replace('/')} />
    </Screen>
  );
}
