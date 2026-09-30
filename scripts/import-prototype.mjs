// Read data literals only. Never execute scripts from the supplied prototype.
import fs from 'node:fs';
import ts from 'typescript';
const html = fs.readFileSync('prototype/qaadet-sohab-demo.html', 'utf8');
const source = html.match(/const CONTENT = ([\s\S]*?)\n};/)?.[1];
if (!source) throw new Error('Missing CONTENT');
const ast = ts.createSourceFile(
  'content.js',
  `const CONTENT = ${source}\n};`,
  ts.ScriptTarget.Latest,
  true,
);
function literal(node) {
  if (ts.isStringLiteral(node) || ts.isNumericLiteral(node))
    return ts.isNumericLiteral(node) ? Number(node.text) : node.text;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node))
    return Object.fromEntries(
      node.properties.map((p) => {
        if (!ts.isPropertyAssignment(p) || !(ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)))
          throw new Error('Non-literal content');
        return [p.name.text, literal(p.initializer)];
      }),
    );
  throw new Error(`Refusing non-literal syntax: ${node.kind}`);
}
const data = literal(ast.statements[0].declarationList.declarations[0].initializer);
const packs = [];
function pack(id, game, items) {
  packs.push({
    id,
    version: 1,
    locale: 'ar-EG',
    game,
    tier: 'free',
    items: items.map((item, i) => ({ id: `${id}-${String(i + 1).padStart(3, '0')}`, ...item })),
  });
}
for (const game of ['likely', 'charades', 'speed', 'knowme'])
  pack(
    `base-${game}`,
    game,
    data[game].map((text) => ({ text })),
  );
pack(
  'base-imposter',
  'imposter',
  Object.entries(data.imposter).flatMap(([category, words]) =>
    words.map((text) => ({ text, category })),
  ),
);
pack(
  'base-undercover',
  'imposter',
  data.undercover.map(([text, pair]) => ({ text, pair })),
);
pack(
  'base-taboo',
  'taboo',
  data.taboo.map(([text, forbidden]) => ({ text, forbidden, level: 'easy' })),
);
pack(
  'base-cards',
  'cards',
  Object.entries(data.decks).flatMap(([deck, d]) =>
    d.cards.map(([kind, text]) => ({ text, kind, deck })),
  ),
);
pack(
  'base-tod',
  'tod',
  Object.entries(data.tod).flatMap(([level, d]) =>
    ['truth', 'dare'].flatMap((kind) => d[kind].map((text) => ({ text, kind, level }))),
  ),
);
// Replace prototype prompts that expose private media, ask for posting/contact, or physical exertion.
const replacements = new Map([
  ['اعمل وش مضحك وخلّي حد يصورك', 'اعمل وش مضحك لمدة خمس ثواني'],
  [
    'ابعت فويس لحد من صحابك بتغنيله أغنية عيد ميلاد حتى لو مش عيد ميلاده',
    'غني أغنية عيد ميلاد لكرسي فاضي في القعدة',
  ],
  ['خلّي القعدة تختارلك صورة بروفايل لمدة ساعة', 'ارسم بإيدك في الهوا صورة بروفايل خيالية'],
  ['وري القعدة آخر صورة في الجاليري', 'اوصف صورة خيالية نفسك تصورها'],
  [
    'خلّي القعدة تكتبلك بوست وانت توافق عليه قبل ما يتنشر',
    'اخترع عنوان خبر مضحك عن القعدة وقوله بصوت مذيع',
  ],
  ['اعمل 10 ضغط وانت بتغني', 'غني وانت بتحرك إيديك كأنك قائد أوركسترا'],
  ['هات حاجة بتشتغل بالكهربا! 🔌', 'شاور على حاجة بتشتغل بالكهربا من مكانك! 🔌'],
]);
for (const p of packs)
  for (const item of p.items) item.text = replacements.get(item.text) ?? item.text;
fs.mkdirSync('src/content/packs', { recursive: true });
fs.writeFileSync('src/content/packs/seed.json', JSON.stringify(packs, null, 2) + '\n');
console.log(
  `Imported ${packs.reduce((n, p) => n + p.items.length, 0)} seed items in ${packs.length} packs. Editorial review still required.`,
);
