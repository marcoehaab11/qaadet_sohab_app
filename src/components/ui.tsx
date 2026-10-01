import { PropsWithChildren } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  TextProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { useApp } from '../store';

export function Text({ style, ...props }: TextProps) {
  const large = useApp((s) => s.data.settings.largeText);
  const flat = StyleSheet.flatten(style);
  return (
    <NativeText
      {...props}
      maxFontSizeMultiplier={1.3}
      style={[styles.text, style, large && { fontSize: (flat?.fontSize ?? 15) * 1.15 }]}
    />
  );
}
export function Screen({ children, scrollEnabled = true }: PropsWithChildren<{ scrollEnabled?: boolean }>) {
  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient pointerEvents="none" colors={['#241631', theme.night, '#1b1026']} style={StyleSheet.absoluteFill} />
      <LinearGradient pointerEvents="none" colors={['#67428b66', '#67428b00']} style={styles.glowTop} />
      <LinearGradient pointerEvents="none" colors={['#a4374a30', '#a4374a00']} style={styles.glowBottom} />
      <ScrollView keyboardShouldPersistTaps="handled" scrollEnabled={scrollEnabled}
        contentContainerStyle={styles.screen}>
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
export function Panel({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <LinearGradient colors={['#2d233b', '#21192d']} style={[styles.panel, style]}>{children}</LinearGradient>;
}
export function PromptCard({ label, text, emoji, accent = theme.coral }: {
  label: string; text: string; emoji: string; accent?: string;
}) {
  return <View style={[styles.promptCard, { borderTopColor: accent }]}>
    <View pointerEvents="none" style={styles.promptOutline} />
    <Text style={styles.promptEmoji}>{emoji}</Text>
    <Text style={styles.promptLabel}>{label}</Text>
    <Text style={styles.promptText}>{text}</Text>
  </View>;
}
export function Button({
  label,
  onPress,
  secondary = false,
  tone = 'default',
  disabled = false,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  tone?: 'default' | 'success' | 'danger';
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && tone === 'default' && styles.secondary,
        tone === 'success' && styles.success,
        tone === 'danger' && styles.danger,
        disabled && { opacity: 0.45 },
        pressed && { transform: [{ translateY: 3 }], borderBottomWidth: 2 },
      ]}
    >
      <Text style={[styles.buttonText, secondary && tone === 'default' && { color: theme.cream }]}>{label}</Text>
    </Pressable>
  );
}
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.night },
  glowTop: { position: 'absolute', width: 520, height: 520, top: -260, right: -230, borderRadius: 260 },
  glowBottom: { position: 'absolute', width: 440, height: 440, bottom: -270, left: -230, borderRadius: 220 },
  screen: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 36 },
  content: { width: '100%', maxWidth: 440, gap: 14, direction: 'rtl' },
  text: {
    fontFamily: theme.body,
    color: theme.cream,
    fontSize: 15,
    textAlign: 'auto',
    writingDirection: 'rtl',
    lineHeight: 25,
  },
  title: { fontFamily: theme.display, fontSize: 32, lineHeight: 44 },
  muted: { color: theme.muted, fontSize: 13 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  panel: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ffffff24',
    backgroundColor: theme.surface,
    gap: 12,
  },
  promptCard: { minHeight: 260, backgroundColor: theme.cream, borderRadius: 20, borderTopWidth: 8,
    padding: 24, alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  promptOutline: { position: 'absolute', top: 8, bottom: 8, left: 8, right: 8,
    borderColor: '#c7bda9', borderStyle: 'dashed', borderWidth: 1, borderRadius: 13 },
  promptEmoji: { fontSize: 43, lineHeight: 56, textAlign: 'center' },
  promptLabel: { color: '#7e6684', fontFamily: theme.bold, textAlign: 'center', fontSize: 14 },
  promptText: { color: theme.ink, fontFamily: theme.bold, textAlign: 'center',
    fontSize: 23, lineHeight: 38 },
  button: {
    minHeight: 54,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: theme.gold,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: theme.goldShadow,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 5,
  },
  buttonText: { fontFamily: theme.bold, fontSize: 18, textAlign: 'center', color: theme.ink },
  secondary: {
    backgroundColor: '#694790',
    borderWidth: 1,
    borderColor: '#a77ecb',
    borderBottomColor: '#362046',
  },
  success: { backgroundColor: theme.cyan, borderBottomColor: '#16847e' },
  danger: { backgroundColor: theme.coral, borderBottomColor: '#b43c40' },
});
