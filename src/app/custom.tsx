import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { Button, Panel, Screen, styles, Text } from '../components/ui';
import { CustomItem, CustomTarget, customTargets, normalizeCustomText, validateCustom } from '../content/custom';
import { useApp } from '../store';
import { theme } from '../theme';

const names: Record<CustomTarget, string> = {
  likely: 'مين غالبًا؟', truth: 'صراحة', dare: 'تحدي', charades: 'تمثيل',
  imposter: 'كلمات Imposter', cards: 'كوتشينة الشلة', taboo: 'ممنوع تقول',
};
const cardKinds = { tell: 'احكي', pick: 'اختار', dare: 'تحدي', who: 'مين؟', secret: 'سر' } as const;

export default function CustomScreen() {
  const decks = useApp((s) => s.data.customDecks);
  const update = useApp((s) => s.update);
  const [target, setTarget] = useState<CustomTarget>('likely');
  const [value, setValue] = useState('');
  const [forbidden, setForbidden] = useState('');
  const [kind, setKind] = useState<CustomItem['kind']>('tell');
  const [error, setError] = useState<string | null>(null);
  const items = decks[target] ?? [];
  const save = () => {
    const problem = validateCustom(target, value, forbidden, items, kind);
    if (problem) { setError(problem); return; }
    const item: CustomItem = {
      id: Crypto.randomUUID(), text: normalizeCustomText(value),
      ...(target === 'taboo' ? { forbidden: forbidden.split(/[,،]/).map(normalizeCustomText) } : {}),
      ...(target === 'cards' ? { kind } : {}),
    };
    update((data) => ({ ...data, customDecks: {
      ...data.customDecks, [target]: [...(data.customDecks[target] ?? []), item],
    } }));
    setValue(''); setForbidden(''); setError(null);
  };
  return (
    <Screen>
      <Text style={styles.title}>أسئلة الشلة 🫶</Text>
      <Text style={styles.muted}>اكتبوا أسئلتكم وكلماتكم. بتتحفظ على الموبايل ده بس.</Text>
      <View style={[styles.row, { gap: 7 }]}>
        {customTargets.map((id) => (
          <View key={id} style={{ minWidth: 95 }}>
            <Button secondary={target !== id} label={names[id]} onPress={() => {
              setTarget(id); setValue(''); setForbidden(''); setError(null);
            }} />
          </View>
        ))}
      </View>
      <Panel>
        <Text style={{ fontFamily: theme.bold }}>{names[target]} · {items.length}</Text>
        {target === 'imposter' && <Text style={styles.muted}>فئة «🫶 كلمات الشلة» هتظهر لما تضيفوا ٣ كلمات.</Text>}
        <TextInput
          accessibilityLabel="السؤال أو الكلمة"
          placeholder={target === 'taboo' ? 'الكلمة المطلوبة' : 'اكتب السؤال أو الكلمة'}
          placeholderTextColor={theme.muted}
          value={value}
          onChangeText={(text) => { setValue(text); setError(null); }}
          maxLength={91}
          multiline
          style={inputStyle}
        />
        {target === 'taboo' && <TextInput
          accessibilityLabel="٣ كلمات ممنوعة"
          placeholder="٣ كلمات ممنوعة، افصل بينهم بفاصلة"
          placeholderTextColor={theme.muted}
          value={forbidden}
          onChangeText={(text) => { setForbidden(text); setError(null); }}
          multiline
          style={inputStyle}
        />}
        {target === 'cards' && <View style={styles.row}>
          {(Object.keys(cardKinds) as (keyof typeof cardKinds)[]).map((id) => (
            <Button key={id} secondary={kind !== id} label={cardKinds[id]} onPress={() => setKind(id)} />
          ))}
        </View>}
        {error && <Text accessibilityRole="alert" style={{ color: '#ffb4ab' }}>{error}</Text>}
        <Button label="ضيف للقعدة" onPress={save} />
      </Panel>
      {items.map((item) => <Panel key={item.id}>
        <Text>{item.text}</Text>
        {item.forbidden && <Text style={styles.muted}>ممنوع: {item.forbidden.join('، ')}</Text>}
        {item.kind && <Text style={styles.muted}>{cardKinds[item.kind]}</Text>}
        <Button secondary label="امسح" onPress={() => update((data) => ({ ...data,
          customDecks: { ...data.customDecks,
            [target]: (data.customDecks[target] ?? []).filter((entry) => entry.id !== item.id) },
        }))} />
      </Panel>)}
      <Button secondary label="رجوع" onPress={() => router.back()} />
    </Screen>
  );
}

const inputStyle = {
  minHeight: 52, borderWidth: 1, borderColor: theme.line, borderRadius: 14,
  padding: 12, color: theme.cream, backgroundColor: theme.night,
  fontFamily: theme.body, fontSize: 16, textAlign: 'right' as const,
};
