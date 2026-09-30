import { router } from 'expo-router';
import { useApp } from '../../store';
import { useSession } from '../../store/session';
import { ar } from '../../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../../components/ui';
import { PassPhoneScreen } from '../../components/PassPhoneScreen';
import { HoldToReveal } from '../../components/HoldToReveal';
import { CountdownTimer } from '../../components/CountdownTimer';
import { activeSeason, loadContent, packs } from '../../content/loader';
import { customContent } from '../../content/custom';
import { drawFromPack } from '../../content/draw';
import { shuffle } from '../../engine/random';
import { imposterReducer } from '../../games/imposter/reducer';

const classicPack = packs.find((p) => p.id === 'base-imposter')!;
const undercoverPack = packs.find((p) => p.id === 'base-undercover')!;

export default function Imposter() {
  const data = useApp((s) => s.data);
  const players = data.players;
  const session = useSession((s) => s.session);
  const state = useSession((s) => s.imposterGame);
  const setState = useSession((s) => s.setImposterGame);
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

  const pack = state.mode === 'undercover' ? undercoverPack : classicPack;
  const customWords = data.customDecks.imposter?.length ?? 0;
  const classicItems = loadContent('imposter', data.settings.family, data.customDecks, activeSeason(new Date(), data.seasonOverride))
    .filter((item) => !item.pair && (item.source !== 'custom' || customWords >= 3));
  const availableCategories = [...new Set(classicItems.map((item) => item.category).filter(Boolean))] as string[];
  const word = [...packs.filter((p) => p.game === 'imposter').flatMap((p) => p.items),
    ...customContent('imposter', data.customDecks)]
    .find((item) => item.id === state.wordId);
  const finish = () => {
    advance();
    setState(null);
    if (session && session.index + 1 < session.queue.length) router.replace('/host');
    else router.replace('/results');
  };
  const dispatch = (action: Parameters<typeof imposterReducer>[1]) => {
    const result = imposterReducer(state, action, participants, word?.text ?? null);
    setState(result.state);
    if (result.changes.length || result.stats.length) award(result.changes, result.stats);
  };
  const begin = () => {
    const source = state.mode === 'undercover' ? pack.items : classicItems;
    const items = source.filter(
      (item) => state.mode === 'undercover' || !state.category || item.category === state.category,
    );
    const drawn = drawFromPack(
      { ...pack, id: `${pack.id}:${state.category ?? 'all'}`, items },
      state.seed,
    );
    const distractors = shuffle(
      source.map((item) => item.text).filter((text) => text !== drawn.item.text),
      drawn.seed,
    );
    const options = shuffle([drawn.item.text, ...distractors.items.slice(0, 3)], distractors.seed);
    dispatch({
      type: 'begin',
      wordId: drawn.item.id,
      imposterWord: state.mode === 'undercover' ? (drawn.item.pair ?? null) : null,
      options: options.items,
      seed: options.seed,
    });
  };
  const roleId = state.order[state.roleIndex];
  const rolePlayer = players.find((p) => p.id === roleId);
  const isImposter = roleId ? state.imposters.includes(roleId) : false;
  const roleSecret =
    state.mode === 'undercover'
      ? `${ar.imposterYourWord}: ${isImposter ? state.imposterWord : word?.text}`
      : isImposter
        ? `${ar.imposterYou}\n${ar.imposterCategory}: ${word?.category ?? ''}${state.count === 2 ? `\n${ar.imposterTwo}` : ''}`
        : `${ar.imposterYourWord}: ${word?.text}\n${ar.imposterCategory}: ${word?.category ?? ''}`;
  const starter = players.find((p) => p.id === state.starterId);
  const caught = state.imposters.filter((id) => state.suspects.includes(id));

  return (
    <Screen>
      <Text style={styles.title}>{ar.games.imposter.name}</Text>
      <Text style={styles.muted}>{ar.imposterRound(state.round)}</Text>
      {state.step === 'setup' && (
        <Panel>
          <Text style={styles.title}>{ar.imposterSetup}</Text>
          <Button
            secondary={state.mode !== 'classic'}
            label={ar.imposterClassic}
            onPress={() => dispatch({ type: 'mode', mode: 'classic' })}
          />
          <Button
            secondary={state.mode !== 'undercover'}
            label={ar.imposterUndercover}
            onPress={() => dispatch({ type: 'mode', mode: 'undercover' })}
          />
          <Text style={styles.muted}>{ar.imposterCount}</Text>
          <Button
            secondary={state.count !== 1}
            label={ar.imposterOne}
            onPress={() => dispatch({ type: 'count', count: 1 })}
          />
          {participants.filter((p) => !p.away).length >= 6 && (
            <Button
              secondary={state.count !== 2}
              label={ar.imposterTwoOption}
              onPress={() => dispatch({ type: 'count', count: 2 })}
            />
          )}
          {state.mode === 'classic' && (
            <>
              <Text style={styles.muted}>{ar.imposterCategory}</Text>
              <Button
                secondary={state.category !== null}
                label={ar.imposterRandom}
                onPress={() => dispatch({ type: 'category', category: null })}
              />
              {availableCategories.map((category) => (
                <Button
                  key={category}
                  secondary={state.category !== category}
                  label={category}
                  onPress={() => dispatch({ type: 'category', category })}
                />
              ))}
            </>
          )}
          <Button label={ar.playGame} onPress={begin} />
        </Panel>
      )}
      {state.step === 'pass' && rolePlayer && (
        <PassPhoneScreen player={rolePlayer} onConfirm={() => dispatch({ type: 'confirmRole' })} />
      )}
      {state.step === 'secret' && (
        <Panel>
          <Text style={styles.title}>{ar.imposterSecret}</Text>
          <HoldToReveal secret={roleSecret} enabled={data.settings.hold} />
          <Button label={ar.imposterNextPlayer} onPress={() => dispatch({ type: 'nextRole' })} />
        </Panel>
      )}
      {state.step === 'discussion' && (
        <>
          <Panel>
            <Text style={styles.title}>{ar.imposterDiscuss}</Text>
            <Text>{ar.imposterStarter(starter?.name ?? '')}</Text>
          </Panel>
          <CountdownTimer
            key={state.round}
            seconds={data.config.imposter?.time ?? 120}
            onEnd={() => dispatch({ type: 'endDiscussion' })}
          />
          <Button
            secondary
            label={ar.imposterVoteNow}
            onPress={() => dispatch({ type: 'endDiscussion' })}
          />
        </>
      )}
      {state.step === 'vote' && (
        <Panel>
          <Text style={styles.title}>{ar.imposterVote}</Text>
          <Text style={styles.muted}>{ar.imposterSelect(state.count)}</Text>
          {state.order.map((id) => {
            const p = players.find((player) => player.id === id)!;
            return (
              <Button
                key={id}
                secondary={!state.suspects.includes(id)}
                label={`${state.suspects.includes(id) ? '✓ ' : ''}${p.emoji} ${p.name}`}
                onPress={() => dispatch({ type: 'toggleSuspect', playerId: id })}
              />
            );
          })}
          <Button
            label={ar.imposterConfirmVote}
            disabled={state.suspects.length !== state.count}
            onPress={() => dispatch({ type: 'confirmVote' })}
          />
        </Panel>
      )}
      {state.step === 'guess' && (
        <Panel>
          <Text style={styles.title}>{ar.imposterCaught}</Text>
          <Text>{caught.map((id) => players.find((p) => p.id === id)?.name).join('، ')}</Text>
          <Text style={styles.muted}>{ar.imposterGuess}</Text>
          {state.options.map((option) => (
            <Button
              key={option}
              secondary
              label={option}
              onPress={() => dispatch({ type: 'guess', word: option })}
            />
          ))}
        </Panel>
      )}
      {state.step === 'result' && (
        <Panel>
          <Text style={styles.title}>{ar.imposterResult}</Text>
          <Text>
            {ar.imposterWere}:{' '}
            {state.imposters.map((id) => players.find((p) => p.id === id)?.name).join('، ')}
          </Text>
          <Text>
            {ar.imposterYourWord}: {word?.text}
          </Text>
          {state.mode === 'undercover' && (
            <Text>
              {ar.imposterOtherWord}: {state.imposterWord}
            </Text>
          )}
          {state.guessedWord && (
            <Text>
              {ar.imposterGuessed}: {state.guessedWord}
            </Text>
          )}
          <Button secondary label={ar.imposterAgain} onPress={() => dispatch({ type: 'again' })} />
          <Button label={ar.knowmeNext} onPress={finish} />
        </Panel>
      )}
      <Button secondary label={ar.undo} onPress={undo} />
      <Button
        secondary
        label={ar.players}
        disabled={state.step !== 'setup' && state.step !== 'result'}
        onPress={() => router.push('/players')}
      />
      <Button secondary label={ar.skipGame} onPress={finish} />
      <Button secondary label={ar.exitGame} onPress={() => router.replace('/')} />
    </Screen>
  );
}
