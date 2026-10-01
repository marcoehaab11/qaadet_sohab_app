import { useState } from 'react';
import { Pressable, StyleSheet, Text as NativeText, TextInput, View } from 'react-native';
import { useApp } from '../store';
import { ar } from '../i18n/ar-EG';
import { avatars, theme } from '../theme';
import { Panel, Text } from './ui';
import { Player } from '../engine/types';
export function PlayerEditor({ player, canRemove, away, onToggleAway, onRemove }: {
  player: Player;
  canRemove: boolean;
  away?: boolean;
  onToggleAway?: () => void;
  onRemove: () => void;
}) {
  const [name, setName] = useState(player.name);
  const update = useApp((s) => s.updatePlayer);
  const save = () => {
    const value = name.trim() || player.name;
    setName(value);
    update(player.id, { name: value });
  };
  return (
    <Panel style={local.panel}>
      <View style={local.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ar.avatarHint}
          onPress={() =>
            update(player.id, {
              emoji: avatars[(avatars.indexOf(player.emoji) + 1) % avatars.length]!,
            })
          }
          style={local.avatar}
        >
          <NativeText style={local.avatarEmoji}>{player.emoji}</NativeText>
        </Pressable>
        <TextInput
          accessibilityLabel={ar.nameHint}
          value={name}
          onChangeText={setName}
          onBlur={save}
          onSubmitEditing={save}
          maxLength={14}
          maxFontSizeMultiplier={1.3}
          selectTextOnFocus
          style={local.name}
        />
        {onToggleAway && <Pressable accessibilityRole="button"
          accessibilityLabel={`${player.name}: ${away ? 'رجّعه للقعدة' : 'علّمه مش موجود'}`}
          accessibilityState={{ selected: !!away }}
          onPress={onToggleAway}
          style={[local.iconButton, away ? local.awayButton : local.presentButton]}>
          <Text style={local.statusIcon}>{away ? '↩' : '💤'}</Text>
        </Pressable>}
        {canRemove && <Pressable accessibilityRole="button"
          accessibilityLabel={`${ar.remove}: ${player.name}`}
          onPress={onRemove} style={[local.iconButton, local.removeButton]}>
          <Text style={local.removeIcon}>×</Text>
        </Pressable>}
      </View>
    </Panel>
  );
}

const local = StyleSheet.create({
  panel: { paddingVertical: 10, paddingHorizontal: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatar: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 32, lineHeight: 44, textAlign: 'center' },
  name: { flex: 1, minWidth: 0, minHeight: 48, paddingHorizontal: 6,
    fontFamily: theme.bold, color: theme.cream, borderBottomWidth: 1,
    borderBottomColor: '#a77ecb', fontSize: 18, writingDirection: 'rtl' },
  iconButton: { width: 42, height: 42, borderRadius: 13, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center' },
  presentButton: { backgroundColor: '#176b68', borderColor: theme.cyan },
  awayButton: { backgroundColor: '#7b4a25', borderColor: theme.gold },
  removeButton: { backgroundColor: '#803d50', borderColor: '#ff8996' },
  statusIcon: { color: theme.cream, fontSize: 22, lineHeight: 32, textAlign: 'center' },
  removeIcon: { color: theme.cream, fontSize: 29, lineHeight: 34, textAlign: 'center' },
});
