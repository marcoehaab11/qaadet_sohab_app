import { useEffect } from 'react';
import { View } from 'react-native';
import { useApp } from '../store';
import { Text } from './ui';
import { theme } from '../theme';
export function Toast() {
  const message = useApp((s) => s.toast);
  const notify = useApp((s) => s.notify);
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => notify(null), 4500);
    return () => clearTimeout(timeout);
  }, [message, notify]);
  if (!message) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: 34,
        start: 20,
        end: 20,
        maxWidth: 480,
        alignSelf: 'center',
        padding: 16,
        borderRadius: 18,
        backgroundColor: theme.gold,
      }}
    >
      <Text accessibilityLiveRegion="polite" style={{ color: theme.night, textAlign: 'center' }}>
        {message}
      </Text>
    </View>
  );
}
