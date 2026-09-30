import { z } from 'zod';
export const playerSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(14),
  emoji: z.string().min(1),
  color: z.string().regex(/^#[\da-fA-F]{6}$/),
  team: z.union([z.literal(0), z.literal(1)]).optional(),
});
export const settingsSchema = z.object({
  sound: z.boolean(),
  hold: z.boolean(),
  family: z.boolean(),
  largeText: z.boolean(),
  clearColors: z.boolean(),
});
export const savedSchema = z.object({
  schemaVersion: z.literal(1),
  players: z
    .array(playerSchema)
    .min(2)
    .max(8)
    .refine(
      (players) => new Set(players.map((p) => p.id)).size === players.length,
      'Duplicate player IDs',
    ),
  settings: settingsSchema,
  config: z.record(z.string(), z.record(z.string(), z.number())),
  customDecks: z.record(z.string(), z.array(z.unknown())),
  used: z.record(z.string(), z.array(z.string())),
  completedSessions: z.number().int().nonnegative(),
  onboardingDone: z.boolean(),
  reviewAskedVersion: z.string().nullable(),
  lastSetup: z.object({
    vibe: z.enum(['laugh', 'compete', 'deceive', 'friends', 'random']),
    length: z.union([z.literal(3), z.literal(5)]),
  }),
});
export type SavedData = z.infer<typeof savedSchema>;
export type Settings = SavedData['settings'];
export const storageKey = 'qaadet-sohab:v1';
export function migrateSaved(raw: unknown): SavedData {
  // No legacy app was shipped. Add explicit old-version branches here when the schema changes.
  // Unknown/future versions fail closed; callers preserve the original data instead of overwriting.
  return savedSchema.parse(raw);
}
export function serializeSaved(data: SavedData): string {
  return JSON.stringify(savedSchema.parse(data));
}
