import fs from 'node:fs';
import { packSchema } from '../src/content/schema';
const raw: unknown = JSON.parse(fs.readFileSync('src/content/packs/seed.json', 'utf8'));
const parsed = packSchema.array().safeParse(raw);
if (!parsed.success) {
  console.error(parsed.error.issues);
  process.exit(1);
}
const banned = ['كحول', 'مخدرات', 'انتحار', 'اشرب خمرة'];
const targets: Record<string, number> = {
  'base-taboo': 300,
  'base-tod': 240,
  'base-cards': 200,
  'base-imposter': 200,
  'base-likely': 120,
  'base-charades': 120,
  'base-undercover': 80,
  'base-knowme': 80,
  'base-speed': 60,
};
let invalid = false;
const ids = new Set<string>();
for (const pack of parsed.data) {
  if (ids.has(pack.id)) {
    console.error(`Duplicate pack: ${pack.id}`);
    invalid = true;
  }
  ids.add(pack.id);
  for (const item of pack.items) {
    const allText = [item.text, item.pair, ...(item.forbidden ?? [])].filter(Boolean).join(' ');
    if (banned.some((word) => allText.includes(word))) {
      console.error(`Review blocked content: ${item.id}`);
      invalid = true;
    }
  }
  console.log(`${pack.id}: ${pack.items.length}/${targets[pack.id] ?? 0}`);
}
console.log(
  'Seed validation only. Launch targets and two-person editorial review remain M6 release gates.',
);
if (
  process.argv.includes('--release') &&
  parsed.data.some((p) => p.items.length < (targets[p.id] ?? 0))
)
  invalid = true;
process.exitCode = invalid ? 1 : 0;
