import { Player } from '../engine/types';
import { ar } from '../i18n/ar-EG';
import { Button, Panel, Text, styles } from './ui';
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
    <Panel>
      <Text style={{ textAlign: 'center', fontSize: 64, lineHeight: 88 }}>{player.emoji}</Text>
      <Text style={{ textAlign: 'center' }}>{ar.passTo}</Text>
      <Text style={[styles.title, { textAlign: 'center' }]}>{player.name}</Text>
      <Text style={[styles.muted, { textAlign: 'center' }]}>{ar.secretHint}</Text>
      <Button label={ar.confirm} onPress={onConfirm} />
      {onSkip && <Button secondary label={ar.skipTurn} onPress={onSkip} />}
    </Panel>
  );
}
