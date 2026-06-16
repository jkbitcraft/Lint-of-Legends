# CodeReview App — v1 Plan

## Overview

A gamified code review learning app. Users read short code snippets, tap lines they
think contain bugs (or say "No Bugs Here"), and get instant feedback with explanations.
Mobile-first (Expo / React Native). Web via `expo start --web`.

**Motivation:** AI code generation has eroded code review skills in beginners. This
teaches them to spot bugs through deliberate practice.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Expo (React Native)** | Already scaffolded and running; cross-platform iOS/Android/Web |
| Navigation | expo-router (file-based) | Already wired — `app/index.tsx`, `app/quiz.tsx` |
| Styling | React Native StyleSheet | In use; no Tailwind on native |
| Storage | AsyncStorage | Settings persistence (showBugCount) |
| Syntax highlight | Plain monospace (CodeViewer) | Working; upgrade to Shiki for web later |
| Testing | (not yet set up) | Add Vitest or Jest for grader + data integrity |

**Web note:** `expo start --web` works today. A dedicated Next.js build is deferred to
v2 if Expo web performance is insufficient.

## Current State (what's built)

| File | Status | Notes |
|---|---|---|
| `app/index.tsx` | ✅ Done | Home screen — lang/difficulty selector, settings toggle, Start button |
| `app/quiz.tsx` | ✅ Done | Quiz screen — code viewer, submit/no-bugs/give-up actions, result view |
| `app/_layout.tsx` | ✅ Done | Root layout with SettingsProvider |
| `src/types/index.ts` | ✅ Done | `Question`, `Bug`, `GradeResult`, `LineState` types |
| `src/utils/grader.ts` | ✅ Done | `grade()` + `reveal()` — multi-bug, false_positive detection |
| `src/utils/questions.ts` | ✅ Done | `getQuestions()`, `getRandomQuestion()` with excludeId |
| `src/components/CodeViewer.tsx` | ✅ Done | Scrollable code display, line tap, state colors |
| `src/components/ResultView.tsx` | ✅ Done | Headline + per-bug explanation cards + Next button |
| `src/context/SettingsContext.tsx` | ✅ Done | AsyncStorage-backed settings |
| `src/data/python_beginner.json` | 🔶 Partial | Has questions — need more (target: 20) |
| `src/data/js_beginner.json` | ❌ Missing | JavaScript questions needed |
| Tests | ❌ Missing | Data integrity + grader unit tests |
| Score / session tracking | ❌ Missing | `SCORING_PLACEHOLDER` comments mark the spots |

## Data Model

### `Question` (source of truth — `src/types/index.ts`)

```typescript
export interface Bug {
  lines: number[];       // 1-indexed; multi-line bugs supported
  explanation: string;
}

export interface Question {
  id: string;
  language: Language;          // 'python' | 'javascript' | 'html_css'
  difficulty: Difficulty;      // 'beginner' | 'intermediate'
  bug_type: BugType | BugType[]; // 'syntax' | 'logic' | 'style'
  title: string;
  code: string;
  bugs: Bug[];                 // empty array = no bugs in this snippet
}
```

**Key design decisions already made:**
- Multi-bug per question (`bugs: Bug[]`) — more realistic than single-bug only
- Multi-line bugs (`lines: number[]`) — e.g. a swap bug spans 2 lines
- `bugs: []` means "no bugs" — explicit, no separate `hasBug` flag needed
- `false_positive` is a graded state — selecting a clean line is a mistake

### `GradeResult` (`src/types/index.ts`)

```typescript
export type LineState =
  | 'idle' | 'selected' | 'correct' | 'missed' | 'false_positive' | 'revealed';

export interface GradeResult {
  passed: boolean;
  lineStates: Record<number, LineState>;
  usedGiveUp: boolean;
  // SCORING_PLACEHOLDER: score delta, streak increment, xp earned
}
```

## Grader Logic (`src/utils/grader.ts`)

Two functions, both complete:

**`grade(question, selectedLines, usedNoBugs)`**
- If `usedNoBugs && bugs.length === 0` → passed
- If `usedNoBugs && bugs.length > 0` → all bug lines marked `missed`
- Otherwise: per-line classification (correct / missed / false_positive)
- `passed` = no missed AND no false_positives

**`reveal(question)`**
- Sets all bug lines to `'revealed'` state (amber color)
- `passed: false`, `usedGiveUp: true`

## UI Flow

```
Home (app/index.tsx)
  ↓ pick language + difficulty + settings → Start
Quiz (app/quiz.tsx)
  ↓ tap lines
  [No Bugs Here] → grade(q, [], true)
  [Give Up]      → reveal(q)         (Alert confirm first)
  [Submit]       → grade(q, selected, false)
  ↓ result set
ResultView
  ↓ [Next Question →] → loadNext(excludeId)
  (loops — no session limit yet)
```

**Missing: session/score loop.** Questions cycle randomly with no end state. v1 needs:
- A fixed session size (e.g. 10 questions)
- Score tracked across the session
- End screen when session is complete

## Color System (existing)

The app uses a blue-focused dark palette today. DESIGN.md defines an amber-focused
palette that better fits the "spot the bug" metaphor. Migration plan:

| Role | Current | DESIGN.md target |
|---|---|---|
| Background | `#0F172A` | `#0d1117` |
| Surface / code bg | `#111827` / `#1E293B` | `#161b22` |
| Brand / action | `#3B82F6` (blue) | `#f0883e` (amber) |
| Selected line | `#1D3557` | `bg-amber-500/20` |
| Correct | `#14532D` | `bg-green-500/15` |
| Missed/wrong | `#450A0A` | `bg-red-500/15` |
| Revealed | `#431407` | deep orange tint |
| Text | `#D1D5DB` | `#e6edf3` |
| Muted | `#4B5563` | `#8b949e` |

DESIGN.md also adds motion (reveal slide-up), font choices (JetBrains Mono for code),
and microcopy templates. These are the next design layer — implement after data and
session are solid.

## Question Data

### Content authoring rules

- Max **55 chars per code line** (mobile readability, horizontal scroll as fallback)
- Max **8 lines** per question
- `explanation` = complete sentence naming the bug and the fix
- `title` = short label (shown in result card header)
- `bug_type` = `'syntax'` | `'logic'` | `'style'`

### Python topics (target: 20 questions — currently ~5)

| Topic | bug_type |
|---|---|
| Missing parenthesis | syntax |
| Variable swap (classic) | logic |
| `== None` vs `is None` | style |
| `=` vs `==` in condition | syntax |
| Off-by-one in range | logic |
| Missing return value | logic |
| Unreachable code | logic |
| Bad conditional (> vs <) | logic |
| Type mismatch (str + int) | syntax |
| Mutable default argument | logic |
| Input not validated | logic |
| Indentation error | syntax |
| Integer division truncation | logic |
| String index out of range | logic |
| Clean snippet (no bug) ×3 | — |

### JavaScript topics (target: 20 questions — 0 exist)

| Topic | bug_type |
|---|---|
| `==` vs `===` | logic |
| `var` hoisting / `let` scope | logic |
| Missing `await` | logic |
| Type coercion (`+` with string) | logic |
| `undefined` property access | logic |
| Closure in loop (classic) | logic |
| Array mutation surprise | logic |
| Off-by-one | logic |
| Missing error handler | logic |
| `this` binding lost | logic |
| `NaN` comparison | logic |
| Implicit global var | style |
| `parseInt` radix missing | style |
| Clean snippet (no bug) ×3 | — |

## What to Build Next (priority order)

### 1. Session model (highest priority)

Add session state to `quiz.tsx`:
- `sessionSize = 10` (start fixed)
- `sessionIndex` (0–9) and `sessionScore` (correct count)
- `ScoreBar` component: shows `{sessionScore}/{sessionIndex}` + progress bar
- End screen (`ResultsScreen`) when `sessionIndex === sessionSize`
- Fisher-Yates shuffle of the question pool at session start, no repeats

**Remove** `getRandomQuestion` (random with excludeId) — replace with
`getSessionQuestions(language, difficulty, size)` that shuffles and slices.

### 2. More question data

Write 15 more Python beginner questions and 20 JS beginner questions.
Use the authoring rules above. Each must pass the data integrity tests (step 4).

### 3. Design token migration

Update `CodeViewer.tsx`, `quiz.tsx`, `index.tsx`, `ResultView.tsx` to use
the DESIGN.md color tokens (amber brand, `#0d1117` bg, `#e6edf3` text).
Add JetBrains Mono font via expo-font or system monospace fallback.

### 4. Tests

```
tests/
  grader.test.ts        — unit tests for grade() and reveal()
  questions.test.ts     — data integrity: every bug has explanation, lines non-empty,
                          all languages/difficulties in allowed sets
```

Use Vitest (or Jest if Expo preset is simpler). Run in CI.

### 5. Microcopy upgrade (ResultView)

Replace current headline strings with the templates from DESIGN.md:
- `✓ All bugs found.` → `✓ Correct — Line {N} was the bug.`
- `✗ Missed N bugs.` → more specific per-bug copy
- Hint field support (add `hint?: string` to `Bug`)

### 6. Reveal motion (nice-to-have)

ResultView slides up from bottom (280ms spring) when result is set.
CodeViewer dims slightly (`opacity 0.7`) when result is shown.

## Build Order

1. Session model + `ScoreBar` + `ResultsScreen` — makes the app feel complete
2. Question data — 35 more questions (Python×15 + JS×20)
3. Tests — data integrity + grader
4. Design token migration — amber brand, DESIGN.md colors
5. Microcopy upgrade — better copy in ResultView
6. Reveal motion — polish

## GSTACK REVIEW REPORT

### Office Hours
- ✅ Idea validated: real problem, clear learning loop, no login friction

### CEO Review
- ✅ Scope locked: beginner level, mobile-first, no backend
- ✅ Stack: Expo (already running) instead of Next.js (deferred to v2)

### Engineering Review
- ✅ Architecture: Expo Router, static JSON data, AsyncStorage settings
- ✅ Grader: multi-bug, false_positive, give-up/reveal — all implemented
- ✅ Type system sound (`Question`, `Bug`, `GradeResult`, `LineState`)

### Design Review
- ✅ Visual identity: amber brand, full token set (DESIGN.md)
- ✅ Interaction states: all 6 LineStates mapped to colors
- ✅ Microcopy templates (DESIGN.md) — not yet applied to code
- ✅ Motion: reveal slide-up spec (DESIGN.md) — not yet implemented
- ✅ Accessibility: keyboard nav spec, ARIA (applies to web target)
- ✅ Mobile: horizontal scroll on CodeViewer already in place

### Reconciliation (Expo vs Next.js plan)
- ✅ Adopted `Question`/`Bug` model (multi-bug) over `Challenge` (single-bug)
- ✅ Adopted `false_positive` grading (flagging a clean line is a mistake)
- ✅ Kept `reveal()` / give-up mechanic (better UX than original plan)
- ✅ Kept `showBugCount` setting (AsyncStorage-backed)
- 🔶 Session/score loop still missing — highest priority gap
- 🔶 JS question bank does not exist yet
