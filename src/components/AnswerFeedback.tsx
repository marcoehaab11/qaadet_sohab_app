import { StyleSheet, View } from 'react-native';
import { ar } from '../i18n/ar-EG';
import { theme } from '../theme';
import { Text } from './ui';

export function AnswerFeedback({ correct, detail }: { correct: boolean; detail: string }) {
  return <View accessible accessibilityLabel={`${correct ? ar.answerCorrect : ar.answerWrong}. ${detail}`}
    style={[local.banner, correct ? local.correct : local.wrong]}>
    <Text style={[local.icon, correct ? local.correctIcon : local.wrongIcon]}>
      {correct ? '✓' : '✕'}
    </Text>
    <View style={local.copy}>
      <Text style={local.title}>{correct ? ar.answerCorrect : ar.answerWrong}</Text>
      <Text style={local.detail}>{detail}</Text>
    </View>
  </View>;
}

const local = StyleSheet.create({
  banner: { minHeight: 84, borderRadius: 18, borderWidth: 2, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12 },
  correct: { backgroundColor: '#124e47', borderColor: theme.cyan },
  wrong: { backgroundColor: '#622f40', borderColor: '#ff8e94' },
  icon: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden',
    fontFamily: theme.bold, color: theme.ink, fontSize: 29, lineHeight: 44, textAlign: 'center' },
  correctIcon: { backgroundColor: theme.cyan },
  wrongIcon: { backgroundColor: '#ff8e94' },
  copy: { flex: 1 },
  title: { color: theme.cream, fontFamily: theme.bold, fontSize: 23, lineHeight: 36 },
  detail: { color: theme.cream, fontSize: 14, lineHeight: 24 },
});
