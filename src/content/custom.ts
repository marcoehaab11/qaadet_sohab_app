import { z } from 'zod';
import { ContentItem } from './schema';

export const customTargets = ['likely', 'truth', 'dare', 'charades', 'imposter', 'cards', 'taboo'] as const;
export type CustomTarget = (typeof customTargets)[number];
export const customItemSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1).max(90),
  forbidden: z.array(z.string().trim().min(1).max(90)).length(3).optional(),
  kind: z.enum(['tell', 'pick', 'dare', 'who', 'secret']).optional(),
});
export type CustomItem = z.infer<typeof customItemSchema>;
export type CustomDecks = Partial<Record<CustomTarget, CustomItem[]>>;
export const customDecksSchema = z.partialRecord(z.enum(customTargets), z.array(customItemSchema));

export function normalizeCustomText(value: string) {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ');
}

export function validateCustom(
  target: CustomTarget,
  text: string,
  forbiddenInput: string,
  existing: CustomItem[],
  kind?: CustomItem['kind'],
): string | null {
  const value = normalizeCustomText(text);
  if (!value) return 'اكتب السؤال أو الكلمة الأول.';
  if (value.length > 90) return 'الحد الأقصى ٩٠ حرف.';
  if (existing.some((item) => normalizeCustomText(item.text).toLocaleLowerCase('ar') === value.toLocaleLowerCase('ar')))
    return 'السؤال أو الكلمة دي موجودة قبل كده.';
  if (target === 'cards' && !kind) return 'اختار نوع الكارت.';
  if (target === 'taboo') {
    const words = forbiddenInput.split(/[,،]/).map(normalizeCustomText);
    if (words.length !== 3 || words.some((word) => !word)) return 'اكتب ٣ كلمات ممنوعة وافصل بينهم بفاصلة.';
    if (words.some((word) => word.length > 90)) return 'كل كلمة ممنوعة لازم تكون ٩٠ حرف أو أقل.';
    const keys = words.map((word) => word.toLocaleLowerCase('ar'));
    if (new Set(keys).size !== 3 || keys.includes(value.toLocaleLowerCase('ar')))
      return 'الكلمات الممنوعة لازم تكون مختلفة عن بعضها وعن الكلمة الأساسية.';
  }
  return null;
}

export function customContent(target: CustomTarget, decks: CustomDecks): ContentItem[] {
  return (decks[target] ?? []).flatMap((item) => {
    const base: ContentItem = { id: `custom:${item.id}`, text: item.text, source: 'custom' };
    if (target === 'truth' || target === 'dare')
      return (['chill', 'funny', 'bold', 'chaos'] as const).map((level) => ({
        ...base, id: `${base.id}:${level}`, kind: target, level,
      }));
    if (target === 'cards') return [{ ...base, deck: 'custom' as const, kind: item.kind }];
    if (target === 'taboo') return [{ ...base, forbidden: item.forbidden }];
    if (target === 'imposter') return [{ ...base, category: '🫶 كلمات الشلة' }];
    return [base];
  });
}
