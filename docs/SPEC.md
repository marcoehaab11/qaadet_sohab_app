# قعدة صحاب (Qa'det Sohab): consolidated build spec v2

This single spec replaces every earlier prompt for this project. If earlier prompts were already run, reconcile the existing code to this spec instead of duplicating work, and log every reconciliation in DECISIONS.md.

You are a senior React Native engineer. Build an offline-first party-games app for Egyptian friend groups. One phone is passed around the group (pass-and-play). The app is the host of the hangout: it picks games, calls each player by name, runs timers, and keeps score.

Reference prototype: `prototype/qaadet-sohab-demo.html` (v1.2). It implements every feature below, including ones scheduled for later releases. Use it as the source of truth for flows, copy tone, and seed content. Port behavior, not code structure. Where this spec and the prototype differ, this spec wins.

Save this file as `docs/SPEC.md` in the repo.

## 0. How to work
- Build in release order: v1 (M1 to M6) is the launch; v1.1 (M7 to M9) ships after; section 11 ("Later") is design notes only, never code.
- Gate unreleased features behind one release-flag module (`src/config/release.ts`) so v1 builds contain no v1.1 games or screens, while the engine is designed for them.
- After each milestone: typecheck, lint, tests; fix; commit as "M<n>: <summary>".
- Log every non-obvious decision or deviation in DECISIONS.md. When the spec is ambiguous, choose the simplest option consistent with the prototype.
- Never guess a library API: read the installed package's docs and types.
- No network calls, no backend, no accounts, no analytics, no ads.
- Never use the word "Taboo" in UI or store copy; that game is "ممنوع تقول".

## 1. Tech stack
- Expo (latest stable SDK), React Native, TypeScript strict, expo-router
- Zustand for app state; a pure, framework-free engine in `src/engine`
- react-native-reanimated, expo-haptics, expo-keep-awake (screen on during sessions)
- @react-native-async-storage/async-storage, zod
- Fonts: Cairo (body) and Lalezar (display) via @expo-google-fonts
- v1 adds expo-store-review. v1.1 adds react-native-view-shot, expo-sharing, and a drawing library for the draw game (@shopify/react-native-skia, or react-native-svg with gesture handler if Skia blocks Expo Go testing; log the choice)
- Jest, ESLint, Prettier

## 2. Language, layout, accessibility
- Egyptian Arabic only in v1. All copy lives in `src/i18n/ar-EG.ts`: no hardcoded strings, and no string concatenation that assumes Egyptian grammar (dialect packs come later).
- Force RTL on both platforms per the Expo localization/RTL guidance for the installed SDK; verify rows, icons, arrows and progress. Use start/end, never left/right.
- Signed numbers (+1, -1) render in an LTR-isolated Text inside RTL text.
- English game names stay English: Imposter, Memory Battle, Truth or Dare.
- Minimum tap target 48dp; buzzers at least 80dp tall; respect reduce-motion; support 360dp phones; center content at about 480dp max on tablets.
- accessibilityLabel on icon buttons; OS dynamic type up to 1.3x without broken layouts; never rely on color alone.
- Setting "خط كبير": scales typography about 1.15x on top of OS dynamic type (verify at the combined maximum).
- Setting "ألوان واضحة": player colors switch to the Okabe-Ito palette; teams become orange ▲ and sky-blue ■; yes/no buttons become blue/orange and keep ✓/✗; correct/wrong states use icon plus outline style. Verify WCAG AA contrast.

## 3. Architecture and data
Folders:
- `src/app/` screens: onboarding, home (table), players, settings, custom (أسئلة الشلة), host, game/[id], tiebreak, results, stats, soon
- `src/engine/` session queue, turn orders, scoring and undo log, stats counters, anti-repeat draw, seedable RNG, one pure reducer per game
- `src/games/<id>/` game UIs, consuming their reducer only
- `src/content/` JSON packs, zod schemas, loader, content:lint
- `src/components/` PassPhoneScreen, HoldToReveal, CountdownTimer, PlayerGrid, PromptCard, Scoreboard, Podium, Confetti, Toast, ToolRow, HelpSheet
- `src/store/`, `src/theme/`, `src/i18n/`, `src/config/release.ts`, `src/entitlements/`

Rules:
- Players are identified by stable IDs everywhere (turn orders, logs, stats, teams), never by array index.
- Reducers are pure and deterministic given a seedable RNG; state and actions are JSON-serializable (this is what makes online play possible later).
- Game rules live only in the engine; UI never scores or rotates turns.
- Persistence: AsyncStorage key `qaadet-sohab:v1` with a versioned schema and a migration function.
  - Persist: players (name, emoji, color, team), settings, per-game config, custom decks, completed-session count, last setup, onboarding flag, and review-asked flag.
  - Persist in v1.1: history and play counts.
  - Never persist scores or the away flag.
- Content packs: `{ id, version, locale: 'ar-EG', game, tier: 'free' | 'premium', items: [{ id, text, ...gameFields, level?, tags?, source? }] }`.
- An entitlements module answers "is this pack available?". In v1 everything is free and available.

## 4. Core systems (v1)
Players
- 2 to 8 players: name (max 14 chars), emoji avatar (tap to cycle), color. Defaults to 4 placeholder players.
- Sit-out ("مش موجود دلوقتي", 💤): a session-only flag.
  - Away players are skipped in every turn order (re-checked on each advance).
  - They are excluded from voting grids, buzzers, role assignment and tie-breaks.
  - They keep their score and show 💤 on scoreboards.
  - At least 2 players stay active, and every minPlayers check uses the active count.
- Late joiner: adding a player while a session is live (and any score is non-zero) starts them at the rounded mean of the active players' scores, with a toast explaining it.
- The players screen opens from home, the host screen, and the in-game tool row. Opening it mid-game pauses the timer and returns to the same game step. Deleting players is blocked while a game is running.

Session and host
- Home ("the table"), top to bottom:
  - Header: logo, ✍️ custom, 📊 stats (v1.1), ⚙️ settings.
  - Mode badges (family, teams, season).
  - A resume button when a session is live; otherwise "🔁 نفس القعدة اللي فاتت: <vibe> · <length>".
  - Player chip, vibe picker (ضحك، تحدي، خداع، أصحاب، Random), and length toggle (قعدة سريعة = 3 games, القعدة مولعة = 5).
  - Start button.
  - Every enabled game as a card on a wooden table with a felt surface, dealt with slight random rotation. Cards needing more active players are greyed with "من N لاعبين".
- Queue: filter enabled games by minPlayers (active), shuffle the vibe pool, fill from all enabled games when it is short, take N. "خداع" starts with Imposter when eligible.
  - laugh: charades, voice, likely, cards, tod, draw
  - compete: memory, speed, taboo, trivia, proverb
  - deceive: imposter, knowme, likely, taboo
  - friends: knowme, cards, likely, tod, proverb
  - random: all enabled
- Host screen between games shows:
  - queue progress dots and the "اللعبة الجاية" card (emoji, name, rules line);
  - "مرّروا الموبايل", start, and "عدّي اللعبة دي";
  - the scoreboard from game 2 on, and a tool row (undo, players).
- Results: podium (top 3), scoreboard, confetti, "قعدة جديدة". Ties at the top show co-stars in v1 ("نجوم القعدة"); v1.1 adds the tie-break.
- Standalone: tapping a table card plays one game outside any session and never advances a session.

Shared game UI
- In-game top bar: exit (to home, session stays resumable), title, session progress.
- Under it, a tool row:
  - "؟ إزاي نلعب": 3 rule lines per game in a sheet; pauses the timer.
  - "↩️ رجّع آخر نقطة".
  - "👥 اللاعبين".
  - "⏭ خلّص اللعبة".
- PassPhoneScreen: avatar, "مرّر الموبايل لـ", name, instruction, confirm. Turn-based games add "مش موجود؟ عدّي دوره" to skip that turn. Secret info appears only after the named player confirms.
- HoldToReveal (setting, default on)
  - Covers the imposter word or role, the charades prompt, and the draw word; shown only while pressed.
  - Hides on release, cancel, or app background; no long-press callouts.
  - Accessible press-and-hold with an Arabic hint.
- CountdownTimer
  - Based on end timestamps, with a pause/resume control under every timer except the 3-2-1 intro, memory look time, and voice recording.
  - Auto-pauses on app background (AppState) and when the help sheet opens.
  - Tick sound on the last 3 seconds; haptic and sound at zero; sound toggle in settings.
- Scoring
  - Every score change (individual, team, bulk, events) goes through one addPoints(changes, statChanges), which also appends to a per-session undo log (cap 60).
  - Undo pops the last entry and reverts scores and linked stat counters, never game flow. An empty log shows "مفيش نقط نرجّعها".
  - Toast "🦊 أحمد +1" plus a haptic on every award.
- Stats counters (recorded from v1, shown in v1.1): act, guess, fox, busted, brave, chicken, gossip, flash, mem, tongue, oops, nerd, artist, elder.
- Anti-repeat: never repeat a content item until its pool is exhausted. Used IDs persist per pack across sessions, and a pack resets once exhausted.

Onboarding, settings, custom decks, store review
- Onboarding (first launch only, persisted flag), 3 screens:
  1. Concept: one phone, the app is the host, offline, no sign-in.
  2. Add players (inline editor).
  3. Pick vibe and length, then start.
  Every screen is skippable; replayable from settings.
- Settings in v1: sound, hold-to-reveal, family mode, large text, clear colors, per-game time and rounds (section 5), replay onboarding, and the "قريبًا" screen. v1.1 adds teams, surprises, difficulty, and season pack.
- Family mode: hides Truth or Dare Bold and Chaos and the couples deck. Falls back to Chill or Friends when the current selection is hidden. Shows a home badge.
- Custom decks ("أسئلة الشلة"), stored on device only:
  - Targets: likely, truth, dare, charades, imposter words, cards (with type), taboo (word plus exactly 3 forbidden, split on "," or "،"), and draw words (v1.1).
  - Validation: non-empty, max 90 chars, no duplicates, inline errors.
  - Merging: likely, charades, taboo and draw go into their pools; truth and dare go into every Truth or Dare level.
  - Imposter words become the category "🫶 كلمات الشلة" at 3+; cards become the deck "🫶 الشلة" at 1+.
- Store review
  - When a session ends and completed sessions reach 3, request the native review dialog through expo-store-review, if the platform reports it available.
  - At most once per app version, and never mid-game.
  - No custom pre-prompt and no filtering by sentiment (no review gating).
- "قريبًا" screen: online play, other dialects, extra packs, each clearly labeled coming soon; nothing looks tappable or purchasable.

## 5. Per-game config (defaults in parentheses)
- imposter: discussion 60/120/180s (120)
- cards: cards 5/8/12 (8); dare timer 15/20/30s (20)
- likely: questions 3/5/8 (3)
- taboo: turn time 30/60/90s (30); turns per player 1/2/3 (1)
- tod: turns per player 1/2/3 (1)
- charades: act time 30/60/90s (60); turns 3/5/8 (5)
- speed: challenges 3/5/8 (5)
- knowme: subjects 2/3/5 (3)
- v1.1 memory: look time 3/5/8s (5); turns per player 1/2/3 (1)
- v1.1 draw: draw time 30/60/90s (60); turns 3/4/6 (4)
- v1.1 proverb: proverbs 4/6/10 (6)
- later voice: turns 2/4/6 (4); later trivia: answer time 10/15/20s (15), questions per player 1/2/3 (2)

## 6. v1 games (8)
Every game is a pure reducer; test every scoring rule.
1. imposter "Imposter" (min 3)
   - Setup:
     - Mode: classic, or undercover ("كلمة قريبة").
     - Imposter count: 1, or 2 when 6+ players are active.
     - Category picker in classic mode (random by default; includes the season pack and "🫶 كلمات الشلة" when present).
   - Roles go to active players only; each sees theirs through HoldToReveal.
     - Classic: non-imposters see word and category. The imposter sees "انت الـImposter!" and the category, plus "ومعاك Imposter تاني" when there are 2.
     - Undercover: everyone sees "كلمتك". Imposters silently get the other word of a similar pair, and nobody is told who.
   - Discussion timer with a random starter (skippable). Then the group selects exactly as many suspects as there are imposters.
   - Scoring:
     - Every active non-imposter gets +1 per caught imposter (one undo entry).
     - Each escaped imposter gets +2 (fox).
     - Caught imposters get busted, then one joint guess at the group word from 4 options (+1 each if correct).
   - The result reveals the imposters, the group word, and in undercover mode the imposter word. "جولة كمان" is available.
2. cards "كوتشينة بس مختلفة" (min 2)
   - Decks: أصحاب، كابلز (hidden in family mode)، مجانين، عميقة، ضحك، plus "🫶 الشلة".
   - Card types: tell 🟥 احكي, pick 🟦 اختار, dare 🟨 تحدي (optional timer), who 🟩 مين؟, secret 🖤 سر.
   - Face-down card, tap to flip. Done gets +1 (brave); skip gets 0 (chicken). Turns rotate over active players.
3. likely "مين غالبًا؟" (min 3): active players vote secretly in turn (voting for yourself is allowed); animated bars. Every voter who picked a top-voted player gets +1 (one undo entry); top-voted players get gossip.
4. taboo "ممنوع تقول" (min 2): the describer sees the word and 3 struck-through forbidden words. Guessed: +1 (tongue). Forbidden word said: -1 (oops). Skip is free. Easy pool only in v1; the hard pool and teams come in v1.1.
5. tod "Truth or Dare" (min 2): levels Chill 😇, Funny 😂, Bold 🔥, Chaos 💀. The player picks truth or dare. Done: +1 (brave). "عدّي": 0 (chicken), always available.
6. charades "تمثيل" (min 2): the actor sees the situation through HoldToReveal; then the timer starts and the prompt hides. Tapping the first guesser gives the actor +1 (act) and the guesser +1 (guess).
7. speed "أسرع واحد" (min 2)
   - 3-2-1, then the challenge, then one big buzzer per active player (name, emoji, color).
   - The first tap locks. The host confirms yes (+1, flash) or no (that player sits out the challenge).
   - "محدش لقاها" skips the challenge.
8. knowme "مين يعرفني أكتر؟" (min 2): the subject types an answer privately (optional); others guess out loud; reveal; the subject multi-selects who got it (+1 each, guess).

## 7. v1.1 (M7 to M9)
- Teams mode (4+ active players)
  - Two balanced random teams, "فريق الكشري 🔴" and "فريق الفول 🔵", with a reshuffle button and auto-rebalance.
  - Only three games change:
    - taboo: describers alternate between teams, and only their own team guesses.
    - charades: "فريقنا خمّنها".
    - speed: two team buzzers.
  - Team points go to every member's individual score. Those game cards show a "فرق" badge.
- Difficulty: memory uses 6/9/12 emojis; taboo has easy, hard (abstract words), and mix.
- memory "Memory Battle" (min 2): emojis shown for the look time, then either "كان فين الـX؟" (tap the position) or "إيه الرمز اللي اختفى؟" (4 options). +1 (mem); always reveal the answer.
- draw "ارسم وخمّن" (min 2)
  - The drawer sees the word through HoldToReveal.
  - Canvas with timer, 4 colors, eraser and clear. The word is never visible while drawing.
  - Tapping the guesser gives the drawer +1 (artist) and the guesser +1 (guess).
- proverb "كمّل المثل" (min 2): the first half is shown and players race to finish it out loud. "اكشف الباقي" highlights the ending. Tap who said it first (+1, elder) or "محدش عرفها".
- Awards on the results screen: up to 6 titles with value > 0, sorted by value; ties show 2 names.
  - act نجم التمثيل · guess بيفهمها وهي طايرة · fox الثعلب · busted أكتر واحد اتفضح · brave الجريء
  - chicken عدّاي القعدة · gossip حديث القعدة · flash البرق · mem الذاكرة الحديد · tongue اللسان الدهب
  - oops بيقول الممنوع · nerd الموسوعة · artist الفنان · elder حافظ الأمثال
- Loser punishment: a light punishment card for the lowest scorer (random among ties); "عقاب تاني" redraws.
- Surprises (setting)
  - Each host screen after the first has a 45% chance of an event; 5-game sessions get at least one.
  - double: the next game's points count x2, negative points too, with a ×2 pill.
  - steal: last place takes 1 point from first, only if first is ahead; otherwise it becomes gift.
  - gift: last place gets +1.
  - Apply once per host screen, even on re-render or resume, and go through addPoints so undo works.
- Tie-break ("جولة حسم")
  - Runs when the last game ends and 2+ active players share first place: a speed challenge with buzzers for the tied players only.
  - The host confirms each claim. A wrong claim puts that player out for that challenge; if all are out, start a new challenge.
  - "خلّوها تعادل" ends with co-stars. Save history only after it resolves.
- Result card
  - A 1080x1920 image rendered from a React view (react-native-view-shot) and shared through expo-sharing.
  - Contents: logo, date (Latin digits), podium with avatars, names and points, up to 5 awards, "#قعدة_صحاب".
  - Also "ابعت النتيجة على واتساب" as text through Linking to https://wa.me/?text=..., handling a missing WhatsApp.
- History and stats
  - Save {date, winner, game ids, players with scores} per finished session (keep the last 40), plus play counts per game.
  - Stats screen: totals, longest win streak, all-time wins, top 5 games, last 8 sessions, and "clear history" with confirmation.
- Season packs (العيد، الساحل، الامتحانات) with a manual override in settings and an active-pack badge on home. Auto-detection rules are in section 8.

## 8. Content
- Seed every pack from the prototype's CONTENT object.
- v1 targets (1,400 items):
  - taboo 300 (200 easy, 100 hard)
  - Truth or Dare 240 (4 levels x 30 truth + 30 dare)
  - cards 200 (5 decks x 40)
  - imposter words 200 (8 categories x 25)
  - likely 120 and charades 120
  - undercover pairs 80 and knowme 80
  - speed 60
- Ramadan pack ships with v1, because the launch lands before Ramadan: 20 imposter words, 15 likely, 15 charades, 15 taboo.
- Season auto-detection (built with the Ramadan pack in M6):
  - Ramadan = Hijri month 9.
  - Eid = Shawwal 1 to 4, or Dhu al-Hijjah 9 to 13.
  - Sahel = July and August.
  - Exams = January, May, and June.
  - Religious seasons take priority.
  - Use Intl with calendar 'islamic-umalqura' only if the runtime resolves it (verified at runtime); otherwise use a small maintained Hijri library.
- Other seasons ship in v1.1 with the same counts per season.
- v1.1 content:
  - proverbs 120: traditional folk sayings in their common wording, nothing insulting.
  - draw words 200.
  - punishments 20.
- Later content:
  - trivia 150: stable, verifiable facts only, with a `source` field on every item; no officeholders, prices, or records.
  - voice phrases 80.
- Safety rules for every pack:
  - No sexual content, alcohol, or drugs.
  - No dares involving danger, self-harm, property damage, contacting strangers, spending money, or posting without the player's approval.
  - No jokes targeting religion, ethnicity, body, gender, or regional origin.
  - Chaos means absurd, never mean. Every prompt is skippable.
- Writing: short, natural Egyptian Arabic, max 90 characters. Two people review every pack.
- `content:lint`: schema, duplicates, length, banned-words list, and a count vs target report.

## 9. Visual design
- Dark "night hangout" theme.
- Home is a top-down table: wooden rim, green felt, game cards dealt in with slight rotation and a staggered animation.
- Chunky buttons with a solid bottom shadow and press-down feedback.
- Lalezar for display, Cairo for body. Match the prototype's colors and motion.

## 10. Milestones
v1 (launch)
- M1 Foundation
  - Build: project, theme, fonts, RTL, i18n, release flags, stable IDs, persistence with migrations, seedable RNG, entitlements stub.
  - Build: content loader, schemas and lint; CountdownTimer (pause), PassPhoneScreen, HoldToReveal; addPoints with undo log, stats counters, Scoreboard, Toast.
  - Tests: anti-repeat, undo (individual and bulk), pause math, turn orders skipping away players.
- M2 Screens
  - Build: onboarding, home table, players (sit-out, late joiner), settings (v1 set), host, results (co-stars), tool row, help sheet, replay last setup, "قريبًا" screen.
  - Tests: queue building per vibe and player count, late-joiner mean, onboarding flag.
- M3 Games A: cards, likely, tod, knowme, with reducers and tests.
- M4 Games B: imposter (classic, undercover, 2 imposters), taboo, charades, speed, with reducers and tests.
- M5 Launch features
  - Build: custom decks, family mode, large text and clear colors, store review trigger.
  - Store prep: privacy text (no accounts, no tracking), README, store checklist, placeholder icon and splash.
  - Tests: custom validation and merging, family filtering, review fires exactly once at the 3rd completed session.
- M6 Content and QA: content to v1 targets, Ramadan pack with auto-detection, content:lint passing, full QA on Android and iOS (development build).

v1.1
- M7 Teams mode, difficulty, memory, draw, proverb. Tests: team turn order and scoring.
- M8 Awards, punishment, surprises, tie-break, result card and sharing, history and stats. Tests: award ties, event idempotency, x2 including negative points, every tie-break path.
- M9 Other season packs, the season setting, and content for the v1.1 games.

## 11. Later (design notes only, in docs/later.md; do not build)
- Voice game "الصوت المشوه":
  - Record up to 4s, then play back fast (about 1.7), slow (about 0.6), or reversed; keep reversed behind a flag until it works on Android.
  - Recordings stay on device and are deleted each round; a no-mic fallback works as in the prototype.
- Trivia "Trivia مصري": turn-based, 4 options, countdown; sourced facts only.
- Host voice: expo-speech reads "اللعبة الجاية" and "الدور على <name>". Prefer an ar-EG voice; warn when none exists.
- Online mode:
  - Room code; each player on their own phone; the host device is authoritative; secrets are delivered per player.
  - Compare a managed realtime backend with a small WebSocket server on reconnects, privacy, moderation, and cost.
- Dialects: Gulf and Levantine packs written by native speakers, a dialect picker, and per-dialect lint.
- Premium packs: the free core stays free. Themed packs via native in-app purchases (evaluate RevenueCat or react-native-iap against the installed SDK), with restore purchases; never ads during games.