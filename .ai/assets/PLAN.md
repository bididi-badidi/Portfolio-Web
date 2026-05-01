# Portfolio Website Enhancement Plan

## Context

Three enhancements to the portfolio site: adding 3 new AI project showcases, a subtle "built by AI" signature, and centralizing the color system. The theme refactor comes first so new pages use centralized tokens from the start.

---

## Phase 1: Theme Centralization (Task 3)

**Goal**: Single source of truth for all colors. No visual changes — just centralize control.

### Step 1A: Define CSS custom properties in `app/globals.css`

Add semantic color tokens to `:root`:

| Token | Value | Replaces |
|---|---|---|
| `--color-bg-primary` | `#0a0a0a` | `--background`, hardcoded `#0a0a0a` |
| `--color-bg-surface` | `#0f172a` | `bg-slate-900`, `bg-slate-950` |
| `--color-bg-surface-light` | `#1e293b` | `bg-slate-800` |
| `--color-text-primary` | `#94a3b8` | `--foreground`, `text-slate-400` |
| `--color-text-heading-from` | `#cbd5e1` | `from-slate-300` |
| `--color-text-heading-to` | `#64748b` | `to-slate-500` |
| `--color-text-body` | `#e2e8f0` | `text-neutral-200`, `text-slate-200` |
| `--color-text-muted` | `#475569` | `text-slate-600` |
| `--color-text-bright` | `#f1f5f9` | `text-slate-50`, `text-neutral-50` |
| `--color-accent` | `#06b6d4` | `cyan-500` in Lamp |
| `--color-border` | `rgba(226,232,240,0.2)` | `slate-200/20` |
| `--color-border-subtle` | `#1e293b` | `border-slate-800` |

### Step 1B: Map tokens in `tailwind.config.ts`

Extend colors to reference CSS variables:
```
surface, surface-light, heading-from, heading-to, text-body,
text-muted, text-bright, accent, border-theme, border-subtle
```

### Step 1C: Replace hardcoded values (~30 files)

Key replacements:
- `from-slate-300 to-slate-500` -> `from-heading-from to-heading-to`
- `bg-slate-950` / `bg-slate-900` -> `bg-surface`
- `text-neutral-200/300` -> `text-text-body`
- `text-slate-600` -> `text-text-muted`
- `text-slate-50` -> `text-text-bright`
- `border-slate-800` -> `border-border-subtle`

**Note**: `DottedBackground` has hardcoded hex in SVG data URIs — CSS vars don't resolve there. Keep hardcoded with a comment.

**Files to modify**: `globals.css`, `tailwind.config.ts`, `SectionHeading.tsx`, `Lamp.tsx`, `ResumeButton.tsx`, `Footer.tsx`, `ProjectText.tsx`, `ProjectHeading.tsx`, `floating-navbar.tsx`, `Timeline.tsx`, `TimelineMobile.tsx`, all 6 SpotlightHero files, WhyItMatters files, and other components with hardcoded colors.

### Verification
- `bun build` succeeds
- Visual appearance is identical before/after
- Grep audit: no remaining hardcoded slate/neutral values in non-vendor components

---

## Phase 2: New Project Pages (Task 1)

### Step 2A: Create 3 project directories

Under `app/(pages)/projects/`:

1. **`telegram-multi-agent/`** — Telegram group with specialized AI agents + MCP server for daily tasks
2. **`deep-research/`** — Multi-agent workflow: vague request -> comprehensive sourced markdown report
3. **`dashboard/`** — Telegram-powered unified social media reply interface with LLM-drafted options

Each gets: `page.tsx`, `SpotlightHero.tsx`, `WhyItMatters.tsx`, `Features.tsx`, `TechStack.tsx`

### Step 2B: Follow existing page pattern

Each page: `DottedBackground` > `FloatingNav` > sections (`SpotlightHero`, `WhyItMatters`, `TechStack`, `Features`). All using new theme tokens.

Content will use clear placeholder text marked with TODO comments for the user to fill in.

### Step 2C: Add Timeline entries on landing page

Create timeline card components in `components/Landing/Project/`:
- `TelegramMultiAgent.tsx`, `DeepResearch.tsx`, `Dashboard.tsx`

Update `components/Landing/SectionProjects.tsx` to add entries to the timeline data array.

### Step 2D: Assets needed from user
- Preview images or videos for each project (for landing page cards and detail pages)
- Specific content: taglines, feature descriptions, tech stack details

### Verification
- `bun build` succeeds
- Navigate to `/projects/telegram-multi-agent`, `/projects/deep-research`, `/projects/dashboard`
- Landing page timeline shows all 3 new entries

---

## Phase 3: "Built by AI" Surprise Element (Task 2)

### Implementation

Create `components/Footer/BuiltByAI.tsx`:
- Scroll-triggered fade-in using `motion` (already installed)
- `whileInView` animation: opacity 0->1, y 10->0, duration 1.2s
- Subtle styling: `text-xs`, muted color, brightens on hover
- Text: *"Built by Claude & Gemini under harness engineering — ensuring efficient commitments and safe deliverables."*

### Integration

Add `<BuiltByAI />` after `<Footer />` in `app/layout.tsx` (one-line change). Appears on every page.

### Verification
- Scroll to page bottom — element fades in smoothly
- Hover effect works
- Appears on all pages (root layout)

---

## Final Verification

- `bun build` and `bun lint` pass
- All existing pages render identically (theme refactor is visual no-op)
- All 3 new project pages load and navigate correctly
- Surprise element animates on scroll across all pages
- Mobile viewport behaves correctly
