import { router } from 'expo-router';
import { useApp } from '../../store';
import { useSession } from '../../store/session';
import { ar } from '../../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../../components/ui';
import { GameControls } from '../../components/GameControls';
import { PassPhoneScreen } from '../../components/PassPhoneScreen';
import { HoldToReveal } from '../../components/HoldToReveal';
import { CountdownTimer } from '../../components/CountdownTimer';
import { DrawingCanvas } from '../../components/DrawingCanvas';
import { loadContent, packs } from '../../content/loader';
import { drawFromPack } from '../../content/draw';
import { drawReducer } from '../../games/draw/reducer';

export default function Draw() {
  const data = useApp((s) => s.data);
  const session = useSession((s) => s.session);
  const state = useSession((s) => s.drawGame);
  const setState = useSession((s) => s.setDrawGame);
  const away = useSession((s) => s.away);
  const award = useSession((s) => s.award);
  const undo = useSession((s) => s.undo);
  const advance = useSession((s) => s.advance);
  const participants = data.players.map((player) => ({ ...player, away: away.includes(player.id) }));
  if (!state) return <Screen><Button label={ar.back} onPress={() => router.replace('/host')} /></Screen>;
  const finish = () => {
    advance(); setState(null);
    if (session && session.index + 1 < session.queue.length) router.replace('/host');
    else router.replace('/results');
  };
  const dispatch = (action: Parameters<typeof drawReducer>[1]) => {
    const result = drawReducer(state, action, participants);
    setState(result.state);
    if (result.changes.length || result.stats.length) award(result.changes, result.stats);
    if (result.finished) finish();
  };
  const showWord = () => {
    const pack = packs.find((candidate) => candidate.id === 'base-draw')!;
    const result = drawFromPack({ ...pack, items: loadContent('draw') }, state.seed);
    dispatch({ type: 'showWord', wordId: result.item.id, seed: result.seed });
  };
  const skipTurn = () => {
    if (!state.artistId) return;
    const nextParticipants = participants.map((player) => player.id === state.artistId ? { ...player, away: true } : player);
    if (!away.includes(state.artistId) && !useSession.getState().setAway(state.artistId)) {
      useApp.getState().notify(ar.needTwo); return;
    }
    setState(drawReducer(state, { type: 'skipTurn' }, nextParticipants).state);
  };
  const artist = data.players.find((player) => player.id === state.artistId);
  const guesser = data.players.find((player) => player.id === state.guesserId);
  const word = loadContent('draw').find((item) => item.id === state.wordId);
  return <Screen>
    <Text style={styles.title}>{ar.games.draw.name}</Text>
    <Text style={styles.muted}>{ar.turnProgress(state.completed + 1, state.maximum)}</Text>
    {state.step === 'pass' && artist && <PassPhoneScreen player={artist}
      onConfirm={() => { if (!away.includes(artist.id)) showWord(); }} onSkip={skipTurn} />}
    {state.step === 'reveal' && word && <Panel>
      <Text style={styles.title}>{ar.drawSecret}</Text>
      <HoldToReveal secret={word.text} enabled={data.settings.hold} />
      <Text style={styles.muted}>{ar.drawHint}</Text>
      <Button label={ar.drawStart} onPress={() => dispatch({ type: 'start' })} />
    </Panel>}
    {state.step === 'drawing' && <>
      <Text style={styles.muted}>{ar.drawHidden}</Text>
      <CountdownTimer key={state.completed} seconds={data.config.draw?.time ?? 60}
        onEnd={() => dispatch({ type: 'timeUp' })} />
      <DrawingCanvas key={state.completed} />
      <Panel>
        <Text style={styles.title}>{ar.drawGuess}</Text>
        {participants.filter((player) => !player.away && player.id !== state.artistId)
          .map((player) => <Button key={player.id} secondary label={`${player.emoji} ${player.name}`}
            onPress={() => dispatch({ type: 'guessed', playerId: player.id })} />)}
        <Button secondary label={ar.drawNobody} onPress={() => dispatch({ type: 'timeUp' })} />
      </Panel>
    </>}
    {state.step === 'turnEnd' && <Panel>
      <Text style={styles.title}>{guesser ? ar.drawWinner(guesser.name) : ar.drawNobody}</Text>
      {word && <Text>{ar.memoryAnswer}: {word.text}</Text>}
      <Button label={ar.knowmeNext} onPress={() => dispatch({ type: 'nextTurn' })} />
    </Panel>}
    <GameControls onUndo={undo} onPlayers={() => router.push('/players')}
      onSkip={finish} onHome={() => router.replace('/')}
      playersDisabled={state.step === 'drawing'} />
  </Screen>;
}
