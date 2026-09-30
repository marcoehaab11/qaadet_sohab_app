import { router } from 'expo-router';
import { useApp } from '../../store';
import { useSession } from '../../store/session';
import { ar } from '../../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../../components/ui';
import { loadContent, packs } from '../../content/loader';
import { drawFromPack } from '../../content/draw';
import { proverbReducer } from '../../games/proverb/reducer';

export default function Proverb() {
  const data = useApp((s) => s.data);
  const session = useSession((s) => s.session);
  const state = useSession((s) => s.proverbGame);
  const setState = useSession((s) => s.setProverbGame);
  const away = useSession((s) => s.away);
  const award = useSession((s) => s.award);
  const undo = useSession((s) => s.undo);
  const advance = useSession((s) => s.advance);
  const participants = data.players.map((p) => ({ ...p, away: away.includes(p.id) }));

  if (!state) return <Screen><Button label={ar.back} onPress={() => router.replace('/host')} /></Screen>;

  const finish = () => {
    advance();
    setState(null);
    if (session && session.index + 1 < session.queue.length) router.replace('/host');
    else router.replace('/results');
  };
  const dispatch = (action: Parameters<typeof proverbReducer>[1]) => {
    const result = proverbReducer(state, action, participants);
    setState(result.state);
    if (result.changes.length || result.stats.length) award(result.changes, result.stats);
    if (result.finished) finish();
  };
  const draw = () => {
    const pack = packs.find((p) => p.id === 'base-proverb')!;
    const result = drawFromPack({ ...pack, items: loadContent('proverb') }, state.seed);
    dispatch({ type: 'draw', proverbId: result.item.id, seed: result.seed });
  };
  const item = loadContent('proverb').find((candidate) => candidate.id === state.proverbId);
  const winner = data.players.find((player) => player.id === state.winnerId);

  return <Screen>
    <Text style={styles.title}>{ar.games.proverb.name}</Text>
    <Text style={styles.muted}>{ar.proverbProgress(state.completed + 1, state.maximum)}</Text>
    {state.step === 'ready' && <Panel>
      <Text style={styles.title}>{ar.proverbReady}</Text>
      <Button label={ar.proverbDraw} onPress={draw} />
    </Panel>}
    {state.step === 'show' && item && <Panel>
      <Text style={styles.title}>{item.text}…</Text>
      <Text style={styles.muted}>{ar.proverbSay}</Text>
      <Button label={ar.proverbReveal} onPress={() => dispatch({ type: 'reveal' })} />
    </Panel>}
    {state.step === 'revealed' && item && <Panel>
      <Text style={styles.title}>{item.text} {item.pair}</Text>
      <Text style={styles.muted}>{ar.proverbWho}</Text>
      {participants.filter((player) => !player.away).map((player) =>
        <Button key={player.id} secondary label={`${player.emoji} ${player.name}`}
          onPress={() => dispatch({ type: 'answer', playerId: player.id })} />)}
      <Button secondary label={ar.proverbNobody}
        onPress={() => dispatch({ type: 'answer', playerId: null })} />
    </Panel>}
    {state.step === 'result' && <Panel>
      <Text style={styles.title}>{winner ? ar.proverbWinner(winner.name) : ar.proverbNobody}</Text>
      <Button label={ar.proverbNext} onPress={() => dispatch({ type: 'next' })} />
    </Panel>}
    <Button secondary label={ar.undo} onPress={undo} />
    <Button secondary label={ar.players} onPress={() => router.push('/players')} />
    <Button secondary label={ar.skipGame} onPress={finish} />
    <Button secondary label={ar.exitGame} onPress={() => router.replace('/')} />
  </Screen>;
}
