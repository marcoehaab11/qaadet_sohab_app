import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useApp } from '../store';
import { ar } from '../i18n/ar-EG';
import { avatars, theme } from '../theme';
import { Button, Panel, styles, Text } from './ui';
import { Player } from '../engine/types';
export function PlayerEditor({ player, canRemove }: { player: Player; canRemove: boolean }) {
  const [name, setName] = useState(player.name);
  const update = useApp((s) => s.updatePlayer);
  const remove = useApp((s) => s.removePlayer);
  const save = () => {
    const value = name.trim() || player.name;
    setName(value);
    update(player.id, { name: value });
  };
  return (
    <Panel>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ar.avatarHint}
          onPress={() =>
            update(player.id, {
              emoji: avatars[(avatars.indexOf(player.emoji) + 1) % avatars.length]!,
            })
          }
          style={{ minWidth: 52, minHeight: 52, justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 34, lineHeight: 48 }}>{player.emoji}</Text>
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
          style={{
            flex: 1,
            minHeight: 52,
            paddingHorizontal: 10,
            fontFamily: theme.bold,
            color: theme.cream,
            borderBottomWidth: 1,
            borderBottomColor: theme.line,
            fontSize: 18,
            writingDirection: 'rtl',
          }}
        />
      </View>
      {canRemove && <Button secondary label={ar.remove} onPress={() => remove(player.id)} />}
    </Panel>
  );
}
