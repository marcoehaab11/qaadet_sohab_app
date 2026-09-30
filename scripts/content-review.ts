import { createHash } from 'node:crypto';
import { ContentPack } from '../src/content/schema';

export type Approval = { hash: string; reviewers: [string, string]; reviewedAt: string };
export function contentHash(items: unknown[]) {
  return createHash('sha256').update(JSON.stringify(items)).digest('hex');
}
export function packHash(pack: ContentPack) {
  return contentHash(pack.items);
}
export function approvedHash(hash: string, approval: Approval | undefined) {
  if (!approval || approval.hash !== hash) return false;
  const names = approval.reviewers.map((name) => name.normalize('NFKC').trim().toLocaleLowerCase('ar'));
  return names.length === 2 && names.every(Boolean) && names[0] !== names[1] &&
    /^\d{4}-\d{2}-\d{2}$/.test(approval.reviewedAt);
}
export function approvedPack(pack: ContentPack, approval: Approval | undefined) {
  return approvedHash(packHash(pack), approval);
}
