# Code Review Study App — Cursor Build Prompt

## Context & Goal
Build a cross-platform interactive code review study app using **React Native + Expo (SDK 52)** targeting **Android first, Web second** (iOS config included but not the active build target). The core mechanic: users are shown a code snippet and tap whole lines to mark what they think are bugs, then submit. Feedback is revealed only after submission.

The app must be built in strict phases in the order below. **Do not move to the next phase until the current one is complete and confirmed working.** After completing all phases, generate a `RUNDOWN.md` in the project root.

---

## Tech Stack
- **Framework:** React Native + Expo SDK 52 with Expo Router v4 (file-based routing)
- **Language:** TypeScript (strict mode)
- **Navigation:** expo-router
- **Storage:** AsyncStorage (`@react-native-async-storage/async-storage`) for settings only
- **Font:** JetBrains Mono loaded via `expo-font` for all code display
- **Syntax highlighting:** `react-native-syntax-highlighter` for code snippets
- **Question bank:** Static JSON files bundled with the app — one file per language/difficulty combination (e.g. `python_easy.json`)
- **Hosting (web):** Static export compatible with Vercel/Netlify (`npx expo export --platform web`)
- **No backend, no auth, no paid services**

---

## Phase 1 — Project Scaffold & Configuration

1. Initialise a new Expo project: `npx create-expo-app CodeReviewApp --template blank-typescript`
2. Install all dependencies upfront:
   - `expo-router ~4.0.0`
   - `expo-font`
   - `expo-status-bar`
   - `expo-haptics`
   - `@react-native-async-storage/async-storage`
   - `react-native-syntax-highlighter`
   - `react-dom`, `react-native-web`, `@expo/metro-runtime` (for web support)
3. Configure `app.json`:
   - name: "Code Review"
   - scheme: "crapp"
   - userInterfaceStyle: "dark"
   - splash backgroundColor: `#0F172A`
   - android package: `com.codereview.app`
   - ios bundleIdentifier: `com.codereview.app`
   - plugins: `["expo-router"]`
   - experiments: `{ "typedRoutes": true }`
4. Configure `tsconfig.json` with `"extends": "expo/tsconfig.base"` and `"strict": true`
5. Configure `babel.config.js` with `babel-preset-expo`
6. Create the full directory structure:
   ```
   app/
     _layout.tsx
     index.tsx
     quiz.tsx
   src/
     types/index.ts
     utils/grader.ts
     utils/questions.ts
     context/SettingsContext.tsx
     components/CodeViewer.tsx
     components/ResultView.tsx
     hooks/useFonts.ts
     data/
       python_easy.json
       python_medium.json
       python_hard.json
       javascript_easy.json
       javascript_medium.json
       javascript_hard.json
       typescript_easy.json
       typescript_medium.json
       typescript_hard.json
       html_easy.json
       html_medium.json
       html_hard.json
       css_easy.json
       css_medium.json
       css_hard.json
   RUNDOWN.md
   ```
   All JSON files start as empty arrays `[]` for now.
7. Verify the project boots with `npx expo start` and the web export builds clean with `npx expo export --platform web` before proceeding.

---

## Phase 2 — Type System & Data Contracts

Define all TypeScript types in `src/types/index.ts`. Nothing else is built in this phase — just the contracts everything else will depend on.

```ts
export type Language = 'python' | 'javascript' | 'typescript' | 'html' | 'css';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type BugType = 'syntax' | 'logic' | 'style';

export interface Bug {
  lines: number[];        // 1-indexed line numbers that contain this bug
  explanation: string;    // plain-English explanation shown after submission
}

export interface Question {
  id: string;             // e.g. "py_easy_001"
  language: Language;
  difficulty: Difficulty;
  bug_type: BugType | BugType[];
  title: string;
  code: string;           // raw code string, newline-separated
  bugs: Bug[];            // empty array = no bugs in this snippet
}

// 'revealed' is only used on Give Up — shown in amber, not green
export type LineState =
  | 'idle'
  | 'selected'
  | 'correct'
  | 'missed'
  | 'false_positive'
  | 'revealed';

export interface GradeResult {
  passed: boolean;
  lineStates: Record<number, LineState>;
  usedGiveUp: boolean;
  // SCORING_PLACEHOLDER: score delta, streak increment, xp earned, time taken
}

export interface Settings {
  showBugCount: boolean;  // easy difficulty only — reveals bug count post-submit
}

// SCORING_PLACEHOLDER: UserStats interface goes here (totalSolved, streak, highScore, etc.)
```

---

## Phase 3 — App Shell & Navigation (No Logic Yet)

Build the visual skeleton of every screen with hardcoded/placeholder content. No real data, no grading logic. Goal: the full screen flow should be navigable end to end.

### `app/_layout.tsx`
- Wrap the Stack in a `SettingsProvider` (stub the provider as a passthrough for now)
- `headerShown: false` on all screens

### `app/index.tsx` — Home Screen
Layout only, no functionality yet:
- App title "Code Review" and tagline "Spot the bug. Level up."
- Language selector row: Python, JavaScript, TypeScript, HTML, CSS chips
  - Python is the only enabled one; others render as greyed out with "(soon)" label
- Difficulty selector row: Easy, Medium, Hard chips — all three enabled
- Settings card (only visible when Easy is selected): label "Show bug count after submit" + a Switch, hardcoded off
- Spacer pushing a "Start →" button to the bottom
- `// SCORING_PLACEHOLDER: stats summary (streak, total solved) above the Start button`

### `app/quiz.tsx` — Quiz Screen
Layout only:
- Header row: "← Back" left, "{Language} · {Difficulty}" right
- Instruction text: "Tap lines you think contain a bug"
- Code area (dark background, takes remaining vertical space): placeholder "Code will appear here" in monospace
- Action bar at the bottom with three buttons side by side:
  - "No Bugs Here" (secondary style)
  - "Give Up" (danger — amber border)
  - "Submit" (primary blue)

### Colour tokens to use throughout the entire app

| Token | Value |
|---|---|
| Background | `#0F172A` |
| Surface | `#1E293B` |
| Code background | `#111827` |
| Border | `#334155` |
| Text primary | `#F8FAFC` |
| Text muted | `#64748B` |
| Accent blue | `#3B82F6` |
| Selected line bg | `#1D3557` |
| Correct line bg | `#14532D` |
| Missed line bg | `#450A0A` |
| False positive bg | `#450A0A` |
| Revealed line bg | `#431407` |
| Indicator correct | `#4ADE80` |
| Indicator missed | `#F87171` |
| Indicator reveal | `#FB923C` |

Confirm all screens render without errors before proceeding.

---

## Phase 4 — Font Loading & CodeViewer Component

### `src/hooks/useFonts.ts`
Load JetBrains Mono (Regular and Bold weights) using `expo-font`. Export a `useFonts` hook that returns `{ fontsLoaded: boolean }`. Block rendering in `_layout.tsx` until fonts are ready using `SplashScreen.preventAutoHideAsync()`.

### `src/components/CodeViewer.tsx`
This is the core interactive component. Requirements:

**Props:**
```ts
interface Props {
  code: string;
  language: Language;
  selectedLines: Set<number>;
  lineStates: Record<number, LineState>;
  submitted: boolean;
  onToggleLine: (line: number) => void;
}
```

**Behaviour:**
- Render the code using `react-native-syntax-highlighter` for syntax colouring
- Use JetBrains Mono as the font for all code text
- Each line is individually tappable (wrap each rendered line in a `TouchableOpacity`)
- `submitted = false`: tapping toggles selection; selected lines get `#1D3557` background
- `submitted = true`: lines are non-interactive; background colour driven by `lineStates` using the colour tokens; correct/missed/false-positive/revealed lines show their indicator symbol (✓ / ✗ / →) at the right edge of the line
- Horizontal `ScrollView` for long lines
- Line numbers shown in muted colour, right-aligned in a fixed-width column, JetBrains Mono font
- Pass the `language` prop through to the syntax highlighter

Wire `CodeViewer` into the quiz screen's code area placeholder with dummy code.

---

## Phase 5 — Grading Logic & Settings

### `src/utils/grader.ts`
Two pure functions — no side effects, fully unit-testable:

**`grade(question: Question, selectedLines: number[], usedNoBugs: boolean): GradeResult`**
- `usedNoBugs = true`, no bugs in question → `passed: true`, empty `lineStates`
- `usedNoBugs = true`, bugs exist → `passed: false`, all bug lines marked `missed`
- Normal path: compare `selectedLines` against every line in every `question.bugs` entry:
  - Line is a bug line AND selected → `correct`
  - Line is a bug line AND not selected → `missed`
  - Line is selected AND not a bug line → `false_positive`
- `passed` is `true` only when no `missed` and no `false_positive` states exist

**`reveal(question: Question): GradeResult`**
- All bug lines → `revealed`
- `passed: false`, `usedGiveUp: true`

### `src/context/SettingsContext.tsx`
- Persist `Settings` via AsyncStorage (key: `@crapp_settings`)
- Expose `toggleBugCount()`
- Default: `{ showBugCount: false }`
- The toggle must only appear in the UI when difficulty is `easy`

### `src/utils/questions.ts`
- Import all 15 JSON data files
- `getQuestions(language, difficulty)` — filter combined pool
- `getRandomQuestion(language, difficulty, excludeId?)` — random pick, excluding last shown

---

## Phase 6 — Result View Component

### `src/components/ResultView.tsx`

**Props:**
```ts
interface Props {
  result: GradeResult;
  question: Question;
  showBugCount: boolean;
  onNext: () => void;
}
```

**Headline logic (dynamic text + colour):**
| Condition | Text | Colour |
|---|---|---|
| Give Up | "Answer revealed" | Amber `#FB923C` |
| Passed + has bugs | "✓  All bugs found." | Green `#4ADE80` |
| Passed + no bugs | "✓  Correct — no bugs." | Green `#4ADE80` |
| Failed + no bugs | "✗  This snippet had no bugs." | Red `#F87171` |
| Failed + missed N | "✗  Missed N bug(s)." | Red `#F87171` |
| Failed + missed N + FP M | "✗  Missed N bug(s), flagged M clean line(s)." | Red `#F87171` |

**Body:**
- If `showBugCount` is true: secondary line showing total bug count in the snippet
- Scrollable list of bug explanation cards (one per `Bug`), or a "No bugs" card if `bugs` is empty
- Each card: amber title showing bug number + affected lines, then explanation text
- "Next Question →" button in accent blue at the bottom

---

## Phase 7 — Wire Everything Together

Complete `app/quiz.tsx` with full state and logic:

**State:**
```ts
const [question, setQuestion] = useState<Question | null>(null);
const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
const [result, setResult] = useState<GradeResult | null>(null);
const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
```

**Handlers:**
- `loadNext(excludeId?)`: picks random unseen question, updates `seenIds`, resets `selectedLines` and `result`. When all questions seen, reset `seenIds` and start over.
- `toggleLine(line)`: no-op if submitted; otherwise add/remove from `selectedLines` + light haptic
- `handleSubmit()`: if empty selection show Alert; otherwise call `grade()`, set result, medium haptic
- `handleNoBugs()`: call `grade()` with `usedNoBugs: true`, set result, medium haptic
- `handleGiveUp()`: Alert "Give up?" with Cancel / Reveal — on confirm call `reveal()`, set result

**Layout (pre-submission):**
```
[header]
[instruction text]
[CodeViewer — flex:1]
[action bar: No Bugs Here | Give Up | Submit]
```

**Layout (post-submission):**
```
[header]
[CodeViewer — flex:2]
[ResultView — flex:3]
```

**Empty state:** if `getRandomQuestion` returns null, show "No questions available for this selection." with a back button.

**Android hardware back button:** if mid-attempt (result is null and selectedLines.size > 0), prompt "Leave this question?" before navigating away.

Complete `app/index.tsx` with real chip selection state, navigation to quiz with params, and settings toggle wired to SettingsContext.

**End-to-end test checklist before Phase 8:**
- [ ] Select Python / Easy → Start → tap lines → Submit → see feedback → Next Question
- [ ] "No Bugs Here" on a snippet with no bugs → correct
- [ ] "No Bugs Here" on a snippet with bugs → wrong, shows missed lines
- [ ] "Give Up" confirmation → amber reveal with explanation
- [ ] Bug count toggle visible on Easy, hidden on Medium and Hard
- [ ] Bug count shown post-submit when toggle is on, hidden when off

---

## Phase 8 — Question Bank (10 per language/difficulty = 150 questions)

Generate 10 questions for each of the 15 combinations and write them into the appropriate JSON file. The full target for v1 is 50 per combination (750 total) — these 10 are the seed set used to verify the app works before the bank is expanded.

### ID convention
`{lang}_{difficulty}_{3-digit-number}` — e.g. `py_easy_001`, `js_med_003`, `ts_hard_010`

### Snippet length by difficulty
| Difficulty | Line count | Max bugs per snippet |
|---|---|---|
| Easy | 4–10 lines | 1 |
| Medium | 10–20 lines | 2 |
| Hard | 20–35 lines | 3 |

### Bug count mix per difficulty
| Difficulty | 0 bugs | 1 bug | 2 bugs | 3 bugs |
|---|---|---|---|---|
| Easy | ~20% | ~80% | — | — |
| Medium | ~20% | ~50% | ~30% | — |
| Hard | ~10% | ~40% | ~30% | ~20% |

### Bug type mix
Roughly equal spread of `syntax`, `logic`, and `style` within each file.

### Per-language focus areas

**Python**
Off-by-one in range/index, mutable default arguments, `== None` vs `is None`, wrong range start, missing return value, undefined variable (typo), incorrect string escape sequences, wrong boolean operator (`and`/`or`), incorrect initial value for accumulator, wrong indentation creating unreachable code

**JavaScript**
`==` vs `===`, `var` hoisting causing unexpected behaviour, missing `break` in switch statement, off-by-one in for loop, wrong array method (`splice` vs `slice`, `push` vs `concat`), `this` context loss in callbacks, forgotten `await`, `let` vs `const` with reassignment, falsy value bugs (`0`, `""`, `null` treated as false)

**TypeScript**
Incorrect type assertion (`as any` bypassing safety), missing null/undefined check before property access, wrong interface property type, incorrect generic constraint, type widening (assigning `string` to a `number` field), non-null assertion (`!`) used where value can actually be null, incorrect return type annotation

**HTML**
Unclosed tags, wrong attribute values (invalid `type` on input), missing required attributes (`alt` on img, `for`/`id` mismatch on label), incorrect element nesting (block inside inline), wrong HTML entity, duplicate `id` attributes, deprecated attributes used instead of CSS

**CSS**
Property name typo, `z-index` without `position` set, wrong box model (`padding` vs `margin`), `display: inline` on element that needs block, selector specificity causing rule to be ignored, missing unit on non-zero value, `color` vs `background-color` confusion, incorrect `flex` shorthand values

### Quality rules
- Every bug must be visible on the flagged line(s) without needing to understand the full program
- Explanations must cover: what the bug is, why it is wrong, and what the fix is (1–3 sentences)
- No bug requires domain knowledge beyond the language itself
- Multiple bugs in one snippet must be on different lines
- No two questions in the same file should test the same bug pattern

After writing all 150 questions, run `npx expo export --platform web` — it must pass clean.

---

## Phase 9 — Polish & Platform Verification

1. **Haptic feedback:** Light haptic on line tap (`expo-haptics` `impactAsync(Light)`); medium haptic on result reveal (`impactAsync(Medium)`)
2. **Seen-question cycling:** Once all questions in the current pool are seen, reset the seen Set and start over — never crash or freeze
3. **Scroll independence:** `ResultView` explanation cards must scroll independently of the code area on small screens (≤ 5 inch)
4. **Android back button:** Hardware back during an active attempt (lines selected, not yet submitted) shows "Leave this question?" confirmation
5. **Web layout:** On viewports wider than 480px, cap content width at 480px and centre it so it doesn't stretch on tablet/desktop
6. **Accessibility:** Add `accessibilityLabel` to every `TouchableOpacity` and interactive element; ensure symbols (✓ / ✗ / →) carry the same meaning as colour so the UI is usable without colour vision
7. **Final build check:** `npx expo export --platform web` passes; open in a browser and manually complete at least one question per language

---

## Phase 10 — RUNDOWN.md

Generate `RUNDOWN.md` in the project root with the following sections:

### ✅ What's been built
List every implemented feature with a one-line description.

### 🚧 Known limitations
- Question bank is seeded with 10 per language/difficulty (150 total); v1 target is 50 per = 750 total
- JavaScript, TypeScript, HTML, and CSS are greyed out in the UI until their full question banks are complete
- iOS is configured but not actively tested — requires a Mac or EAS cloud build
- No user accounts or cross-device progress sync

### 🔜 Next steps (prioritised)
1. Fill question bank to 50 per language/difficulty (750 total) — add to JSON files, no code changes needed
2. Unlock remaining languages in the selector once their banks reach 50 questions (remove `enabled: false` flag in `app/index.tsx`)
3. Scoring system — score per question, session total, streak counter (all `SCORING_PLACEHOLDER` comments mark exactly where this slots in)
4. User stats screen — personal bests, total solved, streak history
5. Filter by bug type (syntax only, logic only, style only)
6. Dark/light theme toggle
7. iOS build via EAS (`eas build --platform ios`)
8. Submit app to Google Play Store

### 🏗️ Architecture notes
**Adding a new language:**
1. Create `src/data/{lang}_{difficulty}.json` for each difficulty
2. Import in `src/utils/questions.ts` and add to `ALL_QUESTIONS`
3. Add to the `Language` type in `src/types/index.ts`
4. Add to the `LANGUAGES` array in `app/index.tsx` with `enabled: true`

**Adding a new difficulty:**
1. Add to the `Difficulty` type in `src/types/index.ts`
2. Add to the `DIFFICULTIES` array in `app/index.tsx`
3. Create the corresponding JSON files for each language

**Adding questions:**
Append question objects to the relevant JSON file following the schema in `src/types/index.ts`. No code changes required — questions are loaded dynamically from the combined pool.

**Question JSON schema reference:**
```json
{
  "id": "py_easy_001",
  "language": "python",
  "difficulty": "easy",
  "bug_type": "logic",
  "title": "Short descriptive title",
  "code": "line 1\nline 2\nline 3",
  "bugs": [
    {
      "lines": [2],
      "explanation": "What the bug is, why it is wrong, and what the fix is."
    }
  ]
}
```
For no-bug snippets: `"bugs": []`
For multi-bug snippets: add multiple objects to the `bugs` array, each with their own `lines` and `explanation`.
