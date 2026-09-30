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
