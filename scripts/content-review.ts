import { createHash } from 'node:crypto';
import { ContentPack } from '../src/content/schema';

export type Approval = { hash: string; reviewers: [string, string]; reviewedAt: string };
export function packHash(pack: ContentPack) {
  return createHash('sha256').update(JSON.stringify(pack.items)).digest('hex');
}
export function approvedPack(pack: ContentPack, approval: Approval | undefined) {
  if (!approval || approval.hash !== packHash(pack)) return false;
  const names = approval.reviewers.map((name) => name.normalize('NFKC').trim().toLocaleLowerCase('ar'));
  return names.length === 2 && names.every(Boolean) && names[0] !== names[1] &&
    /^\d{4}-\d{2}-\d{2}$/.test(approval.reviewedAt);
}
