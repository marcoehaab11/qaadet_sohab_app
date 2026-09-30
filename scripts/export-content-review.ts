import fs from 'node:fs';
import { packSchema } from '../src/content/schema';
import { contentHash, packHash } from './content-review';

const files = ['seed', 'ramadan', 'eid', 'sahel', 'exams', 'proverbs', 'taboo-hard', 'draw'];
const packs = packSchema.array().parse(files.flatMap((file) =>
  JSON.parse(fs.readFileSync(`src/content/packs/${file}.json`, 'utf8')) as unknown[]));
const punishments = JSON.parse(fs.readFileSync('src/content/punishments.json', 'utf8')) as string[];
const columns = ['pack_id', 'pack_hash', 'game', 'season', 'deck', 'level', 'kind', 'item_id',
  'text', 'ending', 'forbidden_1', 'forbidden_2', 'forbidden_3', 'decision', 'note'];
const safeCell = (value: unknown) => {
  const plain = String(value ?? '');
  const safe = /^[=+\-@]/.test(plain) ? `'${plain}` : plain;
  return `"${safe.replaceAll('"', '""')}"`;
};
const rows: unknown[][] = packs.flatMap((pack) => {
  const hash = packHash(pack);
  return pack.items.map((item) => [
    pack.id, hash, pack.game, pack.season, item.deck, item.level, item.kind, item.id,
    item.text, item.pair, item.forbidden?.[0], item.forbidden?.[1], item.forbidden?.[2], '', '',
  ]);
});
const punishmentHash = contentHash(punishments);
punishments.forEach((text, index) => rows.push([
  'punishments', punishmentHash, 'punishment', '', '', '', '', `punishment-${String(index + 1).padStart(3, '0')}`,
  text, '', '', '', '', '', '',
]));
const csv = '\ufeff' + [columns, ...rows].map((row) => row.map(safeCell).join(',')).join('\r\n') + '\r\n';
const directory = 'review-packets';
fs.mkdirSync(directory, { recursive: true });
for (const reviewer of [1, 2])
  fs.writeFileSync(`${directory}/reviewer-${reviewer}.csv`, csv, 'utf8');
fs.writeFileSync(`${directory}/README.md`,
  `# مراجعة محتوى قعدة صحاب\n\nكل ملف من الملفين فيه ${rows.length} عنصرًا من ${packs.length} حزمة ألعاب والعقوبات. أرسل ملفًا لكل مراجع بشكل مستقل. في عمود decision اكتب accept أو revise أو reject، وفي note اكتب سبب التعديل أو الرفض. بعد أي تعديل في الحزمة، لازم المراجعان يراجعا البصمة الجديدة. الملفان ليسا اعتمادًا تلقائيًا؛ انظر docs/CONTENT_REVIEW.md لتسجيل الاعتماد بعد المراجعة الحقيقية.\n`,
  'utf8');
console.log(`Created two independent CSV review copies with ${rows.length} items each in ${directory}/.`);
