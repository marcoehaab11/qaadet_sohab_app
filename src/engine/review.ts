export function eligibleForReview(completedSessions: number, askedVersion: string | null, version: string) {
  return completedSessions >= 3 && askedVersion !== version;
}
