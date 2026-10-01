import { router } from 'expo-router';
import { useApp } from '../../store';
import { useSession } from '../../store/session';
import { ar } from '../../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../../components/ui';
import { GameControls } from '../../components/GameControls';
import { PassPhoneScreen } from '../../components/PassPhoneScreen';
import { HoldToReveal } from '../../components/HoldToReveal';
import { CountdownTimer } from '../../components/CountdownTimer';
import { activeSeason, loadContent, packs } from '../../content/loader';
import { drawFromPack } from '../../content/draw';
import { tabooReducer } from '../../games/taboo/reducer';
import { theme } from '../../theme';
import { teamsActive } from '../../engine/teams';

export default function Taboo() {
  const data = useApp((s) => s.data);
  const players = data.players;
  const session = useSession((s) => s.session);
  const state = useSession((s) => s.tabooGame);
  const setState = useSession((s) => s.setTabooGame);
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
  const dispatch = (action: Parameters<typeof tabooReducer>[1]) => {
    const result = tabooReducer(state, action, participants);
    setState(result.state);
    if (result.changes.length || result.stats.length) award(result.changes, result.stats);
    if (result.finished) finish();
  };
  const drawWord = (outcome?: 'guessed' | 'forbidden' | 'skip') => {
    const difficulty = data.config.taboo?.difficulty ?? 0;
    const pack = packs.find((p) => p.id === (difficulty === 1 ? 'base-taboo-hard' : 'base-taboo'))!;
    const items = loadContent('taboo', data.settings.family, data.customDecks, activeSeason(new Date(), data.seasonOverride), difficulty);
    const result = drawFromPack({ ...pack, id: difficulty === 2 ? 'base-taboo-mix' : pack.id, items }, state.seed);
    if (outcome)
      dispatch({ type: 'resolve', outcome, nextWordId: result.item.id, seed: result.seed });
    else dispatch({ type: 'showWord', wordId: result.item.id, seed: result.seed });
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
    setState(tabooReducer(state, { type: 'skipTurn' }, nextParticipants).state);
  };
  const actor = players.find((p) => p.id === state.actorId);
  const word = loadContent('taboo', data.settings.family, data.customDecks, activeSeason(new Date(), data.seasonOverride), data.config.taboo?.difficulty ?? 0)
    .find((item) => item.id === state.wordId);
  const forbidden = word?.forbidden ?? [];

  return (
    <Screen>
      <Text style={styles.title}>{ar.games.taboo.name}</Text>
      <Text style={styles.muted}>
        {ar.turnProgress(state.completedTurns + 1, state.maximumTurns)}
      </Text>
      {state.step === 'pass' && actor && (
        <PassPhoneScreen
          player={actor}
          onConfirm={() => {
            if (!away.includes(actor.id)) drawWord();
          }}
          onSkip={skipTurn}
        />
      )}
      {state.step === 'reveal' && word && (
        <Panel>
          <Text style={styles.title}>{ar.tabooSecret}</Text>
          {teamMode && <Text style={styles.muted}>{ar.tabooTeamHint}</Text>}
          <HoldToReveal
            secret={`${word.text}\n${ar.tabooForbidden}: ${forbidden.join('، ')}`}
            enabled={data.settings.hold}
          />
          <Text style={styles.muted}>{ar.tabooStartHint}</Text>
          <Button label={ar.tabooStart} onPress={() => dispatch({ type: 'start' })} />
        </Panel>
      )}
      {state.step === 'playing' && word && (
        <>
          <CountdownTimer
            key={state.completedTurns}
            seconds={data.config.taboo?.time ?? 30}
            onEnd={() => dispatch({ type: 'timeUp' })}
          />
          <Panel>
            <Text style={styles.title}>{word.text}</Text>
            <Text style={styles.muted}>{ar.tabooForbidden}</Text>
            {forbidden.map((item) => (
              <Text key={item} style={{ color: theme.muted, textDecorationLine: 'line-through' }}>
                {item}
              </Text>
            ))}
            <Button label={ar.tabooGuessed} onPress={() => drawWord('guessed')} />
            <Button secondary label={ar.tabooSaidForbidden} onPress={() => drawWord('forbidden')} />
            <Button secondary label={ar.cardsSkip} onPress={() => drawWord('skip')} />
          </Panel>
        </>
      )}
      {state.step === 'turnEnd' && (
        <Panel>
          <Text style={styles.title}>{ar.timeUp}</Text>
          <Button label={ar.knowmeNext} onPress={() => dispatch({ type: 'nextTurn' })} />
        </Panel>
      )}
      <GameControls onUndo={undo} onPlayers={() => router.push('/players')}
        onSkip={finish} onHome={() => router.replace('/')}
        playersDisabled={state.step === 'playing'} />
    </Screen>
  );
}
