import { z } from 'zod';
import { enabledGameIds } from '../config/release';
const text = z.string().trim().min(1).max(90);
export const itemSchema = z.object({
  id: z.string().min(1),
  text,
  category: text.optional(),
  level: z.enum(['easy', 'hard', 'chill', 'funny', 'bold', 'chaos']).optional(),
  kind: z.enum(['truth', 'dare', 'tell', 'pick', 'who', 'secret']).optional(),
  deck: z.enum(['friends', 'couples', 'crazy', 'deep', 'funny', 'custom']).optional(),
  forbidden: z.array(text).length(3).optional(),
  pair: text.optional(),
  tags: z.array(text).optional(),
  source: z.string().optional(),
});
export const packSchema = z
  .object({
    id: z.string().min(1),
    version: z.number().int().positive(),
    locale: z.literal('ar-EG'),
    game: z.enum(enabledGameIds),
    tier: z.enum(['free', 'premium']),
    items: z.array(itemSchema).min(1),
  })
  .superRefine((pack, ctx) => {
    const ids = new Set<string>();
    const keys = new Set<string>();
    pack.items.forEach((item, index) => {
      if (ids.has(item.id))
        ctx.addIssue({ code: 'custom', message: 'Duplicate id', path: ['items', index, 'id'] });
      ids.add(item.id);
      const key = item.text.normalize('NFKC').trim();
      if (keys.has(key))
        ctx.addIssue({ code: 'custom', message: 'Duplicate text', path: ['items', index, 'text'] });
      keys.add(key);
      if (
        pack.game === 'taboo' &&
        (!item.forbidden ||
          new Set(item.forbidden).size !== 3 ||
          item.forbidden.includes(item.text))
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Three distinct forbidden words required',
          path: ['items', index],
        });
      }
      if (pack.game === 'cards' && (!item.deck || !item.kind))
        ctx.addIssue({
          code: 'custom',
          message: 'Card needs deck and kind',
          path: ['items', index],
        });
      if (pack.game === 'tod' && (!item.level || !['truth', 'dare'].includes(item.kind ?? '')))
        ctx.addIssue({
          code: 'custom',
          message: 'Truth or dare needs level and kind',
          path: ['items', index],
        });
    });
  });
export type ContentPack = z.infer<typeof packSchema>;
export type ContentItem = z.infer<typeof itemSchema>;
