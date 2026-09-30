import { forwardRef } from 'react';
import { StyleSheet, Text as NativeText, TextProps, View } from 'react-native';
import { theme } from '../theme';
import { Award } from '../engine/awards';
import { Player, PlayerId } from '../engine/types';
import { rankedResults } from '../engine/resultShare';
import { ar } from '../i18n/ar-EG';

type Props = {
  players: readonly Player[];
  activeIds: readonly PlayerId[];
  scores: Record<PlayerId, number>;
  awards: readonly Award[];
  date: Date;
};

// Keep the exported image at a predictable layout regardless of the viewer's font-size setting.
function Text({ style, ...props }: TextProps) {
  return <NativeText {...props} allowFontScaling={false} style={[card.text, style]} />;
}

export const ResultCard = forwardRef<View, Props>(function ResultCard({ players, activeIds, scores, awards, date }, ref) {
  const ranked = rankedResults(players, activeIds, scores);
  const dateText = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  return <View ref={ref} collapsable={false} style={card.frame}>
    <View style={card.header}>
      <Text style={card.brand}>قعدة صحاب ✨</Text>
      <Text style={card.date}>{dateText}</Text>
    </View>
    <Text style={card.headline}>نجوم القعدة</Text>
    <Text style={card.subheading}>اللمة الحلوة تكسب دايمًا</Text>
    <View style={card.podium}>
      {ranked.slice(0, 3).map((player, index) => <View key={player.id} style={[card.place, index === 0 && card.first]}>
        <Text style={card.medal}>{['🥇', '🥈', '🥉'][index]}</Text>
        <Text style={card.avatar}>{player.emoji}</Text>
        <Text numberOfLines={1} style={card.playerName}>{player.name}</Text>
        <Text style={card.points}>{scores[player.id] ?? 0} نقطة</Text>
      </View>)}
    </View>
    {ranked.length > 3 && <View style={card.others}>
      {ranked.slice(3).map((player, index) => <Text key={player.id} numberOfLines={1} style={card.otherText}>
        {index + 4}. {player.emoji} {player.name} · {scores[player.id] ?? 0}
      </Text>)}
    </View>}
    <View style={card.awards}>
      <Text style={card.awardsTitle}>{ar.awardsTitle}</Text>
      {awards.slice(0, 5).length ? awards.slice(0, 5).map((award) => <Text key={award.stat} numberOfLines={1} style={card.awardText}>
        ✦ {ar.awardNames[award.stat]} · {award.playerIds.map((id) => players.find((p) => p.id === id)?.name).join('، ')}
      </Text>) : <Text style={card.awardText}>الضحكة الحلوة للجميع ✦</Text>}
    </View>
    <Text style={card.hashtag}>#قعدة_صحاب</Text>
  </View>;
});

const card = StyleSheet.create({
  text: { color: theme.cream, fontFamily: theme.body, writingDirection: 'rtl', textAlign: 'center' },
  frame: { width: '100%', aspectRatio: 9 / 16, backgroundColor: theme.night, borderRadius: 20,
    borderWidth: 2, borderColor: theme.gold, padding: 18, overflow: 'hidden', justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: theme.gold, fontFamily: theme.display, fontSize: 25, lineHeight: 32 },
  date: { color: theme.muted, fontFamily: theme.bold, fontSize: 12, writingDirection: 'ltr' },
  headline: { color: theme.cream, fontFamily: theme.display, fontSize: 37, lineHeight: 44, textAlign: 'center' },
  subheading: { color: theme.muted, fontSize: 13, textAlign: 'center' },
  podium: { flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'flex-end' },
  place: { flex: 1, minWidth: 0, alignItems: 'center', backgroundColor: theme.surface, borderRadius: 14,
    paddingHorizontal: 3, paddingVertical: 9, borderWidth: 1, borderColor: theme.line },
  first: { borderColor: theme.gold, paddingVertical: 15, backgroundColor: '#382927' },
  medal: { fontSize: 21, textAlign: 'center', lineHeight: 27 },
  avatar: { fontSize: 31, textAlign: 'center', lineHeight: 40 },
  playerName: { fontFamily: theme.bold, fontSize: 12, textAlign: 'center', width: '100%' },
  points: { color: theme.gold, fontFamily: theme.bold, fontSize: 12, textAlign: 'center' },
  others: { gap: 1 },
  otherText: { fontSize: 10, lineHeight: 15, textAlign: 'center' },
  awards: { borderTopWidth: 1, borderColor: theme.line, paddingTop: 7, gap: 1 },
  awardsTitle: { color: theme.gold, fontFamily: theme.display, fontSize: 20, lineHeight: 26, textAlign: 'center' },
  awardText: { fontSize: 11, lineHeight: 17, textAlign: 'center' },
  hashtag: { color: theme.cyan, fontFamily: theme.bold, fontSize: 15, textAlign: 'center' },
});
