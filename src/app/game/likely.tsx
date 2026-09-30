import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../store';
import { useSession } from '../../store/session';
import { ar } from '../../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../../components/ui';
import { PassPhoneScreen } from '../../components/PassPhoneScreen';
import { activeSeason, loadContent, packs } from '../../content/loader';
import { drawFromPack } from '../../content/draw';
import { likelyReducer, voteCounts } from '../../games/likely/reducer';
import { theme } from '../../theme';

function VoteBar({ percent }: { percent: number }) {
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 550,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress]);
  return (
    <View style={{ height: 12, borderRadius: 6, backgroundColor: theme.line }}>
      <Animated.View
        style={{
          width: `${percent}%`,
          height: 12,
          borderRadius: 6,
          backgroundColor: theme.gold,
          opacity: progress,
          transform: [{ scaleX: progress }],
        }}
      />
    </View>
  );
}

export default function Likely() {
  const data = useApp((s) => s.data);
  const players = data.players;
  const session = useSession((s) => s.session);
  const state = useSession((s) => s.likelyGame);
  const setState = useSession((s) => s.setLikelyGame);
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
  const dispatch = (action: Parameters<typeof likelyReducer>[1]) => {
    const result = likelyReducer(state, action, participants);
    setState(result.state);
    if (result.changes.length || result.stats.length) award(result.changes, result.stats);
    if (result.finished) finish();
  };
  const nextQuestion = () => {
    const pack = packs.find((p) => p.id === 'base-likely')!;
    const items = loadContent('likely', false, data.customDecks, activeSeason(new Date(), data.seasonOverride));
    const result = drawFromPack({ ...pack, items }, state.seed);
    dispatch({ type: 'question', questionId: result.item.id, seed: result.seed });
  };
  const skipVoter = () => {
    if (!state.turnId) return;
    const nextParticipants = participants.map((p) =>
      p.id === state.turnId ? { ...p, away: true } : p,
    );
    if (!away.includes(state.turnId) && !useSession.getState().setAway(state.turnId)) {
      useApp.getState().notify(ar.needTwo);
      return;
    }
    const result = likelyReducer(state, { type: 'skipVoter' }, nextParticipants);
    setState(result.state);
    if (result.changes.length || result.stats.length) award(result.changes, result.stats);
  };
  const question = loadContent('likely', false, data.customDecks, activeSeason(new Date(), data.seasonOverride))
    .find((item) => item.id === state.questionId);
  const voter = players.find((p) => p.id === state.turnId);
  const counts = voteCounts(state.votes);
  const most = Math.max(0, ...Object.values(counts));

  return (
    <Screen>
      <Text style={styles.title}>{ar.games.likely.name}</Text>
      <Text style={styles.muted}>{ar.questionProgress(state.completed + 1, state.maximum)}</Text>
      {state.step === 'question' && (
        <Panel>
          <Text style={styles.title}>{ar.likelyReady}</Text>
          <Text style={styles.muted}>{ar.likelyPrivacy}</Text>
          <Button label={ar.likelyShowQuestion} onPress={nextQuestion} />
        </Panel>
      )}
      {state.step === 'pass' && voter && (
        <PassPhoneScreen
          player={voter}
          onConfirm={() => {
            if (!away.includes(voter.id)) dispatch({ type: 'confirm' });
          }}
          onSkip={skipVoter}
        />
      )}
      {state.step === 'vote' && question && (
        <Panel>
          <Text style={styles.title}>{question.text}</Text>
          <Text style={styles.muted}>{ar.likelyPrivacy}</Text>
          {voter && away.includes(voter.id) ? (
            <Button label={ar.skipTurn} onPress={skipVoter} />
          ) : (
            participants
              .filter((p) => !p.away)
              .map((p) => (
                <Button
                  key={p.id}
                  secondary
                  label={`${p.emoji} ${p.name}`}
                  onPress={() => dispatch({ type: 'vote', targetId: p.id })}
                />
              ))
          )}
        </Panel>
      )}
      {state.step === 'results' && question && (
        <Panel>
          <Text style={styles.title}>{question.text}</Text>
          <Text style={styles.muted}>{ar.likelyResults}</Text>
          {participants
            .filter((p) => !p.away)
            .map((p) => {
              const count = counts[p.id] ?? 0;
              const pct = state.order.length ? Math.round((count / state.order.length) * 100) : 0;
              return (
                <View key={p.id} style={{ gap: 4 }}>
                  <Text style={{ fontFamily: theme.bold }}>
                    {p.emoji} {p.name} · {count} {count === most && most > 0 ? '⭐' : ''}
                  </Text>
                  <VoteBar percent={pct} />
                </View>
              );
            })}
          <Button label={ar.likelyNext} onPress={() => dispatch({ type: 'next' })} />
        </Panel>
      )}
      <Button secondary label={ar.undo} onPress={undo} />
      <Button secondary label={ar.players} onPress={() => router.push('/players')} />
      <Button secondary label={ar.skipGame} onPress={finish} />
      <Button secondary label={ar.exitGame} onPress={() => router.replace('/')} />
    </Screen>
  );
}
