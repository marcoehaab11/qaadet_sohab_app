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
export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.screen}>
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
export function Panel({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.panel, style]}>{children}</View>;
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
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
        secondary && styles.secondary,
        disabled && { opacity: 0.45 },
        pressed && { transform: [{ translateY: 3 }], borderBottomWidth: 2 },
      ]}
    >
      <Text style={[styles.buttonText, secondary && { color: theme.cream }]}>{label}</Text>
    </Pressable>
  );
}
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.night },
  screen: { flexGrow: 1, alignItems: 'center', padding: 20, paddingBottom: 36 },
  content: { width: '100%', maxWidth: 480, gap: 20, direction: 'rtl' },
  text: {
    fontFamily: theme.body,
    color: theme.cream,
    fontSize: 15,
    textAlign: 'auto',
    writingDirection: 'rtl',
    lineHeight: 26,
  },
  title: { fontFamily: theme.display, fontSize: 32, lineHeight: 44 },
  muted: { color: theme.muted, fontSize: 13 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  panel: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
    gap: 12,
  },
  button: {
    minHeight: 52,
    paddingVertical: 11,
    paddingHorizontal: 18,
    backgroundColor: theme.gold,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: theme.goldShadow,
  },
  buttonText: { fontFamily: theme.bold, fontSize: 16, textAlign: 'center', color: theme.night },
  secondary: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    borderBottomColor: '#09050f',
  },
});
