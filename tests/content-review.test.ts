import { approvedPack, packHash } from '../scripts/content-review';
import { packs } from '../src/content/loader';

const pack = packs[0]!;
test('editorial approval needs two distinct reviewers and current pack content', () => {
  const approval = { hash: packHash(pack), reviewers: ['مراجع أول', 'مراجع تاني'] as [string, string], reviewedAt: '2026-09-30' };
  expect(approvedPack(pack, approval)).toBe(true);
  expect(approvedPack(pack, { ...approval, reviewers: ['مراجع أول', 'مراجع أول'] })).toBe(false);
  expect(approvedPack({ ...pack, items: [...pack.items, { id: 'new', text: 'جديد' }] }, approval)).toBe(false);
});
