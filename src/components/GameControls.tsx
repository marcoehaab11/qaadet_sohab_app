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
    { icon: '↶', label: ar.undo, onPress: onUndo, disabled: false, tint: '#f3d9ff', background: '#634080' },
    { icon: '👥', label: ar.players, onPress: onPlayers, disabled: playersDisabled,
      tint: '#a7fff6', background: '#176b68' },
    { icon: '⏭', label: ar.skipGame, onPress: onSkip, disabled: false,
      tint: '#ffd1ce', background: '#803d50' },
    { icon: '⌂', label: ar.exitGame, onPress: onHome, disabled: false,
      tint: theme.cream, background: '#46506d' },
  ];
  return <View style={local.wrap}>
    {actions.map((action) => <Pressable key={action.label} accessibilityRole="button"
      accessibilityLabel={action.label} accessibilityState={{ disabled: action.disabled }}
      disabled={action.disabled} onPress={action.onPress}
      style={({ pressed }) => [local.action, { backgroundColor: action.background },
        action.disabled && local.disabled,
        pressed && local.pressed]}>
      <Text style={[local.icon, { color: action.tint }]}>{action.icon}</Text>
      <Text style={local.label}>{action.label}</Text>
    </Pressable>)}
  </View>;
}

const local = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  action: { width: '48%', minHeight: 51, borderRadius: 14,
    borderWidth: 1, borderColor: '#ffffff21', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, paddingHorizontal: 6 },
  disabled: { opacity: 0.4 },
  pressed: { backgroundColor: '#ffffff25' },
  icon: { color: theme.gold, fontSize: 21, lineHeight: 29, textAlign: 'center' },
  label: { color: theme.cream, fontFamily: theme.bold, fontSize: 14, textAlign: 'center' },
});
