# Portfolio design language

The production reference implementation is **`/`**: a completely black portfolio with silver typography, generous space, quiet surfaces, and fluid, reversible motion. Use this document when extending the redesign to other pages or building matching components.

This records the approved design and current implementation values as of **13 September 2026**. Keep this document and the reference components in agreement when making deliberate design changes. The original site's previous glass guidance is preserved in the scoped archive at the end.

## Foundation: Apple design skill

Use the **`apple-design` skill** when designing, implementing, or reviewing this interface. The installed reference is [Apple design — SKILL.md](/Users/user/.codex/skills/apple-design/SKILL.md), also available as `$apple-design` in the agent environment.

Apply its principles through immediate feedback, interruptible springs, consistent spatial relationships, restrained materials, careful typography, and accessible alternatives to motion. Keep this portfolio's pure-black foundation, content, and identity. The goal is a calm, legible interface whose controls respond naturally.

The hero also follows the `sickn33/scroll-experience` skill: native scrolling, a bounded sticky scene, direct progress mapping, accessible shortcuts, and a static reduced-motion alternative.

## Reference components

| Reference | Use it for |
| --- | --- |
| [DarkLanding.tsx](components/Portfolio/DarkLanding.tsx) | Composition, numbered sections, tool groups, contact and footer |
| [dark.module.css](components/Portfolio/dark.module.css) | Portfolio colours, geometry, typography, spacing and responsive rules |
| [Motion.tsx](components/Portfolio/Motion.tsx) | Shared spring, motion preference subscription and section reveals |
| [PlanetHero.tsx](components/Portfolio/PlanetHero.tsx) | Pinned headline and progressively flattening planet horizon |
| [Navigation.tsx](components/Portfolio/Navigation.tsx) | Moving navigation highlight and mobile menu |
| [ProjectShowcase.tsx](components/Portfolio/ProjectShowcase.tsx) | Segmented tabs, project panels, demos and animated height fitting |
| [Experience.tsx](components/Portfolio/Experience.tsx) | Expandable rows and rotating disclosure control |
| [ChatLauncher.tsx](components/Portfolio/ChatLauncher.tsx) | Persistent “Ask my AI” launcher and return focus |
| [ChatWindow.tsx](components/Portfolio/ChatWindow.tsx) | Separate chat component, conversation states and composer |
| [chat.module.css](components/Portfolio/chat.module.css) | Chat-specific surfaces, radii, sizing and responsive layout |
| [Contact.tsx](components/Portfolio/Contact.tsx) | Primary/secondary actions and inline copy confirmation |
| [ProjectShell.tsx](components/Portfolio/Projects/ProjectShell.tsx) | Reusable project navigation, footer and shared chat launcher |
| [PersonalAIProject.tsx](components/Portfolio/Projects/PersonalAIProject.tsx) | Project hero, editorial overview, architecture disclosures and live assistant entry points |
| [ProjectDemos.tsx](components/Portfolio/Projects/ProjectDemos.tsx) | Accessible demo tabs, recorded video playback and measured height transitions |
| [project.module.css](components/Portfolio/Projects/project.module.css) | Project-specific composition using the shared dark palette and geometry |

Use rendered, active components as examples. The older `.demoButton` and `.closeDemo` CSS rules are not the current demo control; `ProjectShowcase` uses `.demoToggle`.

### Production project pages

The project reference is **`/projects/personal-ai`**, reached from the Personal AI tab on the homepage. The shared case-study template also powers `/projects/stock-ai`, `/projects/shortcuts`, `/projects/remainder-api` and `/projects/automation-manager`. Each page links back to all projects. `/projects/reminders` remains the functional playground.

The approved dark design now lives in `components/Portfolio`. Former `/preview/dark` URLs permanently redirect to their production counterparts. The replaced landing, case-study and chat presentation code has been removed; the experimental `components/PortfolioPreview` and `components/ModelIntroduction` folders and their preview routes are retained. The shared chat uses one presentation on every route, and live pages inherit indexable metadata with a device-width viewport.

Use `ProjectShell` for consistent navigation, footer and the existing separate `ChatWindow`. Project navigation names the page's own sections. The hero uses the same silver display gradient and pill actions as the landing page; a compact example conversation demonstrates the product and leads into the live assistant. Label example content clearly.

Compose the case study from open editorial sections with numbered labels and fine dividers. On desktop, pair the architecture introduction with expandable steps; stack these on mobile. Reuse the shared spring for disclosures, rotating plus controls, tab selection and container resizing. Demo tabs support arrow keys, Home and End, pause outgoing recordings, and fit the selected panel's measured height. Videos play only on request; preserve native playback controls and a direct-video fallback. Honour reduced motion throughout.

The demo frame uses the shared 1.5rem outer radius (1.2rem on mobile), with a 1rem nested media frame. Keep the pure-black canvas and shared text, border and action colours. Explain the current implementation accurately and distinguish historical recordings or architecture from the live product.

## Theme colours

The canvas is **`#000000`**, including the surrounding document on production routes. Large empty areas remain black. Separate content through tonal changes, fine borders and typography. Reserve colour for meaningful details inside project previews and error states.

| Role | Current value | Example |
| --- | --- | --- |
| Canvas | `#000` | Page, hero, video backing |
| Main text / `--ink` | `#f5f5f7` | Headings, primary labels |
| Secondary text / `--secondary` | `#aaaab0` | Descriptions, navigation |
| Muted text / `--muted` | `#929298` | Section labels, dates, metadata |
| Divider / `--line` | `#29292c` | Sections and experience rows |
| Base surface / `--surface` | `#101011` | Baseline for quiet elevated surfaces |
| Primary action | `#f5f5f7` fill, `#111` text | “Explore my work”, “Say hello” |
| Primary hover | `#dcdcdf` | Filled action hover |
| Secondary action | Black at 30%, border `#555558` | “View résumé”, “Copy email” |
| Secondary hover | Fill `#171719`, border `#9a9a9e` | Outlined action hover |
| Card border | `#414145` | Project stage, chat panel |
| Nested preview | Fill `#030303`, border `#5d5d62` | Product window |
| Navigation selection | `#1b1b1e` | Moving navigation pill |
| Selected project tab | Gradient `#38383b` → `#2a2a2d` | Active segmented tab |

The hero's silver second line uses `linear-gradient(180deg, #f2f2f4 6%, #a3a3a8 60%, #646469 100%)` clipped to text. Reserve this for large display text; ordinary copy uses solid colours.

The project stage uses `linear-gradient(125deg, #202023 -30%, #0c0c0d 45%, #080809)`: a slight tonal lift over the canvas.

### Chat palette

| Role | Current value |
| --- | --- |
| Panel | `#09090a` |
| Header | Gradient `#19191c` → `#0d0d0e` |
| Composer area | `#101012` |
| Input surface | `#1b1b1f`, border `#414149` |
| Input focus | Border `#8f8f99`, 3px white halo at 4% |
| User bubble | `#232326`, border `#38383e` |
| Assistant response | Text `#e0e0e6`, open panel background |
| Suggestion | Gradient `#19191c` → `#111113`, border `#303034` |
| Suggestion hover | Fill `#242428`, border `#55555d` |
| Send enabled | `#f0f0f4` fill, `#111` icon |
| Send disabled | `#333339` fill, `#909099` icon |
| Error | `#201817` fill, `#74524f` border, `#efd1cb` text |

Muted green, blue and lavender in the StockAI sample (`#c7dfc0`, `#c1d2db`, `#c1d6be`, `#cfc1dc`) are content accents. They do not establish accent colours for site navigation or primary buttons. Keep palette values in CSS Modules or shared tokens; reuse the matching role before adding another near-identical grey.

## Shape, borders and radius

Use generous outer corners and smaller nested corners. Pills indicate actions or segmented selection. Circles belong to compact standalone controls and identity marks. Standard borders are **1px solid**. Pixel equivalents below assume a 16px root size; retain `rem` in implementation.

| Component | Radius | Example / relationship |
| --- | --- | --- |
| Main buttons, tab rail/selection, nav highlight, chat launcher | `999px` | Full pills |
| Monogram, menu toggle, disclosure icon, chat close/send controls | `50%` | Circular controls |
| Project stage | `1.5rem` (24px) | Outer border wraps the animated height |
| Project stage at ≤700px | `1.2rem` (19.2px) | Tighter mobile frame |
| Nested product window | `1rem` (16px); mobile `0.75rem` (12px) | Smaller than its parent card |
| Embedded video | `0.75rem` (12px) | Contained in the project stage |
| Mobile navigation | `1.25rem` (20px) | Floating menu sheet |
| Chat panel | `1.75rem` (28px); ≤600px `1.3rem` (20.8px) | Largest functional surface |
| Chat suggestion | `0.85rem` (13.6px) | Nested row control |
| Chat composer | `1.05rem` (16.8px) | Rounded multiline input container |
| User message | `1.1rem 1.1rem 0.3rem 1.1rem` | Smaller bottom-right corner identifies sender side |
| Error message | `0.9rem` (14.4px) | Contained feedback |
| Small AI badge | `0.3rem` (4.8px) | Compact avatar label |

A new primary action should borrow the pill shape from “Explore my work”; a nested preview should borrow the product window's smaller radius. Preserve the relationship between parent and child shapes.

## Typography and icons

Use `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`, optical sizing, and antialiased rendering. Use `var(--font-geist-mono), monospace` for terminal-style content only.

| Role | Size | Weight / line-height / tracking |
| --- | --- | --- |
| Hero title, desktop | `clamp(4rem, 8.65vw, 7.8rem)` | `600 / 0.99 / -0.055em` |
| Hero title, mobile | `clamp(2.85rem, 11.15vw, 4.8rem)` | `600 / 1.05 / -0.062em` |
| Hero description | `1.4rem`; mobile `1.025rem` | Line-height `1.5`, mobile `1.6` |
| Section heading | `clamp(2.2rem, 4.1vw, 3.65rem)` | `550 / 1.1 / -0.045em` |
| Project heading | `clamp(1.9rem, 2.65vw, 2.5rem)` | `550 / 1.15 / -0.045em` |
| About / section introduction | `1.2rem` | Line-height `1.6–1.65` |
| Project body | `1rem`; mobile `0.95rem` | Line-height `1.6` |
| Numbered section label | `0.75rem`; mobile `0.65rem` | Uppercase, `0.075em` tracking |
| Chat welcome heading | `clamp(1.8rem, 4vw, 2.2rem)` | `550 / 1.15 / -0.045em` |
| Chat message | `0.875rem` | Line-height `1.7` |
| Chat composer | `0.85rem`; mobile `1rem` | Line-height `1.5` |

Use weight, spacing and line-height together. Tight tracking belongs to display headings; paragraphs and responses need comfortable leading. Tiny labels in existing previews/chat are supporting metadata, not size references for new body copy or essential instructions.

Use Lucide outline icons with restrained strokes, generally `1.5–2`. Action icons are typically 16–19px; demo icons 13–14px; tool-group icons 30px desktop and 24px mobile. External destinations use `ArrowUpRight`; downward exploration uses `ArrowDown`; disclosure uses a rotating `Plus`; dismissal uses `X`. Keep icons subordinate to labels and mark decorative icons `aria-hidden`.

## Layout and spacing

Keep the page as open editorial sections. Reserve frames for the featured project, actual UI previews, navigation overlays and chat.

| Layout | Current reference |
| --- | --- |
| Desktop content/navigation | `width: min(100% - 10rem, 75rem)`, centred |
| At ≤1100px | `width: calc(100% - 5rem)` |
| At ≤700px | `width: calc(100% - 2.75rem)` |
| Section label / content columns | `15rem minmax(0, 1fr)`, gap `2rem` |
| Intermediate label column | `11rem`; mobile becomes one column |
| Section breathing room | Usually `3–7rem` vertically; mobile mostly `2.5–4rem` |
| Project interior | Columns `0.9fr 1.3fr`, gap/padding `3rem` |
| Project interior at ≤1100px | Gap/padding `2rem` |
| Project interior at ≤700px | One column, gap `1.8rem`, padding `1.75rem 1.25rem` |
| Main action | Min-height `3.3rem`, padding `0.85rem 1.6rem`; mobile min-height `3rem` |
| Experience row | Full-width trigger, vertical padding `2rem`; mobile `1.5rem` |
| Anchor clearance | `scroll-margin-top: 7.5rem` |

Use small gaps (`0.5–1rem`) within a control group, medium gaps (`1.5–3rem`) between related blocks, and large gaps between sections. Keep text widths readable.

Contact uses a centred heading, primary email action, secondary copy action, selectable address and a reserved status line. Feedback should not move neighbouring controls. The footer is a quiet divided row, stacked on mobile with distributed links.

## Materials and depth

| Surface | Treatment |
| --- | --- |
| Fixed header | Black at 76%, 22px backdrop blur, fading lower edge |
| Mobile menu | `rgb(18 18 20 / 96%)`, 28px blur, `0 24px 64px` black shadow at 70% |
| Chat launcher | `rgb(22 22 25 / 92%)`, 20px blur, `0 8px 32px` black shadow at 45% |
| Product window | `0 20px 50px` black shadow at 40% |
| Chat scrim | Black at 58%, 5px backdrop blur |
| Chat panel | Near-black, `0 32px 100px #000`, inset white highlight at 6% |

Blur belongs to floating chrome and overlays. Opaque black and near-black surfaces are intentional. Use restrained inset highlights to suggest edges; avoid broad coloured glows or refractive effects in ordinary content.

Hero content, planet and hint use local layers `1`, `3`, and `4`. Navigation is at `40`, the chat launcher at `45`, and the skip link at `100`. Chat uses a native modal `<dialog>` in the browser's top layer.

## Component behavior

### Navigation and tabs

Desktop navigation uses text labels, a moving pill for hover/focus/current location, and a right-aligned contact action. At ≤700px, use the circular menu trigger and floating menu. Close on selection, outside interaction, or Escape; return focus appropriately.

Project tabs use a single pill rail and shared moving selection surface. Only the selected panel is interactive. Retain Arrow Left/Right and Home/End behavior, `aria-selected`, panel associations and `inert` on inactive panels.

### Featured projects and Watch demo

The outer project stage owns the border, radius, background and animated height. Measure the **selected panel's natural height**, including responsive changes and video metadata. Hidden panels must not determine the fitted height.

“Watch demo” crossfades the preview into a contained video and becomes “Close demo” in the same button. The card springs to the new height, while text/media positions adjust without stretching their contents. Closing reverses the transition. Keep the toggle mounted to retain keyboard focus. Pause playback on close or project change. Videos use `object-fit: contain`, `height: auto`, and an `18rem` maximum height.

### Experience disclosure

Use divided rows with year, company, role and short summary. The circular plus rotates 45 degrees into a close-like mark. Details expand in place without a height jump. Closed content uses the existing hidden/inert state attributes so it is not an interactive destination.

### Chat

Keep `ChatWindow.tsx` and `chat.module.css` separate from the page composition/styles. Reuse the shared conversation, assistant transport and tools; avoid a second disconnected history.

Desktop chat is a bottom-right panel up to `29rem` wide and `44rem` high, within `1.75rem` viewport padding. At ≤600px it fills available width with `0.6rem` safe-area-aware outer padding. The header and composer stay in place; the transcript scrolls independently.

The sequence is identity/header → welcome or conversation → site-action preference → full-width composer → quiet AI note. Suggestions populate an editable draft. User messages align right in a filled bubble; assistant messages align left on the open surface. Show thinking feedback immediately, a restrained error treatment when needed, and disabled empty/duplicate submissions during requests.

Preserve history and draft on close/reopen. Enter sends; Shift+Enter adds a line; composition input must not send prematurely. Native dialog behavior supplies modal focus containment. Escape, close, and scrim dismissal return to the launcher. “Site actions” remains explicit and off by default.

## Animation consistency

### Shared vocabulary

Use the installed Motion/Framer Motion engine through `motion/react`. Import the shared spring from `Motion.tsx` for related interactions:

```tsx
import { motion } from "motion/react";
import { spring, useMotionPreference } from "./Motion";

// Current shared spring:
// { type: "spring", stiffness: 320, damping: 36 }
```

Springs govern interactive geometry and position. Short duration-based transitions govern opacity and colour. Retarget from the current presentation state so fast actions and reversals remain continuous. Do not add a waiting period before a control responds.

| Interaction | Normal motion |
| --- | --- |
| Button press | Small compression, usually `0.94–0.97`; chat close/send use `0.92` |
| Hover colour/border | Usually `150–180ms` |
| Navigation highlight | Shared layout spring; one pill moves between links |
| Mobile menu | Opacity, `y: -8 → 0`, scale `0.97 → 1`, origin top right |
| Mobile menu items | Shared spring, optional `25ms` stagger per item |
| Selected project tab | Shared layout spring (`dark-project-tab`) |
| Project panel change | Directional `x: ±32 → 0`, scale `0.985 → 1`, opacity `240ms` |
| Project stage height | Shared spring to observed content height |
| Demo media change | `220ms` fade with `8px` vertical movement; `AnimatePresence` with `popLayout` |
| Project copy/media/toggle reposition | `layout="position"`, shared spring |
| Experience details | Height `0 ↔ auto`, shared spring, opacity `200ms`, content offset up to `10px` |
| Disclosure icon | `0 ↔ 45deg`, shared spring |
| Chat launcher hover | `y: -3`; press scale `0.96` |
| Chat open/close | Opacity, `y: 28 ↔ 0`, scale `0.96 ↔ 1`, shared spring, origin bottom right |
| Chat scrim | `180ms` opacity |
| New chat message | Opacity and `y: 8 → 0`, shared spring |
| Section reveal | Once on entry: `y: 14 → 0`, opacity `0.7 → 1`, `500ms`, easing `[0.22, 1, 0.36, 1]` |

Match the nearest interaction example before introducing another spring, easing curve or stagger. Small fades can accompany a spring. Do not use fixed timeouts to sequence user input.

Prefer transform and opacity for decorative movement. Animated height is an intentional exception for disclosure and demo fitting, where surrounding content must reflow. Observe natural content separately from the animated shell to avoid measurement feedback loops. Clean up observers and stop inactive media.

### Planet horizon

The current bounded hero section is **`150svh` on desktop**, **`180svh` on mobile**, with a `100svh` sticky stage. These lengths control how much scrolling the transition takes.

The planet starts below the headline with a shallow, luminous horizon:

- Width `max(240vw, 190svh)`, aspect ratio `1.4`, radius `50%`.
- Top edge `79%` of the stage; mobile `82%`.
- Transform origin `50% 0`, anchoring the flattening to its upper horizon.
- Border `#7d7d85`; radial fill `#202025 → #09090b → #000`.
- Rim light `0 -8px 36px rgb(183 183 214 / 7%)` plus a restrained inset highlight.

Map normalized section progress directly with `useScroll` and `useTransform`:

| Property | Start → end |
| --- | --- |
| Planet vertical position | `0svh → -115svh` |
| Planet horizontal scale | `1 → 2.8` |
| Hero content vertical position | `0 → -60px` |
| Hero content scale | `1 → 0.96` |
| Hint opacity | `1 → 0` over the first 15% of progress |

The planet must **cover** the hero from the foreground while its curvature steadily decreases. Reverse scrolling restores position and shape. Keep the surface opaque enough to occlude the headline and preserve direct anchor navigation. Avoid scroll hijacking, artificial holds, or spring lag on this direct scroll mapping.

## Responsive and accessible alternatives

| Condition | Adaptation |
| --- | --- |
| ≤1100px width | Narrow gutters/label columns and reduce card padding |
| ≤700px width | Mobile navigation, stacked layouts, smaller outer radii |
| ≤600px width | Chat fills available width; composer text becomes `1rem` |
| ≤360px width | Compact hero action type/padding |
| ≤750px height | Earlier hero content, smaller heading, tighter spacing |
| ≤650px height | Compact chat welcome spacing |
| Reduced motion | Static planet and non-sticky hero, no parallax/press scale, immediate fitted project height, short `100–120ms` fades where useful |
| Reduced transparency | Solid navigation/launcher surfaces without blur; chat scrim black at 85% without blur |
| Increased contrast | Brighter secondary text/dividers, stronger borders, solid hero text |

Read motion preferences through `useMotionPreference`, whose server snapshot is the quiet state. Keep server and initial client output consistent. Native scroll and reduced-motion paths must still expose content and actions.

Preserve visible focus: the page uses a 2px white outline with 6px offset; chat controls use a 2px `#e8e8ec` outline with 4px offset. The composer uses its focused container border/halo. Ensure clipping and animation do not conceal focus. Give new touch controls comfortable hit areas, preferably at least 44px. Keep essential information out of tiny metadata styles.

Do not depend on hover, animation, or colour alone to convey state. Maintain accessible names, selected/expanded states, live feedback, inert hidden content, safe-area spacing and keyboard dismissal.

## Implementation and review rules

1. Start from the nearest reference component and the **Apple design skill**.
2. Keep the black canvas, silver hierarchy, role-based radii and sparse surface framing consistent.
3. Use CSS Modules for component styling. Keep chat separate and preserve route-scoped overrides.
4. Share motion primitives for equivalent actions; match opening/closing paths and retain focus across content changes.
5. Check actual content and loaded media. Fit active content without horizontal overflow or abrupt resizing.
6. Verify relevant interactions in Ego Lite on desktop and mobile, including fast reversals, long content and reduced motion. Run type/lint checks for component changes and a production build when routing or style integration changes warrant it.
7. Update this document when an approved visual or motion rule changes. Documentation-only edits do not require application tests.

## Original-site guidance archive

The following is preserved for maintenance of **unmigrated original-site components**. Its requirements for glass primary actions, 14px controls and avoiding pills **do not apply to the approved dark redesign above**. When intentionally migrating a page, use the new system consistently.

<details>
<summary>Previous cinematic glass design guidance</summary>

# Original glass design

Design guidance for this portfolio. Use this when changing layout, surfaces, buttons, navigation, modals, or project pages.

## Design Direction

The interface is a dark, cinematic glass system: black/slate backgrounds, translucent surfaces, restrained typography, and small luminous accents. It should feel technical and polished without becoming glossy for its own sake.

The glass language is strongest in:

- `components/GlassSurface.tsx` and `components/GlassSurface.css` for refractive navigation and icon glass.
- `components/ui/FluidGlass.tsx` for soft frosted panels and primary actions.
- `components/Buttons/GlassButton.tsx` for primary buttons.
- `components/ui/floating-navbar.tsx` for the dock navigation pattern.
- `app/styles/themeClasses.ts` for reusable semantic class recipes.
- `app/globals.css` for primitive and semantic color tokens.

## Glass Surface Language

Glass surfaces should have four layers:

1. A transparent or semi-transparent tint.
2. Backdrop blur and saturation.
3. A fine white border or inset highlight.
4. A subtle glow or shadow only when the element floats above content.

Do not use flat opaque fills for primary glass controls. Prefer `FluidGlass`, `GlassSurface`, or `themeClasses.surface.glass*` recipes.

### Refractive Glass

Use `GlassSurface` for navigation, compact icon controls, dock items, and highly polished floating UI.

Current language:

- `borderRadius={14}` for dock and icon controls.
- `displace={0.5}` with `distortionScale={-180}` for subtle refraction.
- RGB channel offsets: red `0`, green `10`, blue `20`.
- `brightness={50}`, `opacity={0.93}`, `mixBlendMode="screen"`.
- Default tint is the primary accent via `var(--color-accent-primary)`.

Keep this effect rare. It works best where users expect an object-like control: navigation dock, icon buttons, or a special floating control.

### Fluid Glass

Use `FluidGlass` for larger panels, primary buttons, and modal-like surfaces.

Current language:

- `backdrop-blur-3xl`
- `backdrop-saturate-150`
- `border border-glass-border`
- translucent tint such as `rgb(255 255 255 / 0.025)`
- a soft diagonal highlight through the built-in `before:` gradient

Primary buttons use `GlassButton`, which wraps `FluidGlass`. Do not hand-roll another primary button with raw Tailwind classes.

## Shape Rules

Use a rounded rectangle as the default shape:

- Navigation dock: `14px`
- Icon buttons: `14px`
- Primary buttons: `14px`
- Modal/panel corners: around `0.75rem`
- Cards/repeated project items: around `0.5rem` to `0.75rem`

Avoid pill buttons unless the interaction is explicitly a search/input pill or an existing component requires it. The primary button and resume animation should remain rounded rectangles, not circles or pills.

## Color Rules

The page is dark-first. Most surfaces should be black, slate, or transparent glass.

Use semantic tokens rather than raw hex values:

- Background: `background`, `surface`, `elevated`, `glass`, `glass-hover`
- Text: `bright`, `foreground`, `muted`, `faint`
- Borders: `border`, `glass-border`, `glass-border-strong`
- Accent: `accent`, `accent-hover`, `accent-secondary`

The primary accent tint belongs in glass surfaces, but it should be subtle. Use it as atmosphere, focus, or hover energy, not as a flat fill.

## Primary Buttons

Primary buttons should use `GlassButton`:

```tsx
import { GlassButton } from "@/components/Buttons/GlassButton";

<GlassButton className="h-11 w-fit">
  Resume
</GlassButton>
```

Rules:

- Keep `borderRadius="14px"` unless there is a strong layout reason.
- Use compact heights such as `h-10` or `h-11`.
- Keep labels short.
- Use the built-in hover blob layer for hero/primary actions.
- Disable the blob layer only for dense UI where animation would distract.

## Navigation

The floating navigation is the reference object for the system.

Its language:

- Bottom-centered dock.
- Refractive `GlassSurface`.
- 46px base icon controls.
- 14px radius.
- White/glass border with primary tint.
- Icons only, with motion doing the affordance work.

When creating a new floating control, borrow from this dock instead of inventing a separate style.

## Motion

Motion should feel smooth, light, and intentional.

- Use spring motion for shape morphs and dock magnification.
- Use opacity and blur for text exits.
- Avoid large, bouncy, playful motion in functional UI.
- Respect reduced motion paths.

The resume intro animation should morph from a rounded-corner square into the rounded-rectangle primary button.

## Layout

Do not build page sections as nested cards. Use full-width sections and reserve cards for repeated items, modals, previews, and framed tools.

Text should be readable over glass. If a background is noisy, increase glass density rather than making text pure white everywhere.

## Do And Do Not

Do:

- Reuse `GlassButton`, `FluidGlass`, and `GlassSurface`.
- Use semantic tokens from `app/globals.css`.
- Keep glass borders visible.
- Prefer `14px` rounded rectangles for controls.
- Keep accent color subtle and atmospheric.

Do not:

- Add one-off hex colors in components.
- Create new primary button styles by hand.
- Use circle or pill shapes for the resume/primary button animation.
- Use glass without a border or highlight.
- Overuse heavy glows.

</details>
