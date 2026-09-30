import { useEffect, useRef, useState } from 'react';
import { PixelRatio, Platform, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import * as StoreReview from 'expo-store-review';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { captureRef } from 'react-native-view-shot';
import { useApp } from '../store';
import { useSession } from '../store/session';
import { leaders } from '../engine/session';
import { ar } from '../i18n/ar-EG';
import { Button, Panel, Screen, styles, Text } from '../components/ui';
import { Scoreboard } from '../components/Scoreboard';
import { eligibleForReview } from '../engine/review';
import { lowestScorers, sessionAwards } from '../engine/awards';
import { random } from '../engine/random';
import punishments from '../content/punishments.json';
import { ResultCard } from '../components/ResultCard';
import { resultShareText } from '../engine/resultShare';

let reviewPending = false;
export default function Results() {
  const players = useApp((s) => s.data.players);
  const away = useSession((s) => s.away);
  const ledger = useSession((s) => s.ledger);
  const session = useSession((s) => s.session);
  const [redraw, setRedraw] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const cardRef = useRef<View>(null);
  const reset = useSession((s) => s.reset);
  const completedSessions = useApp((s) => s.data.completedSessions);
  const askedVersion = useApp((s) => s.data.reviewAskedVersion);
  const update = useApp((s) => s.update);
  useEffect(() => {
    if (session?.phase === 'tiebreak') router.replace('/tiebreak');
  }, [session?.phase]);
  useEffect(() => {
    const version = Constants.expoConfig?.version;
    if (__DEV__ || Platform.OS === 'web' || !version || reviewPending ||
      !eligibleForReview(completedSessions, askedVersion, version)) return;
    const timer = setTimeout(() => {
      reviewPending = true;
      void (async () => {
        try {
          if (!(await StoreReview.isAvailableAsync()) || !(await StoreReview.hasAction())) return;
          // The OS may suppress the dialog; record the request, not a presumed rating.
          update((data) => ({ ...data, reviewAskedVersion: version }));
          await StoreReview.requestReview();
        } catch {
          // Review is optional and must never interrupt the results screen.
        } finally {
          reviewPending = false;
        }
      })();
    }, 1200);
    return () => clearTimeout(timer);
  }, [completedSessions, askedVersion, update]);
  const winners = leaders(
    players.filter((p) => !away.includes(p.id)).map((p) => p.id),
    ledger,
  );
  const activeIds = players.filter((player) => !away.includes(player.id)).map((player) => player.id);
  const awards = sessionAwards(activeIds, ledger);
  const losers = lowestScorers(activeIds, ledger);
  const loser = losers.length ? losers[Math.floor(random(session?.seed ?? 1).value * losers.length)] : null;
  const punishment = punishments[Math.floor(random((session?.seed ?? 1) + redraw + 997).value * punishments.length)];
  async function shareCard() {
    if (!cardRef.current || sharing) return;
    setSharing(true);
    setShareMessage('');
    try {
      if (Platform.OS === 'web' || !(await Sharing.isAvailableAsync())) {
        setShareMessage(ar.imageShareUnavailable);
        return;
      }
      const ratio = PixelRatio.get();
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile',
        width: 1080 / ratio, height: 1920 / ratio });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
    } catch {
      setShareMessage(ar.imageShareError);
    } finally {
      setSharing(false);
    }
  }
  async function shareWhatsApp() {
    setShareMessage('');
    try {
      const message = resultShareText(players, activeIds, ledger.scores, awards);
      await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
    } catch {
      setShareMessage(ar.whatsappUnavailable);
    }
  }
  if (session?.phase === 'tiebreak') return null;
  return (
    <Screen>
      <Text style={styles.title}>{ar.sessionDone}</Text>
      <Panel>
        <Text style={styles.title}>{ar.results}</Text>
        {winners.map((id) => {
          const p = players.find((player) => player.id === id)!;
          return (
            <Text key={id} style={{ fontSize: 24 }}>
              {p.emoji} {p.name}
            </Text>
          );
        })}
      </Panel>
      <Scoreboard
        players={players.map((p) => ({ ...p, away: away.includes(p.id) }))}
        scores={ledger.scores}
      />
      {session?.finished && awards.length > 0 && <Panel>
        <Text style={styles.title}>{ar.awardsTitle}</Text>
        {awards.map((award) => <Text key={award.stat}>
          {ar.awardNames[award.stat]} · {award.playerIds.map((id) => players.find((player) => player.id === id)?.name).join('، ')}
        </Text>)}
      </Panel>}
      {session?.finished && loser && <Panel>
        <Text style={styles.title}>{ar.punishmentTitle}</Text>
        <Text>{players.find((player) => player.id === loser)?.name}: {punishment}</Text>
        <Button secondary label={ar.punishmentAgain} onPress={() => setRedraw((value) => value + 1)} />
      </Panel>}
      {session?.finished && <Panel>
        <Text style={styles.title}>{ar.shareResult}</Text>
        <ResultCard ref={cardRef} players={players} activeIds={activeIds} scores={ledger.scores}
          awards={awards} date={new Date(session.startedAt)} />
        <Button label={sharing ? ar.sharingResult : ar.shareImage} disabled={sharing} onPress={() => void shareCard()} />
        <Button secondary label={ar.shareWhatsApp} onPress={() => void shareWhatsApp()} />
        {!!shareMessage && <Text accessibilityRole="alert">{shareMessage}</Text>}
      </Panel>}
      <Button
        label={ar.newSession}
        onPress={() => {
          reset();
          router.replace('/');
        }}
      />
    </Screen>
  );
}
