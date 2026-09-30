# Foundation verification — 2026-09-30

- `npm run check`: passed for the foundation. M2 revalidation is recorded below.
- `npx expo-doctor`: 21/21 checks passed.
- `npx expo export --platform web --platform android`: succeeded. This is bundling, not an APK/AAB build or a device test.
- Browser: original prototype inspected. New home, player editor, name persistence across reload, and game-rule modal exercised in the local preview. Layout inspected at a 360px viewport.
- Not yet verified on Android/iOS devices: native RTL, background timer behavior, hold gestures/TalkBack, sound/haptics, combined maximum OS font scaling, and offline cold launch.
- Seed content is 236 items, below the v1 targets. Two-person editorial review is outstanding. Release content lint is expected to fail until M6.
- No game/session UI was playable in the foundation preview; no store artifact has been created or submitted.

## Next implementation checkpoint

M2 screens and live-session coordination, integrating the already tested engine primitives. Add integration tests for navigation pause/resume, sit-out and late-join behavior as those flows are introduced.

## Session and cards checkpoint — 2026-09-30

- Added unit coverage for session progression, tied leaders, card completion and skip scoring, sit-out, and late join turn order.
- `npm run check`: passed with strict typecheck, ESLint, 30 Jest tests, and seed content lint.
- `npx expo export --platform web --platform android`: both bundles built successfully after the session and cards changes.
- Browser preview exercised onboarding, vibe selection, host queue, first playable cards game, passing the phone, flipping a card, awarding a point, and final results.
- A physical Android and iOS device test is still required; web/Android export only confirms JavaScript bundling.
- Other seven games, launch-level content counts, human content review, store artwork, signing, and submission remain outstanding.

## Truth or Dare and مين غالبًا checkpoint — 2026-09-30

- TypeScript strict, ESLint, 36 Jest tests, and seed content lint passed. Web and Android JavaScript exports succeeded; neither is a signed binary or physical device test.
- Browser preview exercised standalone Truth or Dare level selection, pass-phone, truth prompt, +1 and next turn. It also exercised standalone مين غالبًا with four private votes for the same player and verified the 4-vote result, four +1 awards and the results screen.
- Family filtering, done/skip scoring, absent-voter handling, self-vote scoring, and tied winners have unit coverage. Native device checks and complete content are still open.

## مين يعرفني أكتر checkpoint — 2026-09-30

- `npm run check`: strict typecheck, ESLint, 39 Jest tests, and seed lint passed. Web and Android JavaScript exports succeeded.
- Browser preview exercised private answer entry, answer hiding during guesses, reveal, selection of a correct guesser, award of +1, and next subject.
- Unit tests cover multiple correct guessers, optional answer, absent guesser exclusion, subject exclusion, and absent subject skipping. Physical device QA and four remaining games are open.

## ممنوع تقول checkpoint — 2026-09-30

- `npm run check`: strict typecheck, ESLint, 41 Jest tests, and seed lint passed. Web and Android JavaScript exports succeeded.
- Browser preview exercised pass-phone, hidden word, timed word view, +1 guessed, -1 forbidden, next word, and time-up transition.
- Unit tests cover scoring, free word skip, turn rotation, and absent actor skip. Three game screens, physical device timer verification, and full content remain open.

## تمثيل checkpoint — 2026-09-30

- `npm run check`: strict typecheck, ESLint, 44 Jest tests, and seed lint passed. Web and Android JavaScript exports succeeded.
- Browser preview exercised pass-phone, hidden scene, timer start with scene removed, selection of the first guesser, +1 each for actor and guesser, and turn-end screen.
- Unit tests cover single-award behavior, self-guess rejection, time-up with no points, next actor, and absent actor skip. Imposter and أسرع واحد are the remaining game screens.

## أسرع واحد checkpoint — 2026-09-30

- `npm run check`: strict typecheck, ESLint, 46 Jest tests, and seed lint passed. Web and Android JavaScript exports succeeded.
- Browser preview exercised the countdown, challenge reveal, first buzz lock, wrong answer exclusion, second buzzer, host confirmation, +1 and results.
- Unit tests cover lockout, wrong answer, correct answer, absent player, and no-answer advancement. Imposter is the remaining game screen.

## Imposter checkpoint — 2026-09-30

- `npm run check`: strict typecheck, ESLint, 49 Jest tests, and seed lint passed. Web and Android JavaScript exports succeeded.
- Browser preview exercised classic setup and category choice, four private role passes, discussion and vote, an escaped imposter receiving +2, result reveal, then another round in undercover mode.
- Unit tests cover one/two-imposter assignment, exact suspect count, caught group points, escaped imposter points, correct/wrong group-word guess, and minimum active players for two imposters.
- All eight basic game flows are now implemented. Signed AAB, physical Android/iOS tests, complete editorial-reviewed content, store assets, rating flow, and release readiness remain open.

## Custom decks and review checkpoint — 2026-09-30

- `npm run check`: strict typecheck, ESLint, 53 Jest tests, and seed lint passed. `npx expo-doctor`: 21/21. Web and Android JavaScript exports succeeded.
- Browser preview: added a custom likely question, saw it persist after reload; rejected a Taboo item with only two forbidden words, then saved one with three and confirmed persistence; added a custom card and played it from the new «🫶 الشلة» deck.
- Family badge is implemented. Unit tests cover custom merging, family filtering, validation and review eligibility at the third session, once per app version.
- Native store review still needs verification in a distributed Android build; store OS policies may suppress the dialog. No signed AAB or physical-device test yet.

## Android release preparation checkpoint — 2026-09-30

- Added Android application ID and first version code, EAS APK/AAB profiles, local privacy screen and public privacy-policy draft, and original app/adaptive/splash artwork.
- `npm run check`: 53 Jest tests, strict TypeScript, ESLint and seed lint passed. `npx expo-doctor`: 21/21. `npx expo config --type public --json` resolves the Android ID, icon and splash config. Web/Android JavaScript exports succeeded.
- Browser preview verified the privacy screen opens from Settings. PNG icon and monochrome Android asset were inspected locally. Native splash, adaptive icon, package permissions and store-review dialog still require a signed device build.
- `eas config` could not be executed because no Expo account is authenticated here. EAS build/submit, Play Console metadata and Data safety declarations remain unverified.
- Cards selection now falls back to Friends if Family mode hides Couples or a custom deck is deleted before the next draw; 54 tests, typecheck and lint pass after this edge-case fix.

## Editorial release gate — 2026-09-30

- Normal `npm run check` passes with 55 tests. The explicit release check fails as intended: all nine packs are below target and have no two-person approval.
- Content lint now detects duplicate IDs across packs, reports full per-pack hashes, and invalidates an approval when pack contents change. The approval manifest is empty until two real reviewers complete the process in `docs/CONTENT_REVIEW.md`.

## Ramadan pack checkpoint — 2026-09-30

- Added 20 Imposter words and 15 each for Likely, Charades and ممنوع تقول. Content lint validates all four packs and reports their full hashes; editorial approval remains open.
- Unit tests cover Ramadan/Eid/Gregorian season priority, Intl fallback conversion, availability of the Ramadan content, and exclusion outside its season. TypeScript, lint and 57 tests passed.

## M7 proverb preview — 2026-09-30

- Standalone and session routes, reveal and first-correct scoring are implemented. Unit tests cover scoring only once, absent players and an unanswered proverb.
- `npm run check`: strict TypeScript, ESLint, 59 Jest tests and content lint passed. Release content lint still fails as intended for missing volume and human approval.

## M7 Memory Battle preview — 2026-09-30

- Both question modes, deterministic board generation, single scoring, absent-player handling and round completion have unit coverage. TypeScript, ESLint, 61 Jest tests and content lint passed before the final absent-player guard; rechecked after it.

## M7 ممنوع تقول difficulty preview — 2026-09-30

- Unit coverage checks easy, hard and mixed pools. `npm run check` passed with 62 Jest tests, strict TypeScript, ESLint and content lint. The 12 hard words require editorial review and expansion to 100.

## M7 teams preview — 2026-09-30

- Tests cover balanced assignment, alternating turns, team penalties, teammate-only تمثيل guesses, and speed team lockout. Native layout and dynamic attendance still need device QA.

## M7 drawing preview — 2026-09-30

- Reducer tests cover private reveal gate, artist/guesser scoring, replay protection, away-player rejection and timeout. `npm run check` passed with 67 Jest tests, strict TypeScript, ESLint and content lint. Canvas touch and the hidden-word flow still need device QA.
- Browser preview exercised standalone pass-phone, hidden word, start, a visible canvas stroke, first-guesser selection, and +1 each for artist and guesser. Android/web JS export and Expo Doctor 21/21 passed. Native touch QA remains open.

## M8 awards and punishment preview — 2026-09-30

- Tests cover sorted awards, tied names, limit, empty counters and tied last place. `npm run check` passed with 69 Jest tests, strict TypeScript, ESLint, and content lint. The 20 local punishment cards pass length and banned-word validation.

## M8 surprises preview — 2026-09-30

- Tests cover the five-game event guarantee across 100 seeds, opt-out, host-event idempotency, steal/gift fallback, and ×2 on positive and negative points. `npm run check` passed with 72 Jest tests, strict TypeScript, ESLint and content lint.

## M8 tie-break preview — 2026-09-30

- Tests cover tied leaders after the final game, a clear winner, one remaining active player, wrong-claim exclusion and another player's successful claim. `npm run check` passed with 74 Jest tests, strict TypeScript, ESLint and content lint; web/Android JS export succeeded. Native route QA remains open.

## M8 local history and stats — 2026-09-30

- Tests cover record winners, duplicate prevention, 40-record retention, career wins and streaks, and migration defaults for existing saves. `npm run check` passed with 77 Jest tests, strict TypeScript, ESLint and content lint; Android/web JS export succeeded.
- Browser preview opened the stats screen from Settings using existing saved data. Its prior completed-session count remained readable after migration; new history was empty as expected because the earlier version had not saved sessions.

## M8 result card and sharing — 2026-09-30

- Result screen now shows a 9:16 card with date, standings, up to five awards and hashtag. Native capture requests a 1080×1920 PNG using the device pixel ratio and opens the system share sheet. WhatsApp text sharing opens the encoded result through wa.me. Both actions are optional and user-triggered.
- Web cannot share the local PNG through expo-sharing; it shows a clear unavailable message. Native capture/share and WhatsApp handoff still need physical-device QA.
- `npm run check` passed with 78 tests, strict TypeScript, ESLint and content lint. Expo Doctor passed 21/21; web and Android JavaScript exports succeeded. A format test covers absent players, stable tied order, awards and hashtag in the WhatsApp text.

## M9 seasonal packs and override — 2026-09-30

- Added draft packs for Eid, Sahel and Exams: each has 20 Imposter words and 15 prompts each for Likely, Charades and Taboo. The existing religious-first calendar detection now activates these packs, and Settings can force one season or return to automatic mode. A saved override survives restart; older saves default to automatic mode.
- The pack parser and content lint validate IDs, fields, forbidden words and expected pack counts. All new text still requires two independent human editorial approvals before release.
- `npm run check` passed with 82 tests, strict TypeScript, ESLint and content lint. Expo Doctor passed 21/21, and web/Android JavaScript exports succeeded. Browser preview showed the forced Eid badge on Home and its removal after returning Settings to automatic mode. Native season date/RTL behavior still needs device QA.

## Drawing content expansion — 2026-09-30

- Expanded the drawing prompt draft from 20 to its 200-item target across objects, animals, food, places and nature. Content lint verifies unique IDs and texts within the pack. Human editorial approval and native touch QA remain open.

## Taboo hard content expansion — 2026-09-30

- Expanded the hard abstract-word pool from 12 to its 100-item target. Each item has three distinct forbidden terms and passes schema validation. Human editorial review remains open.
- After both content expansions, `npm run check` passed (82 tests, strict TypeScript, ESLint and content lint) and web/Android JavaScript exports succeeded.

## Speed content expansion — 2026-09-30

- Expanded the quick challenge draft from 12 to its 60-item target with pointing and verbal prompts that can be played from the table. Content lint verifies the pack; human editorial review remains open.

## Likely, Know Me and Charades content expansion — 2026-09-30

- Expanded the three draft packs to their respective targets: Likely 120, Know Me 80 and Charades 120. Questions and scenes are locally authored, family-compatible drafts. The content parser checks each pack's unique IDs/texts and field lengths; two-person review is still required.
- `npm run check` passed (82 tests, strict TypeScript, ESLint and content lint), and Android/web JavaScript exports succeeded after the larger seed pack was bundled.

## Imposter and Undercover content expansion — 2026-09-30

- Expanded Imposter to eight 25-word categories (200 total) and Undercover to 80 paired-word items. Content lint validates both packs and the Imposter category count was asserted during draft generation. Editorial approval remains open.
- `npm run check` passed (82 tests, strict TypeScript, ESLint and content lint), and Android/web JavaScript exports succeeded with the expanded packs.

## Base content count target — 2026-09-30

- Expanded easy Taboo to 200/200 with three distinct forbidden words per item, five Cards decks to 40 each (200 total), and Truth or Dare to 30 truth and 30 dare prompts at each of four levels (240 total). This brings the base v1 content draft to 1400/1400 across all required packs.
- Count and schema validation is automated. All packs remain unapproved until two independent people review their exact hashes; v1.1 Proverbs remains at 16/120.
- `npm run check` passed with 82 tests, strict TypeScript, ESLint and content lint. Expo Doctor passed 21/21, and Android/web JavaScript exports succeeded. The explicit release content lint still fails as intended on unreviewed packs and the 104 missing Proverbs.

## Proverbs content count target — 2026-09-30

- Added 104 draft proverb halves and endings to reach 120/120. Automated checks validate unique first halves and required endings. Exact Egyptian wording and cultural fit are pending independent human review; count alone is not approval.
- Content lint now enforces the required distributions inside Imposter, Cards and Truth or Dare, as well as easy/hard Taboo separation. It catches a thin category or level even if a pack's total remains high enough.
- `npm audit --omit=dev --audit-level=moderate` reports 15 moderate transitive advisories, including query-string/decode-uri-component and Expo config tooling. The proposed `--force` remediation would install incompatible major Expo packages, so no forced dependency change was applied; reassess with SDK-compatible upstream fixes before store release.
- Final draft checkpoint: `npm run check` passed (82 Jest tests, strict TypeScript, ESLint and content lint), Expo Doctor passed 21/21, and web/Android JavaScript exports succeeded. Release content lint fails solely because no content group has the required two real reviewer approvals; every numerical target is now met.

## Independent editorial packet — 2026-09-30

- The release gate now checks the separate 20-card punishment list for two-person approval as well as all 28 game packs. A test verifies that editing a punishment invalidates its former approval.
- `npm run content:review-export` produced two independent UTF-8 CSV copies with 2000 rows each and 15 consistent columns, including pack IDs, exact hashes, prompt text and blank decision/note fields. The generated `review-packets/` directory stays local and out of Git. `npm run check` passed after this change; the release gate remains intentionally red until genuine approvals are recorded.
