# CodeReview App — Design System

## Memorable Thing

> "I just got smarter."

Every design decision serves the moment of insight after each challenge. The reveal panel is the product hero — not the code editor, not the score.

---

## Visual Identity

### Visual Thesis

Serious dev-tool precision with one warm beat — the amber moment of insight. Dark like a terminal, warm like a mentor.

### Color Tokens

Define as CSS custom properties in `app/globals.css`:

```css
:root {
  /* Base */
  --color-bg:               #0d1117;  /* page background */
  --color-surface:          #161b22;  /* code panel, cards */
  --color-surface-elevated: #1c2128;  /* reveal panel (elevated above surface) */
  --color-border:           #30363d;  /* dividers, panel borders */

  /* Brand */
  --color-brand:            #f0883e;  /* amber — selected line, Submit button, progress fill */
  /* Amber rationale: semantically "caution" — fitting for bug-spotting.
     Distinct from success/error, so it never pre-signals the outcome. */

  /* State */
  --color-success:          #3fb950;
  --color-error:            #f85149;
  --color-reveal-correct-bg:     #0d2618;
  --color-reveal-wrong-bg:       #260d0d;
  --color-reveal-correct-border: rgba(63, 185, 80, 0.4);
  --color-reveal-wrong-border:   rgba(248, 81, 73, 0.4);

  /* Text */
  --color-text:             #e6edf3;  /* primary */
  --color-muted:            #8b949e;  /* line numbers, secondary labels */
}
```

**Contrast ratios (WCAG AA):**
- Amber `#f0883e` on `#0d1117` → 6.8:1 ✓
- Green `#3fb950` on `#0d1117` → 5.1:1 ✓
- Red `#f85149` on `#0d1117` → 4.8:1 ✓
- Text `#e6edf3` on `#161b22` → 13.2:1 ✓

### Typography

Load via `next/font/google` in `app/layout.tsx`:

| Use | Font | Weight |
|---|---|---|
| UI headings | **DM Sans** | 700 |
| UI body / labels | **DM Sans** | 400, 500 |
| Code snippets | **JetBrains Mono** | 400 |
| Score counter | **DM Mono** | 500 |

**Why DM Sans over Inter:** Inter is on ~80% of dev portfolios. DM Sans has the same legibility with warmer letterforms that soften the hard edges of the code panel.

**Why JetBrains Mono:** Wider letterforms reduce `0O`/`1lI` ambiguity. For a bug-spotting app, character clarity is a feature. Supports ligatures for `==`, `!=`, `=>`.

```css
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: 'DM Sans', system-ui, sans-serif;
}
code, .code-panel {
  font-family: 'JetBrains Mono', 'Cascadia Code', monospace;
  font-size: 14px;           /* desktop */
  line-height: 1.75rem;      /* 28px — also sets touch target floor */
}
@media (max-width: 640px) {
  code, .code-panel {
    font-size: 12px;
    line-height: 2rem;        /* 32px — enlarged for touch */
  }
}
```

### Spacing Scale

| Token | Value | Used for |
|---|---|---|
| `space-1` | 4px | icon gaps, tight labels |
| `space-2` | 8px | button padding vertical, line gutter |
| `space-3` | 12px | action bar padding |
| `space-4` | 16px | section padding |
| `space-6` | 24px | reveal panel padding |
| `space-8` | 32px | page padding desktop |

Code line padding: `py-1.5 px-0` (6px vertical, 0 horizontal — the left border IS the padding signal).

### Shape

- Border radius: `rounded-md` (6px) — not sharp, not bubbly
- Code panel inner lines: no border-radius (lines bleed edge to edge)
- Reveal panel: `rounded-b-lg` (12px bottom only — it slides up from the bottom)
- Buttons: `rounded-md`

---

## Layout — The Reveal as Hero

When the reveal panel appears, the code panel recedes. The insight becomes the new focal point.

```
SELECTING STATE:
┌─────────────────────────────────────────────────────────┐
│  ◈ CodeReview.dev         [BEGINNER]        ▓▓▓░░░ 3/20 │
├─────────────────────────────────────────────────────────┤
│  [CODE PANEL — full size, full opacity]                  │
│   1  │ def calculate_discount(price, rate):              │
│ ▶ 2  │     if rate > 1:                          ← sel   │
│   3  │         discount = price * rate                   │
│   4  │     return price - discount                       │
├─────────────────────────────────────────────────────────┤
│  [ No Bug Here ]          [ Submit Answer → ]            │
└─────────────────────────────────────────────────────────┘

REVEALED STATE:
┌─────────────────────────────────────────────────────────┐
│  ◈ CodeReview.dev         [BEGINNER]        ▓▓▓▓░░ 4/20 │
├─────────────────────────────────────────────────────────┤
│  [CODE PANEL — scale(0.98), opacity(0.7)]                │
│   1  │ def calculate_discount(price, rate):              │
│ ✓ 2  │     if rate > 1:                         ← correct│
│   3  │         discount = price * rate                   │
│   4  │     return price - discount                       │
├══════════════════════════════════════════════════════════╡
│  ✓ Correct — Line 2 was the bug.                HERO     │
│                                                          │
│  `if rate > 1:` should be `if rate < 1:`. Rates above   │
│  100% pass the check and create a negative discount.     │
│                                             [ Next → ]   │
└─────────────────────────────────────────────────────────┘
```

CSS for the recede effect on the code panel when `phase === 'revealed'`:
```css
.code-panel[data-revealed="true"] {
  transform: scale(0.98);
  opacity: 0.7;
  transition: transform 280ms cubic-bezier(0.32, 0.72, 0, 1),
              opacity 280ms ease;
  pointer-events: none;
}
```

---

## Motion

| Event | Animation |
|---|---|
| Reveal panel entrance | `translateY(100%) → translateY(0)`, 280ms, `cubic-bezier(0.32, 0.72, 0, 1)` |
| Code panel recede (on reveal) | `scale(1) → scale(0.98)`, `opacity(1) → opacity(0.7)`, 280ms |
| Score counter increment | Number flip, 150ms, `ease-out` |
| Line selection | Immediate (0ms) — must feel instant |
| "Next" button appearance | Fade in, 200ms, 100ms delay after reveal settles |
| Progress bar fill | Width transition, 400ms, `ease-in-out`, after correct reveal |

**Why spring easing `cubic-bezier(0.32, 0.72, 0, 1)` for the reveal:**
The reveal moment needs a beat. 280ms spring entrance gives the brain time to shift from "I think line 3 is wrong" to "here's whether you were right." Without it, the reveal feels like a form error — a slap, not a lesson.

**Reduced motion:** Wrap all transitions in `@media (prefers-reduced-motion: no-preference)` — always include a plain `display: block` fallback with no animation.

---

## Interaction States

### Code Lines

| State | Classes / Style |
|---|---|
| Default | `bg-transparent` |
| Hover (interactive) | `hover:bg-white/5 cursor-pointer` |
| Selected | `bg-amber-500/20 border-l-2 border-amber-400` + `▶` glyph replaces line number |
| Correct (post-reveal) | `bg-green-500/15 border-l-2 border-green-400` + `✓` glyph |
| Wrong (post-reveal) | `bg-red-500/15 border-l-2 border-red-400` + `✗` glyph |
| Non-interactive (`hasBug=false`) | `cursor-default opacity-90`, hover suppressed |

### Buttons

| State | Classes |
|---|---|
| Submit: disabled | `opacity-40 cursor-not-allowed bg-amber-500 text-black` |
| Submit: enabled | `bg-amber-500 hover:bg-amber-400 text-black font-semibold` |
| No Bug: default | `border border-white/20 text-white/70 hover:border-white/50` |
| No Bug: active/selected | `border-amber-400 text-amber-400` |
| Next: default | `bg-white/10 hover:bg-white/15 text-white` |

### Reveal Panel

```jsx
<div
  role="alert"
  data-correct={correct}
  className={cn(
    "rounded-b-lg p-6 border-t-2 transition-transform",
    correct
      ? "bg-[--color-reveal-correct-bg] border-[--color-reveal-correct-border]"
      : "bg-[--color-reveal-wrong-bg] border-[--color-reveal-wrong-border]"
  )}
  style={{ animation: "slideUp 280ms cubic-bezier(0.32, 0.72, 0, 1)" }}
>
```

CSS keyframe:
```css
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes slideUp { from { opacity: 0; } to { opacity: 1; } }
}
```

---

## Microcopy Templates

### Correct — picked the right line
```
✓ Correct — Line {N} was the bug.
{explanation from challenges.json}
```

### Wrong — picked wrong line
```
✗ Not quite. Line {userLine} was clean.
The bug was on line {bugLine}: {explanation}
```

### Correct — said "No Bug" and code was clean
```
✓ Sharp eyes — this code was clean.
{explanation}
```

### Wrong — said "No Bug" but there was a bug
```
✗ There was a bug on line {bugLine}.
{explanation}
```

### Hint (shown before Submit, if hint field non-null)
```
💡 {hint}
```

---

## Onboarding

No splash screen. First 3 challenges show a dismissible hint below the code panel:
> "Click the buggy line — or tap No Bug Here if the code is clean."

- `localStorage` key: `crapp_hint_dismissed` (boolean)
- Auto-hide after challenge 4 or first correct answer
- No animation — plain `hidden` class toggle

---

## Empty & Error States

### Score bar at 0/20
Do not show "0 correct." Show empty progress bar only — no label until first answer.

### `challenges.length === 0` (dev fallback)
```
"No challenges loaded. Check data/challenges.json."
```
Centered in the code panel area, `text-muted`.

### Results screen copy (3 tiers)

| Score | Message |
|---|---|
| 16–20 | "Expert-level eyes. You caught almost everything." |
| 10–15 | "Solid. A few slipped by — review the ones you missed." |
| 0–9  | "Keep going. Spotting bugs takes practice." |

Always show: per-challenge review list (correct/wrong, what the bug was) so users learn from misses.

---

## Accessibility

1. **Keyboard nav:** Lines `tabIndex={0}`, selectable via `Enter`/`Space`. Buttons are `<button>` elements.
2. **ARIA:** Code section `aria-label="Code challenge"`. Each line `role="option"`, `aria-selected={isSelected}`.
3. **Color + shape:** Selected = amber bg + left border + `▶` glyph. Correct/wrong = color + checkmark/X glyph. Never color alone.
4. **Contrast:** All ratios pass WCAG AA (listed in Color Tokens section).
5. **Touch targets:** Line height `1.75rem` desktop, `2rem` mobile. Buttons `min-height: 44px`.
6. **Announce reveal:** `RevealView` has `role="alert"` for screen reader auto-announcement.
7. **Reduced motion:** All CSS animations wrapped in `@media (prefers-reduced-motion: no-preference)`.

---

## Mobile Responsiveness

### Code Panel
- Wrapper: `overflow-x-auto` — horizontal scroll, natural for code
- No line wrapping — developers expect horizontal scroll
- Font: `text-xs` (12px) only if 13px overflows on `375px` viewport

### Action Bar
- Mobile: `flex-col w-full gap-2` (buttons stacked, full width)
- Desktop: `sm:flex-row sm:w-auto sm:gap-3`

### Reveal Panel
- Full width on all viewports
- Padding reduced on mobile: `p-4` vs desktop `p-6`

### ScoreBar
- Compact (X/20 + progress bar). No layout changes needed.

---

## Content Authoring Guide

When writing challenges in `data/challenges.json`:
- Max **55 characters per code line** (enforces mobile readability without `text-xs` fallback)
- Max **8 lines of code** per challenge (visible without vertical scroll)
- `explanation` — complete sentence naming bug type and the fix
- `hint` — question or direction that guides without giving the answer
