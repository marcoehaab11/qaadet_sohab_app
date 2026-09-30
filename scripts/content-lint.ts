import fs from 'node:fs';
import { packSchema } from '../src/content/schema';
import { Approval, approvedPack, packHash } from './content-review';
const raw: unknown = [
  ...JSON.parse(fs.readFileSync('src/content/packs/seed.json', 'utf8')),
  ...JSON.parse(fs.readFileSync('src/content/packs/ramadan.json', 'utf8')),
  ...JSON.parse(fs.readFileSync('src/content/packs/eid.json', 'utf8')),
  ...JSON.parse(fs.readFileSync('src/content/packs/sahel.json', 'utf8')),
  ...JSON.parse(fs.readFileSync('src/content/packs/exams.json', 'utf8')),
  ...JSON.parse(fs.readFileSync('src/content/packs/proverbs.json', 'utf8')),
  ...JSON.parse(fs.readFileSync('src/content/packs/taboo-hard.json', 'utf8')),
  ...JSON.parse(fs.readFileSync('src/content/packs/draw.json', 'utf8')),
];
const parsed = packSchema.array().safeParse(raw);
if (!parsed.success) {
  console.error(parsed.error.issues);
  process.exit(1);
}
const banned = ['كحول', 'مخدرات', 'انتحار', 'اشرب خمرة'];
const punishments = JSON.parse(fs.readFileSync('src/content/punishments.json', 'utf8')) as unknown;
if (!Array.isArray(punishments) || punishments.length !== 20 ||
  punishments.some((item) => typeof item !== 'string' || !item.trim() || item.length > 90 ||
    banned.some((word) => item.includes(word)))) {
  console.error('Invalid punishment cards'); process.exit(1);
}
const targets: Record<string, number> = {
  'base-taboo': 200,
  'base-taboo-hard': 100,
  'base-tod': 240,
  'base-cards': 200,
  'base-imposter': 200,
  'base-likely': 120,
  'base-charades': 120,
  'base-undercover': 80,
  'base-knowme': 80,
  'base-speed': 60,
  'ramadan-imposter': 20,
  'ramadan-likely': 15,
  'ramadan-charades': 15,
  'ramadan-taboo': 15,
  'eid-imposter': 20,
  'eid-likely': 15,
  'eid-charades': 15,
  'eid-taboo': 15,
  'sahel-imposter': 20,
  'sahel-likely': 15,
  'sahel-charades': 15,
  'sahel-taboo': 15,
  'exams-imposter': 20,
  'exams-likely': 15,
  'exams-charades': 15,
  'exams-taboo': 15,
  'base-proverb': 120,
  'base-draw': 200,
};
const reviews = JSON.parse(fs.readFileSync('docs/content-reviews.json', 'utf8')) as {
  schemaVersion: number;
  packs: Record<string, Approval>;
};
if (reviews.schemaVersion !== 1 || !reviews.packs || Array.isArray(reviews.packs)) {
  console.error('Invalid editorial review manifest');
  process.exit(1);
}
let invalid = false;
const ids = new Set<string>();
const itemIds = new Set<string>();
for (const pack of parsed.data) {
  if (ids.has(pack.id)) {
    console.error(`Duplicate pack: ${pack.id}`);
    invalid = true;
  }
  ids.add(pack.id);
  for (const item of pack.items) {
    if (itemIds.has(item.id)) {
      console.error(`Duplicate content ID: ${item.id}`);
      invalid = true;
    }
    itemIds.add(item.id);
    const allText = [item.text, item.pair, ...(item.forbidden ?? [])].filter(Boolean).join(' ');
    if (banned.some((word) => allText.includes(word))) {
      console.error(`Review blocked content: ${item.id}`);
      invalid = true;
    }
  }
  const approved = approvedPack(pack, reviews.packs[pack.id]);
  console.log(`${pack.id}: ${pack.items.length}/${targets[pack.id] ?? 0}; ${approved ? 'reviewed' : 'review needed'}; sha256 ${packHash(pack)}`);
  if (process.argv.includes('--release') && !approved) invalid = true;
}
for (const [id, target] of Object.entries(targets)) {
  const count = parsed.data.find((pack) => pack.id === id)?.items.length ?? 0;
  if (process.argv.includes('--release') && count < target) invalid = true;
}
console.log('Release needs target counts and two distinct human reviewers for every current pack hash.');
process.exitCode = invalid ? 1 : 0;
