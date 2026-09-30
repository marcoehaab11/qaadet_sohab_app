import { eligibleForReview } from '../src/engine/review';

test('review becomes eligible on the third completed session once per version', () => {
  expect(eligibleForReview(2, null, '0.1.0')).toBe(false);
  expect(eligibleForReview(3, null, '0.1.0')).toBe(true);
  expect(eligibleForReview(4, '0.1.0', '0.1.0')).toBe(false);
  expect(eligibleForReview(4, '0.1.0', '0.2.0')).toBe(true);
});
