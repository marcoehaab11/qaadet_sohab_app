import { Player } from '../engine/types';
import { ar } from '../i18n/ar-EG';
import { Button, Panel, Text } from './ui';
import { theme } from '../theme';
import { View } from 'react-native';
export function PassPhoneScreen({
  player,
  onConfirm,
  onSkip,
}: {
  player: Player;
  onConfirm: () => void;
  onSkip?: () => void;
}) {
  return (
    <Panel style={{ alignItems: 'center', paddingVertical: 30, gap: 12 }}>
      <Text style={{ color: theme.gold, fontFamily: theme.bold, fontSize: 14 }}>📱 {ar.passPhone}</Text>
      <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: player.color,
        borderWidth: 5, borderColor: theme.cream, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 20, elevation: 6 }}>
        <Text style={{ textAlign: 'center', fontSize: 66, lineHeight: 90 }}>{player.emoji}</Text>
      </View>
      <Text style={{ textAlign: 'center', color: theme.muted }}>{ar.passTo}</Text>
      <Text style={{ fontFamily: theme.display, fontSize: 40, lineHeight: 54, textAlign: 'center' }}>{player.name}</Text>
      <Text style={{ color: theme.muted, textAlign: 'center' }}>🔒 {ar.secretHint}</Text>
      <View style={{ alignSelf: 'stretch', gap: 10, marginTop: 12 }}>
        <Button label={ar.confirm} onPress={onConfirm} />
        {onSkip && <Button secondary label={ar.skipTurn} onPress={onSkip} />}
      </View>
    </Panel>
  );
}
