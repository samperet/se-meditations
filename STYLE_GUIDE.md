# Sacred Engagement — Design Style Guide

This guide captures the visual language used across the Sacred Engagement app
(web, mobile web, and PWA). Follow it when adding new screens or components so
the experience stays cohesive.

The single source of truth for design tokens is `public/style.css` (the `:root`
block at the top). When you find yourself reaching for a literal value (a hex
color, a pixel size), check whether a token already exists.

---

## 1. Design Tokens

All tokens are CSS custom properties on `:root`. Use them instead of hard-coding
literals.

### Colors

| Token              | Value     | Usage                                                  |
| ------------------ | --------- | ------------------------------------------------------ |
| `--bg`             | `#f8f5f0` | App background (warm cream)                            |
| `--bg-card`        | `#ffffff` | Card / surface background                              |
| `--primary`        | `#5c7c62` | Brand green — "done" states, mod-2 accent              |
| `--primary-light`  | `#e8f0e9` | Soft green tints (callouts, hovers)                    |
| `--primary-dark`   | `#4a6450` | Hover state for primary buttons                        |
| `--accent`         | `#b07d56` | Warm secondary accent                                  |
| `--accent-light`   | `#f5ece3` | Soft warm tint                                         |
| `--text`           | `#2d2b28` | Body text                                              |
| `--text-muted`     | `#6b6560` | Secondary text, captions, helper copy                  |
| `--border`         | `#e0d8cf` | Card borders, dividers                                 |

Brand-blue (`#1d6083`) is used for the "continue" card and headings in cool
contexts. When you need it, use the literal — there is no token yet because the
green is the dominant brand color.

### Per-module accents

Each module has its own accent color, defined in `public/app.js → MODULES`:

| Module   | Title         | Accent      |
| -------- | ------------- | ----------- |
| Module 1 | *Waking Up*   | `#1d6083`   |
| Module 2 | *Clearing Away* | `#5c7c62` |

Use these only for cross-module surfaces (the picker cards, the picker
continue-card). Inside a module, the in-module continue-card stays brand blue.

### Shadow & radius

| Token         | Value                              |
| ------------- | ---------------------------------- |
| `--shadow`    | `0 2px 12px rgba(0,0,0,0.08)`      |
| `--shadow-lg` | `0 4px 24px rgba(0,0,0,0.12)`      |
| `--radius`    | `16px` (cards, large surfaces)     |
| `--radius-sm` | `10px` (chips, small surfaces)     |

Pills/CTAs use a fully-rounded `100px` radius; buttons follow this convention.

### Typography

System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui,
sans-serif`. **Don't load web fonts** — performance matters more than typeface
control for this app.

Weight scale (consistent across the app):

| Weight | When to use                                       |
| ------ | ------------------------------------------------- |
| 500    | Subtle metadata, small labels                     |
| 600    | Secondary controls, eyebrow text                  |
| 700    | Buttons, card titles, lesson titles               |
| 800    | Page titles, hero text, large CTAs                |

Common font sizes:

| Use                          | Size       |
| ---------------------------- | ---------- |
| Body / paragraph             | 14–15px    |
| Card title                   | 17px       |
| Lesson title                 | 17–18px    |
| Section header               | 18px       |
| Hero greeting                | 20px       |
| Hero page title              | 26–34px    |
| Countdowns / display numbers | `clamp(60px, 18vw, 86px)` |

Use `letter-spacing: -0.5px` on big titles, `letter-spacing: 1.5px` +
`text-transform: uppercase` on eyebrows.

---

## 2. Page Chrome

Every "page" inside the app shell uses the same chrome — a sticky header at the
top with a back-arrow, page title, and account avatar.

### Hero banner

All home-style pages (picker, module home) open with a hero banner:

- Gradient: `linear-gradient(160deg, #e3edf4 0%, #f0f5f1 60%, #f8f5f0 100%)`
- Padding: `24px 24px 20px`
- Border-bottom: `1px solid var(--border)`
- Logo: `width: 160px`, centered, `margin: 0 auto 14px`
- Greeting: 20px / weight 700 / color `var(--text)`
- Eyebrow line under greeting: 13px / weight 500 / color `#1d6083`

Classes `.home-hero` and `.picker-hero` both follow this — keep them in sync
when changing one.

### Content gutters

Below the hero, content lives in 20px side-gutters:

- Cards: `margin: 16px 20px` (continue-card, module-card)
- Lists with multiple cards: `padding: 16px 20px 32px` with `gap: 14px`

Do **not** add a `max-width` on these containers — the app is mobile-first and
desktop just becomes a comfortable single-column view. The shell takes care of
its own desktop centering.

### Lesson hero (no audio)

For lessons without an audio player, use `.lesson-hero` (blue gradient,
eyebrow + bold title). This visually replaces the audio player slot so the
page rhythm stays consistent.

---

## 3. Components

### Cards

Three families of card, each with a distinct role:

| Class            | Surface        | Where used                                 |
| ---------------- | -------------- | ------------------------------------------ |
| `.continue-card` | Brand blue     | "Continue where you left off" (home + picker) |
| `.module-card`   | White on tint  | The two module choices on the picker       |
| `.lesson-card`   | White          | Lesson rows inside a module                |
| `.section-header-card` | White on tint | Section/week header inside a module        |

All cards share: `border-radius: var(--radius)`, soft shadow on lift,
`transition: transform 0.15s, box-shadow 0.15s`, `cursor: pointer` if
interactive, `transform: scale(0.98–0.99)` on `:active` for tap feedback.

### Buttons

| Class                   | When                                |
| ----------------------- | ----------------------------------- |
| `.btn-primary`          | Auth screen primary action          |
| `.btn-play` / `.btn-start` | Big pill CTAs (BOR timer, etc.)  |
| `.btn-secondary`        | Outlined / quiet alternative        |
| `.admin-reset-btn`      | Admin primary action                |
| `.admin-secondary-btn`  | Admin row action                    |
| `.admin-danger-btn`     | Admin destructive action            |
| `.continue-play-btn`    | Circular play button on continue-card |

Pill rule: anything stand-alone is a pill (`border-radius: 100px`). Anything
inline in a row is `var(--radius-sm)` or smaller.

### Block types (lesson content)

Lesson content is composed of typed blocks rendered by `renderBlock` in
`app.js`. Use these — don't invent new HTML inside a lesson.

| Block type    | Renders as                       |
| ------------- | -------------------------------- |
| `info`        | Plain text section with optional title |
| `questions`   | Section header + textarea list (auto-save) |
| `link`        | Pill-style outbound link button with icon |
| `youtube`     | Thumbnail card that opens YouTube |

Helpers in `lessons-mod1.js` (`info`, `ask`, `link`, `video`, `audio`, `pdf`,
`youtube`) are the right starting point when authoring new content.

### Icons

Use a single emoji where one carries meaning (🎬 for video, 🔊 for audio, 📄
for PDF). Avoid emoji in primary UI affordances like menu items, buttons, or
headers — keep those typographic.

---

## 4. Module-Aware Copy

Two modules ship today and more are coming. Use these terms consistently:

| Module     | Section word | Lesson word | Module subtitle      |
| ---------- | ------------ | ----------- | -------------------- |
| Module 1   | "Week"       | "Day"       | *Waking Up*          |
| Module 2   | "Section"    | "Lesson"    | *Clearing Away*      |

`renderHome`, `renderLessonCard`, and `renderLesson` all branch on `moduleNumber`
to pick the right word. Follow the same pattern when adding new module-aware UI.

---

## 5. Adding a new screen

Checklist when introducing a new screen:

1. Wrap content in a `<div>` with a page-level class (e.g. `.picker-page`,
   `.resources-page`).
2. If it has a greeting/welcome area, use the hero pattern from §2.
3. Use 20px side gutters and 16px vertical rhythm between content sections.
4. Reuse `.continue-card`, `.lesson-card`, `.module-card`, or `.section-header-card`
   when the surface is conceptually one of those — don't create a new card class
   for a new variant if you can pass a modifier.
5. New buttons should map to one of the existing button classes above.
6. New routes go through `navHistory` so the back button works.
7. Module-aware screens should respect the words in §4.

When in doubt, screenshot an existing screen, place it side-by-side with yours,
and check: same padding rhythm? Same font weights? Same shadow depth? Same
accent? If anything jars, change the new screen, not the old one.

---

## 6. Out-of-bounds

Things this app deliberately doesn't do:

- **No custom fonts** — system font stack only.
- **No emoji buttons in chrome** (menu items, headers, navigation). Emoji is
  fine inside lesson content (where it's content) or as a per-link type-icon
  (🎬/🔊/📄).
- **No third-party UI libraries.** All components are hand-rolled in vanilla
  HTML/CSS/JS.
- **No box-shadows above `--shadow-lg`** in primary surfaces — keep depth subtle.
- **No `max-width` on app content containers** — the app shell handles that.
