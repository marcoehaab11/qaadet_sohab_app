import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../store';
import { useSession } from '../store/session';
import { ar } from '../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../components/ui';
import { CountdownTimer } from '../components/CountdownTimer';
import { AnswerFeedback } from '../components/AnswerFeedback';
import { useAnswerFeedback } from '../hooks/useAnswerFeedback';
import { loadContent, packs } from '../content/loader';
import { drawFromPack } from '../content/draw';
import { createSpeed, speedReducer } from '../games/speed/reducer';

export default function Tiebreak() {
  const [wrongAttempt, setWrongAttempt] = useState(false);
  const playAnswerFeedback = useAnswerFeedback();
  const players = useApp((s) => s.data.players);
  const session = useSession((s) => s.session);
  const state = useSession((s) => s.tieGame);
  const setState = useSession((s) => s.setTieGame);
  const tiedIds = useSession((s) => s.tiedIds);
  const away = useSession((s) => s.away);
  const award = useSession((s) => s.award);
  const resolveTie = useSession((s) => s.resolveTie);
  const participants = players.filter((player) => tiedIds.includes(player.id))
    .map((player) => ({ ...player, away: away.includes(player.id) }));
  if (!session || session.phase !== 'tiebreak' || !state)
    return <Screen><Button label={ar.back} onPress={() => router.replace('/results')} /></Screen>;
  const drawChallenge = () => {
    setWrongAttempt(false);
    const pack = packs.find((candidate) => candidate.id === 'base-speed')!;
    const result = drawFromPack({ ...pack, items: loadContent('speed') }, state.seed);
    const fresh = createSpeed(1, result.seed);
    setState(speedReducer(fresh, { type: 'challenge', challengeId: result.item.id, seed: result.seed }, participants).state);
  };
  const dispatch = (action: Parameters<typeof speedReducer>[1]) => {
    const result = speedReducer(state, action, participants);
    if (action.type === 'confirm' && state.step === 'confirm' && state.buzzedId) {
      playAnswerFeedback(action.correct);
      setWrongAttempt(!action.correct);
    } else if (action.type === 'buzz') setWrongAttempt(false);
    setState(result.state);
    if (result.changes.length) award(result.changes, result.stats);
  };
  const challenge = packs.find((pack) => pack.id === 'base-speed')?.items
    .find((item) => item.id === state.challengeId);
  const buzzed = players.find((player) => player.id === state.buzzedId);
  const winner = players.find((player) => player.id === state.winnerId);
  const eligible = participants.filter((player) => !player.away && !state.excludedIds.includes(player.id));
  return <Screen>
    <Text style={styles.title}>{ar.tiebreakTitle}</Text>
    <Text style={styles.muted}>{ar.tiebreakIntro}</Text>
    <Panel>
      <Text>{participants.map((player) => `${player.emoji} ${player.name}`).join(' · ')}</Text>
    </Panel>
    {state.step === 'ready' && <Button label={ar.tiebreakDraw} onPress={drawChallenge} />}
    {state.step === 'countdown' && <>
      <Text style={styles.title}>{ar.speedCountdown}</Text>
      <CountdownTimer key={state.seed} seconds={3} controls={false}
        onEnd={() => dispatch({ type: 'start' })} />
    </>}
    {state.step === 'buzz' && challenge && <>
      {wrongAttempt && <AnswerFeedback correct={false} detail={ar.answerTryAgain} />}
      <Panel>
        <Text style={styles.title}>{challenge.text}</Text>
        <Text style={styles.muted}>{ar.speedTap}</Text>
      </Panel>
      <View style={{ gap: 10 }}>
        {eligible.map((player) => <Button key={player.id} label={`${player.emoji} ${player.name}`}
          onPress={() => dispatch({ type: 'buzz', playerId: player.id })} />)}
      </View>
      <Button secondary label={ar.tiebreakAgain} onPress={drawChallenge} />
    </>}
    {state.step === 'confirm' && buzzed && <Panel>
      <Text style={styles.title}>{buzzed.emoji} {buzzed.name}</Text>
      <Text>{ar.speedConfirm}</Text>
      <Button tone="success" label={ar.speedCorrect} onPress={() => dispatch({ type: 'confirm', correct: true })} />
      <Button tone="danger" label={ar.speedWrong} onPress={() => dispatch({ type: 'confirm', correct: false })} />
    </Panel>}
    {state.step === 'result' && winner && <Panel>
      <AnswerFeedback correct detail={ar.answerPoint} />
      <Text style={styles.title}>{ar.speedWinner(winner.name)}</Text>
      <Button label={ar.tiebreakSeeResult} onPress={() => { resolveTie(); router.replace('/results'); }} />
    </Panel>}
    {state.step !== 'result' && <Button secondary label={ar.tiebreakDrawResult}
      onPress={() => { resolveTie(); router.replace('/results'); }} />}
  </Screen>;
}
