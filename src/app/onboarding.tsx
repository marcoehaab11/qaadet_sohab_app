import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../store';
import { useSession } from '../store/session';
import { ar } from '../i18n/ar-EG';
import { Button, Panel, Screen, Text } from '../components/ui';
import { PlayerEditor } from '../components/PlayerEditor';
import { Vibe } from '../engine/queue';
import { theme } from '../theme';

const vibeIcons: Record<Vibe, string> = {
  laugh: '😂', compete: '🧠', deceive: '🕵️', friends: '❤️', random: '🎲',
};

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const add = useApp((s) => s.addPlayer);
  const remove = useApp((s) => s.removePlayer);
  const begin = useSession((s) => s.begin);
  const finish = (start: boolean) => {
    update((d) => ({ ...d, onboardingDone: true }));
    if (start) {
      begin();
      router.replace('/host');
    } else router.replace('/');
  };
  return (
    <Screen>
      <View style={local.progressRow}>
        {Array.from({ length: 3 }, (_, index) => <View key={index}
          style={[local.progressPill, index === step && local.progressActive]} />)}
      </View>
      <Text style={local.eyebrow}>{ar.onboardProgress(step + 1)}</Text>
      {step === 0 && <>
        <View style={local.hero}>
          <LinearGradient colors={['#51346b', '#24172f']} style={local.heroGlow} />
          <Image source={require('../../assets/brand-mark.png')} style={local.mark} resizeMode="contain" />
          <View style={local.brandRow}>
            <Text style={[local.brandWord, { color: theme.gold }]}>قعدة</Text>
            <Text style={local.brandWord}>صحاب</Text>
          </View>
          <Text style={local.heroTitle}>{ar.welcome}</Text>
          <Text style={local.heroCopy}>{ar.onboardConcept}</Text>
        </View>
        <View style={local.featureRow}>
          <Text style={local.feature}>🎲 ألعاب كتير</Text>
          <Text style={local.feature}>👥 موبايل واحد</Text>
          <Text style={local.feature}>⚡ من غير نت</Text>
        </View>
      </>}
      {step === 1 && <>
        <View style={local.stepHeading}>
          <Text style={local.stepEmoji}>👥</Text>
          <Text style={local.heading}>{ar.onboardPlayers}</Text>
          <Text style={local.subheading}>ضيفوا الشلة واختاروا صورة لكل واحد</Text>
        </View>
        {data.players.map((p) => <PlayerEditor key={p.id} player={p}
          canRemove={data.players.length > 2} onRemove={() => remove(p.id)} />)}
        <Button secondary disabled={data.players.length >= 8} label={ar.addPlayer} onPress={add} />
      </>}
      {step === 2 && <>
        <View style={local.stepHeading}>
          <Text style={local.stepEmoji}>✨</Text>
          <Text style={local.heading}>{ar.onboardSetup}</Text>
          <Text style={local.subheading}>المود والوقت علينا، والضحك عليكم</Text>
        </View>
        <Panel>
          <Text style={local.groupTitle}>{ar.chooseVibe}</Text>
          <View style={local.vibes}>
            {(Object.keys(ar.vibes) as Vibe[]).map((vibe) => {
              const active = data.lastSetup.vibe === vibe;
              return <Pressable key={vibe} accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => update((d) => ({ ...d, lastSetup: { ...d.lastSetup, vibe } }))}
                style={[local.vibe, active && local.vibeActive]}>
                <Text style={local.vibeEmoji}>{vibeIcons[vibe]}</Text>
                <Text style={[local.vibeLabel, active && local.vibeLabelActive]}>{ar.vibes[vibe]}</Text>
              </Pressable>;
            })}
          </View>
          <Text style={local.groupTitle}>{ar.chooseLength}</Text>
          <View style={local.lengthRow}>
            {([3, 5] as const).map((length) => {
              const active = data.lastSetup.length === length;
              return <Pressable key={length} accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => update((d) => ({ ...d, lastSetup: { ...d.lastSetup, length } }))}
                style={[local.length, active && local.lengthActive]}>
                <Text style={[local.lengthLabel, active && local.lengthLabelActive]}>
                  {length === 3 ? `⚡ ${ar.short}` : `🔥 ${ar.long}`}
                </Text>
              </Pressable>;
            })}
          </View>
        </Panel>
      </>}
      <Button label={step === 2 ? ar.startSession : ar.onboardNext}
        onPress={() => (step === 2 ? finish(true) : setStep(step + 1))} />
      <Pressable accessibilityRole="button" onPress={() => finish(false)} style={local.skip}>
        <Text style={local.skipText}>{ar.onboardSkip}</Text>
      </Pressable>
    </Screen>
  );
}

const local = StyleSheet.create({
  progressRow: { flexDirection: 'row', gap: 7, alignSelf: 'center', marginTop: 4 },
  progressPill: { width: 24, height: 5, borderRadius: 5, backgroundColor: '#ffffff36' },
  progressActive: { width: 42, backgroundColor: theme.gold },
  eyebrow: { alignSelf: 'center', color: theme.muted, fontSize: 12 },
  hero: { minHeight: 395, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 22 },
  heroGlow: { position: 'absolute', width: 320, height: 320, borderRadius: 160, opacity: 0.75 },
  mark: { width: 208, height: 208, marginBottom: -5 },
  brandRow: { flexDirection: 'row', gap: 7, justifyContent: 'center' },
  brandWord: { color: theme.cream, fontFamily: theme.display, fontSize: 46, lineHeight: 60,
    textShadowColor: '#00000080', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10 },
  heroTitle: { fontFamily: theme.display, fontSize: 30, lineHeight: 42, textAlign: 'center' },
  heroCopy: { maxWidth: 280, color: theme.muted, textAlign: 'center' },
  featureRow: { flexDirection: 'row', justifyContent: 'center', gap: 7, flexWrap: 'wrap' },
  feature: { fontSize: 12, color: theme.cream, backgroundColor: '#ffffff14', borderColor: '#ffffff24',
    borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  stepHeading: { alignItems: 'center', paddingVertical: 18 },
  stepEmoji: { fontSize: 57, lineHeight: 75 },
  heading: { fontFamily: theme.display, fontSize: 33, lineHeight: 47, textAlign: 'center' },
  subheading: { color: theme.muted, textAlign: 'center' },
  groupTitle: { fontFamily: theme.bold, fontSize: 17 },
  vibes: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  vibe: { flex: 1, minWidth: 0, borderRadius: 14, backgroundColor: '#ffffff0c',
    borderWidth: 1, borderColor: '#ffffff24', alignItems: 'center', paddingVertical: 8 },
  vibeActive: { backgroundColor: '#ffc83d26', borderColor: theme.gold },
  vibeEmoji: { fontSize: 23, lineHeight: 31 },
  vibeLabel: { fontSize: 11, color: theme.muted, textAlign: 'center' },
  vibeLabelActive: { color: theme.gold },
  lengthRow: { flexDirection: 'row', gap: 8 },
  length: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
    borderColor: '#ffffff24', borderWidth: 1 },
  lengthActive: { backgroundColor: theme.cream, borderColor: theme.cream },
  lengthLabel: { fontSize: 13, color: theme.cream, textAlign: 'center' },
  lengthLabelActive: { color: theme.ink },
  skip: { alignSelf: 'center', padding: 8 },
  skipText: { fontSize: 13, color: theme.muted },
});
