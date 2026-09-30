import { router } from 'expo-router';
import { useApp } from '../../store';
import { useSession } from '../../store/session';
import { ar } from '../../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../../components/ui';
import { PassPhoneScreen } from '../../components/PassPhoneScreen';
import { loadContent, packs } from '../../content/loader';
import { drawFromPack } from '../../content/draw';
import { cardsReducer, DeckId } from '../../games/cards/reducer';
const deckIds: DeckId[] = ['friends', 'couples', 'crazy', 'deep', 'funny'];
export default function Cards() {
  const players = useApp((s) => s.data.players);
  const family = useApp((s) => s.data.settings.family);
  const session = useSession((s) => s.session);
  const state = useSession((s) => s.cardsGame);
  const setState = useSession((s) => s.setCardsGame);
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
  const dispatch = (action: Parameters<typeof cardsReducer>[1]) => {
    const result = cardsReducer(state, action, participants);
    setState(result.state);
    if (result.changes.length || result.stats.length) award(result.changes, result.stats);
    if (result.finished) {
      advance();
      setState(null);
      if (session && session.index + 1 >= session.queue.length) router.replace('/results');
      else router.replace(session ? '/host' : '/results');
    }
  };
  const end = () => {
    advance();
    setState(null);
    if (session && session.index + 1 >= session.queue.length) router.replace('/results');
    else router.replace(session ? '/host' : '/results');
  };
  const flip = () => {
    const pack = packs.find((p) => p.id === 'base-cards')!;
    const deckItems = loadContent('cards', family, useApp.getState().data.customDecks).filter((item) => item.deck === state.deck);
    const scopedPack = { ...pack, id: `${pack.id}:${state.deck}`, items: deckItems };
    const result = drawFromPack(scopedPack, state.seed);
    dispatch({ type: 'flip', cardId: result.item.id, seed: result.seed });
  };
  const player = players.find((p) => p.id === state.turnId);
  const skipTurn = () => {
    if (!state.turnId) return;
    const nextParticipants = participants.map((p) =>
      p.id === state.turnId ? { ...p, away: true } : p,
    );
    if (!away.includes(state.turnId) && !useSession.getState().setAway(state.turnId)) {
      useApp.getState().notify(ar.needTwo);
      return;
    }
    setState(cardsReducer(state, { type: 'skipTurn' }, nextParticipants).state);
  };
  const card = loadContent('cards', family, useApp.getState().data.customDecks)
    .find((item) => item.id === state.cardId);
  return (
    <Screen>
      <Text style={styles.title}>{ar.games.cards.name}</Text>
      <Text style={styles.muted}>{ar.cardCount(state.completed + 1, state.maximum)}</Text>
      {state.step === 'deck' && (
        <Panel>
          <Text style={styles.title}>{ar.cardsDeck}</Text>
          {deckIds
            .filter((id) => !family || id !== 'couples')
            .map((id) => (
              <Button
                key={id}
                secondary={state.deck !== id}
                label={ar.cardsDecks[id]}
                onPress={() => dispatch({ type: 'choose', deck: id })}
              />
            ))}
          {(useApp.getState().data.customDecks.cards?.length ?? 0) > 0 && <Button
            secondary={state.deck !== 'custom'}
            label={ar.cardsDecks.custom}
            onPress={() => dispatch({ type: 'choose', deck: 'custom' })}
          />}
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
      {state.step === 'back' && (
        <Panel>
          <Text style={{ textAlign: 'center', fontSize: 66, lineHeight: 90 }}>🃏</Text>
          <Button label={ar.cardsFaceDown} onPress={flip} />
        </Panel>
      )}
      {state.step === 'face' && card && (
        <Panel>
          <Text style={styles.muted}>
            {ar.cardsKinds[(card.kind ?? 'tell') as keyof typeof ar.cardsKinds]}
          </Text>
          <Text style={{ fontSize: 25, lineHeight: 42 }}>{card.text}</Text>
          <Button label={ar.cardsDone} onPress={() => dispatch({ type: 'complete', done: true })} />
          <Button
            secondary
            label={ar.cardsSkip}
            onPress={() => dispatch({ type: 'complete', done: false })}
          />
        </Panel>
      )}
      <Button secondary label={ar.undo} onPress={undo} />
      <Button secondary label={ar.players} onPress={() => router.push('/players')} />
      <Button secondary label={ar.skipGame} onPress={end} />
      <Button secondary label={ar.exitGame} onPress={() => router.replace('/')} />
    </Screen>
  );
}
