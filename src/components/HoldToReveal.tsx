import { useEffect, useState } from 'react';
import { AppState, Pressable, View } from 'react-native';
import { ar } from '../i18n/ar-EG';
import { Text, styles } from './ui';
import { theme } from '../theme';
export function HoldToReveal({ secret, enabled = true }: { secret: string; enabled?: boolean }) {
  const [held, setHeld] = useState(false);
  const [foreground, setForeground] = useState(
    AppState.currentState === 'active' || AppState.currentState === null,
  );
  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => {
      setHeld(false);
      setForeground(state === 'active');
    });
    return () => listener.remove();
  }, []);
  const visible = foreground && (held || !enabled);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={visible ? secret : ar.holdLabel}
      accessibilityHint={ar.holdHint}
      onPressIn={() => setHeld(true)}
      onPressOut={() => setHeld(false)}
      onResponderTerminate={() => setHeld(false)}
      onBlur={() => setHeld(false)}
      style={{
        minHeight: 190,
        justifyContent: 'center',
        backgroundColor: theme.cream,
        borderColor: theme.coral,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 9 },
        elevation: 5,
      }}
    >
      <View pointerEvents="none">
        <Text selectable={false} style={[styles.title, { textAlign: 'center', color: theme.ink }]}>
          {visible ? secret : ar.hidden}
        </Text>
        <Text style={[styles.muted, { textAlign: 'center', color: '#6f5f84' }]}>{ar.holdLabel}</Text>
      </View>
    </Pressable>
  );
}
