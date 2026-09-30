# Decisions

## 2026-09-30 — first working foundation

- User requested starting the app, not publishing a finished release. This iteration implements the M1 foundations and a reviewable home/players/settings shell. Gameplay is explicitly not yet implemented. M2–M6 remain open.
- The supplied prompt is saved unchanged in docs/SPEC.md; the original HTML is preserved unchanged in prototype/qaadet-sohab-demo.html. It is reference material, not application runtime code.
- npm's stable Expo package at initialization was 57.0.26. Used the official blank TypeScript template and installed native dependencies through `expo install`. Router uses `src/app`.
- Forced RTL through the installed SDK 57 localization plugin (`supportsRTL`, `forcesRTL`, supported `ar-EG`), plus web document configuration. Native RTL still needs device verification.
- Font assets ship locally in the bundle via the Google Fonts packages; no Google Fonts HTTP calls at runtime. The original prototype's remote fonts are not carried into the app.
- Pure engine functions receive timestamps or seeds explicitly. They do not read the clock or generate random values internally. Stable UUIDs are generated at the application boundary.
- Persistence uses a strict versioned Zod schema and serialized writes. Unknown/corrupt saved data is preserved and saving is blocked for that launch, with an Arabic notice. Scores, stats, undo and away flags are not persisted. Used item IDs are persisted as required by the anti-repeat rule.
- There is no shipped legacy schema to migrate. The migration dispatcher currently validates v1 and rejects future/unknown versions. Add explicit migration branches with future schema versions.
- Introduced `expo-audio` solely for bundled tick/end sounds. Microphone permission and background audio capabilities are disabled. The later voice game is not implemented.
- Parsed CONTENT with the TypeScript AST and accepted literal data only; no supplied JavaScript was executed by the importer. Imported 236 v1 seed items; deferred games and seasonal packs are not bundled yet. Several prototype prompts requesting media disclosure, outside contact, posting, or physical exertion were replaced with local alternatives in the importer.
- Content lint validates schema, IDs, repeated text, forbidden-word shape and a preliminary banned list. Counts are reported without claiming launch completion; `--release` fails below target. Two-person editorial review is still required.
- Spec assumes a pre-Ramadan launch; that schedule is not inferred from today's date. Ramadan content remains an M6 requirement, with launch timing to be set later.
- Store identifiers, signing, EAS account linkage and artwork remain unset/placeholders until the application is ready for its store-preparation milestone. No cloud build or store submission has been performed.
- Home game cards currently open rules previews. There is no nonfunctional Start button. This is a foundation preview, not a playable v1. Screens from later releases are not imported or registered.

## 2026-09-30 — session flow and first playable game

- Added three-step onboarding, host queue, pass-phone flow, final scoreboard, player attendance, late join, game configuration controls, and a first playable cards game. Cards can launch standalone or from a queued session.
- Seven remaining games have rules previews; their Start controls stay disabled. A mixed queue can be advanced past those games, so this is a reviewable development slice and not a complete v1 session.
- Card turns are deterministic from a seed. A card draw persists its used ID; points and per-session stats remain in memory. Marking someone away skips their next turn without consuming a card; a late joiner enters the remaining turn order.
- The original demo and spec are preserved as references. New UI follows the app architecture, rather than embedding the demo HTML.
- Session state is intentionally ephemeral for now. Closing the app discards the active game and scores, while saved player names, settings, used card IDs, and completed-session count remain on device.

## 2026-09-30 — M3 gameplay continuation

- Added Truth or Dare with four levels, private phone passing, truth/dare choice, done/skip scoring, and family filtering. The source seed has four prompts per type and level; this is enough for a flow preview, not launch content volume.
- Added مين غالبًا with private per-player voting, self-votes, tied winners, one undo entry for a question's scoring, and animated result bars. Its seed has twelve questions, below the launch target.
- Both games can launch standalone or inside the host queue. Five game screens remain unimplemented; their home and host controls are previews/disabled.
- Added مين يعرفني أكتر with an optional private answer, hidden answer during spoken guesses, reveal, and multi-select correct guessers. The answer is held only in the in-memory game state and cleared after each turn.

## 2026-09-30 — M4 Taboo preview

- Added ممنوع تقول with secret word reveal, three visible forbidden words during play, a configurable turn timer, +1 for guessed, -1 for a forbidden word, and free word skipping.
- Timer feedback uses bundled sounds and haptics. The native timer still needs device checks, especially after app backgrounding and screen navigation; player editing is disabled while a timed turn runs to avoid resetting that component by navigation.
- Added تمثيل with a private scene that disappears once the timer starts, first-guesser selection, and a single scoring action for the actor and guesser. It uses the same in-memory timer limitations until native device QA.
- Added أسرع واحد with a three-second countdown, one large colored buzzer per active player, first-tap lock, host confirmation, temporary exclusion after a wrong answer, and +1 for a correct answer.
- Added Imposter classic and undercover with private role reveals, one or two imposters where eligible, category selection, discussion timer, exact-count suspect vote, escape/caught scoring, joint word guess, and another round. The mode is a local single-phone game; secret visibility and TalkBack behavior need native device QA.

## 2026-09-30 — M6 Ramadan pack

- Added the 65-item Ramadan pack separately from the prototype seed, so re-importing the original demo does not overwrite new content. Items are drafts until two human reviewers approve the pack hashes.
- Season detection first checks whether the runtime truly resolves `islamic-umalqura` in `Intl`; if not, it uses the local, zero-dependency `@tabby_ai/hijri-converter` table. The converter supports a bounded date range and returns no religious season outside it. No network calendar request is made.
- Detection knows Eid, Sahel, and Exams, but only Ramadan activates a pack now. The remaining seasons and manual override belong to M9. For local religious observance, a manual choice will be preferable to calculated dates when M9 lands.

## 2026-09-30 — M7 proverb preview

- Began v1.1 gameplay while the independent M6 editorial and device QA gates remain open. `release.version` is `1.1-preview`; it does not set the native store version.
- Added a 16-item draft proverb pack, pure reducer, standalone and session route. The first correct player receives +1 and one `elder` stat; an unanswered proverb gives no points. Draws use the shared persisted anti-repeat pool.
- The proverb pack is short of its 120-item target and has no two-person approval. This implementation is a development preview, not a release claim.

## 2026-09-30 — M7 memory preview

- Memory Battle generates its emoji board, target and answer options from the session seed, alternating position and missing-symbol questions. It has configurable 6/9/12 symbols, 3/5/8 second look time, and 1/2/3 turns per player.
- The board disappears when the look timer ends; every answer reveals the full board. The correct active player receives +1 and one `mem` stat. No content pack or network request is needed.

## 2026-09-30 — M7 ممنوع تقول difficulty preview

- Added easy, hard and mixed word pools. Hard words are abstract concepts in a separate draft pack; the easy pool includes the existing base and custom words. Settings store the choice as 0/1/2 under the existing numeric game config schema.
- The content report now splits the original 300-word target into 200 easy and 100 hard. Current counts are 18 and 12. The hard pack remains unreviewed, and the seasonal words remain available in easy/mixed mode during their season.

## 2026-09-30 — M7 teams preview

- Added a saved teams toggle and reshuffle control. Four or more active players form two balanced random teams; the three team games are ممنوع تقول, تمثيل and أسرع واحد. Team mode is inactive below four active players.
- ممنوع تقول interleaves actors from the two teams. تمثيل accepts a guess only from the actor's team. أسرع واحد shows two buzzers and excludes the whole team after a wrong claim. Individual score changes from those games expand to all active teammates; stats remain with the acting player. In تمثيل, actor and guesser each earn a point, so every teammate receives two points on a correct guess.
- Adding/removing a player reassigns teams for balance. A physical-device session should check team labels and rebalance behavior when participants sit out or rejoin before release.
