import { Pressable, StyleSheet, View } from 'react-native';
import { ar } from '../i18n/ar-EG';
import { theme } from '../theme';
import { Text } from './ui';

export function GameControls({ onUndo, onPlayers, onSkip, onHome, playersDisabled = false }: {
  onUndo: () => void;
  onPlayers: () => void;
  onSkip: () => void;
  onHome: () => void;
  playersDisabled?: boolean;
}) {
  const actions = [
    { icon: '↶', label: ar.undo, onPress: onUndo, disabled: false },
    { icon: '👥', label: ar.players, onPress: onPlayers, disabled: playersDisabled },
    { icon: '⏭', label: ar.skipGame, onPress: onSkip, disabled: false },
    { icon: '⌂', label: ar.exitGame, onPress: onHome, disabled: false },
  ];
  return <View style={local.wrap}>
    {actions.map((action) => <Pressable key={action.label} accessibilityRole="button"
      accessibilityLabel={action.label} accessibilityState={{ disabled: action.disabled }}
      disabled={action.disabled} onPress={action.onPress}
      style={({ pressed }) => [local.action, action.disabled && local.disabled,
        pressed && local.pressed]}>
      <Text style={local.icon}>{action.icon}</Text>
      <Text style={local.label}>{action.label}</Text>
    </Pressable>)}
  </View>;
}

const local = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  action: { width: '48%', minHeight: 51, borderRadius: 14, backgroundColor: '#ffffff10',
    borderWidth: 1, borderColor: '#ffffff21', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, paddingHorizontal: 6 },
  disabled: { opacity: 0.4 },
  pressed: { backgroundColor: '#ffffff25' },
  icon: { color: theme.gold, fontSize: 21, lineHeight: 29, textAlign: 'center' },
  label: { color: theme.muted, fontFamily: theme.bold, fontSize: 13, textAlign: 'center' },
});
