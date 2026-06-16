# CodeReview App — v1 Plan

## Overview

A gamified code review learning app. Users read short code snippets and identify the buggy line (or confirm there is no bug). Web-first. No backend, no accounts.

**Motivation:** AI code generation has eroded code review skills in beginners. This teaches them to spot bugs through deliberate practice.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Recruiter-visible portfolio, SSG, RSC-compatible |
| Styling | Tailwind CSS | Utility-first, pairs well with the token system in DESIGN.md |
| Syntax highlight | Shiki | Server-side, RSC-compatible, outputs tokens for manual line rendering |
| Testing | Vitest | Faster than Jest, native ESM support |
| Deployment | Vercel (free tier) | Zero-config Next.js deployment |
| Mobile (v2) | React Native + Expo | Shares challenge data and business logic with web |

## Scope (v1)

- 20 challenges: 10 Python + 10 JavaScript
- Difficulty: Beginner only
- 1 bug per challenge (or 0 — "no bug" challenges)
- No user accounts, no backend, no persistence beyond session score
- Score lives in React state. Resets on page refresh (acceptable for v1)

## File Structure

```
app/
  page.tsx           — single-page state machine root
  globals.css        — CSS custom properties (color tokens from DESIGN.md)
  layout.tsx         — root layout, font imports

components/
  CodeBlock.tsx      — Shiki + manual line rendering + click handling
  ChallengeView.tsx  — code panel + action bar (No Bug / Submit)
  RevealView.tsx     — correct/wrong feedback panel
  ScoreBar.tsx       — X/20 progress indicator
  ResultsScreen.tsx  — end screen, score tier message, per-challenge review

lib/
  types.ts           — TypeScript interfaces (Challenge, AppState)
  challenges.ts      — getById(), shuffle() (Fisher-Yates), getAllIds()

data/
  challenges.json    — 20 challenges, static content

tests/
  challenges.test.ts — data integrity: hasBug → non-null bugLine, all explanations non-empty
  statemachine.test.ts — state transitions, score increments
```

## Types (`lib/types.ts`)

```typescript
export interface Challenge {
  id: string;
  language: 'python' | 'javascript';
  level: 'beginner';
  topic: string;
  code: string;          // raw code string, newline-separated
  hasBug: boolean;
  bugLine: number | null; // null if hasBug is false
  bugType: string | null;
  explanation: string;
  hint?: string;
}

export type AppState =
  | { phase: 'selecting'; challenge: Challenge; selectedLine: number | null }
  | { phase: 'revealed'; challenge: Challenge; userLine: number | null; correct: boolean }
  | { phase: 'done'; score: number; total: number };
```

## State Machine (`app/page.tsx`)

Phases: `selecting` → `revealed` → `selecting` (loop, 20×) → `done`

Transitions:
- User clicks line or "No Bug Here" → `selectedLine` set (stays in `selecting`)
- User clicks "Submit" → move to `revealed`, compute `correct`
- User clicks "Next" in reveal → move to next challenge (`selecting`) or `done` if index === 19

Score increments only on transition to `revealed` when `correct === true`.

## Component: CodeBlock (`components/CodeBlock.tsx`)

Uses Shiki to tokenize on the server, renders lines manually for click handling.

```tsx
{lines.map((line) => (
  <div
    key={line.lineNumber}
    tabIndex={interactive ? 0 : -1}
    role={interactive ? "option" : undefined}
    aria-selected={selectedLine === line.lineNumber}
    onClick={() => interactive && onSelectLine(line.lineNumber)}
    onKeyDown={(e) => interactive && (e.key === 'Enter' || e.key === ' ') && onSelectLine(line.lineNumber)}
    className={lineClass(line.lineNumber, selectedLine, revealedLine, correct)}
  >
    <span className="select-none w-8 inline-block text-right pr-2 text-muted">
      {selectedLine === line.lineNumber ? '▶' : line.lineNumber}
    </span>
    {line.tokens.map((token, i) => (
      <span key={i} style={{ color: token.color }}>{token.content}</span>
    ))}
  </div>
))}
```

Line class helper:
- `selecting` phase, this line selected → `bg-amber-500/20 border-l-2 border-amber-400`
- `revealed` phase, this line is correct bugLine → `bg-green-500/15 border-l-2 border-green-400`
- `revealed` phase, this line is wrong userLine → `bg-red-500/15 border-l-2 border-red-400`
- default → `hover:bg-white/5`

## Component: ChallengeView (`components/ChallengeView.tsx`)

- Shows CodeBlock + action bar
- `hasBug=false` challenge: lines are non-interactive (`interactive={false}` prop), "No Bug Here" is the only valid action
- "No Bug Here" acts as a toggle — clicking it sets `selectedLine` to a sentinel value (`-1`), re-clicking clears it
- "Submit" is disabled until `selectedLine !== null` (either a line number or the -1 sentinel)

## Component: RevealView (`components/RevealView.tsx`)

- `role="alert"` (screen reader announcement)
- Slides in from bottom: CSS `translate-y` transition, 200ms ease-out
- Uses microcopy templates from DESIGN.md (4 cases: correct line, wrong line, correct no-bug, wrong no-bug)
- Shows `hint` field if non-null and user was wrong (helps them learn)
- "Next →" button advances state

## Component: ScoreBar (`components/ScoreBar.tsx`)

- Shows `{score}/{total}` only after first answer (not "0/20" on load)
- Amber fill progress bar: `width: (score/total * 100)%`

## Component: ResultsScreen (`components/ResultsScreen.tsx`)

- Score tier message (see DESIGN.md — 3 tiers)
- Per-challenge review list: each challenge, user's answer, correct answer, explanation
- "Try Again" button resets state to fresh shuffle

## Challenge Data (`data/challenges.json`)

Schema per challenge:
```json
{
  "id": "py-beginner-001",
  "language": "python",
  "level": "beginner",
  "topic": "incorrect-operator",
  "code": "def is_admin(user):\n    if user.role = 'admin':\n        return True\n    return False",
  "hasBug": true,
  "bugLine": 2,
  "bugType": "incorrect-operator",
  "explanation": "Line 2 uses = (assignment) instead of == (comparison).",
  "hint": "Look at the conditional operator carefully."
}
```

**Content authoring constraints:**
- Max 55 characters per code line (mobile readability)
- Max 8 lines per challenge (visible without vertical scroll)
- `explanation` must name the bug type and the fix
- `hint` should guide without giving away the answer

**Python topics (10):** syntax error, `=` vs `==`, off-by-one, missing return, unused variable, typo, missing null check, unreachable code, bad conditional, input validation

**JS topics (10):** `==` vs `===`, `var` vs `let` scoping, missing `await`, type coercion, `undefined` access, closure bug, array mutation, off-by-one, missing error handler, bad callback

## Onboarding

No splash screen. First 3 challenges show a dismissible hint below the code panel:
> "Click the buggy line — or tap No Bug Here if the code is clean."

Backed by `localStorage` key `crapp_hint_dismissed`. Auto-hides after challenge 4 or first correct answer.

## CSS Tokens (`app/globals.css`)

See `DESIGN.md` for the complete token list. Key additions beyond v1:
- `--color-surface-elevated: #1c2128` — reveal panel sits above the code surface
- `--color-reveal-correct-bg: #0d2618` and `--color-reveal-wrong-bg: #260d0d` — deep tinted backgrounds for the reveal hero moment

```css
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: 'DM Sans', system-ui, sans-serif;
}
```

**Fonts** (load via `next/font/google` in `app/layout.tsx`):
- UI: **DM Sans** 400/500/700 — warmer than Inter, less generic
- Code: **JetBrains Mono** 400 — wider letterforms, better `0O`/`1lI` disambiguation for bug-spotting
- Score counter: **DM Mono** 500

## Mobile

- Code panel: `overflow-x-auto` wrapper, no line wrapping
- Action bar: `flex-col w-full sm:flex-row sm:w-auto`
- Line height: `1.75rem` desktop, `2rem` mobile
- Button min height: `44px`

## Accessibility

- Lines: `tabIndex={0}`, `role="option"`, `aria-selected`, keyboard `Enter`/`Space` to select
- Code section: `aria-label="Code challenge"`
- RevealView: `role="alert"`
- Color + shape signals (never color alone): `▶` glyph + border for selected; checkmark/X icon for correct/wrong
- All contrast ratios pass WCAG AA (verified in DESIGN.md)

## Build Order

1. `lib/types.ts` — types first
2. `data/challenges.json` — 5 Python challenges to start
3. `lib/challenges.ts` — shuffle, getById
4. `app/globals.css` — color tokens
5. `components/CodeBlock.tsx` — core interactive component
6. `components/ChallengeView.tsx`
7. `components/RevealView.tsx`
8. `components/ScoreBar.tsx`
9. `components/ResultsScreen.tsx`
10. `app/page.tsx` — wire state machine
11. `tests/` — data integrity + state machine tests
12. Remaining 15 challenges

## GSTACK REVIEW REPORT

### Office Hours
- ✅ Idea validated: real problem (AI eroding code review skills), clear learning loop, no login friction, shareable via URL
- Deferred: intermediate/expert levels, leaderboard, mobile app

### CEO Review
- ✅ Scope locked: 20 beginner challenges, web-first, no backend
- ✅ Stack chosen: Next.js + Tailwind + Shiki + Vercel
- Deferred to v2: React Native + Expo, accounts, persistence

### Engineering Review
- ✅ Architecture: single-page state machine, static JSON, Shiki server-side, Fisher-Yates shuffle
- ✅ Test plan: data integrity (Vitest) + state machine unit tests
- ✅ No backend needed for v1

### Design Review
- ✅ Visual identity defined: DM Sans + JetBrains Mono, amber brand, full token set (DESIGN.md)
- ✅ All 10 interaction states documented (DESIGN.md)
- ✅ 4 microcopy templates written (DESIGN.md)
- ✅ Motion system: reveal spring entrance (280ms), code panel recede effect, reduced-motion support
- ✅ Layout: reveal panel as hero — code panel scales/fades when reveal is active
- ✅ Onboarding: first-visit hint, localStorage-backed
- ✅ Empty/error states: score bar zero-state, results tiers, dev fallback
- ✅ Accessibility: keyboard nav, ARIA, color+shape signals, contrast verified, reduced motion
- ✅ Mobile: overflow-x-auto code panel, stacked action bar, 55-char line cap
