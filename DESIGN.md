# DESIGN.md

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

## Project Subpages

Use the Personal AI subpage as the reference for project detail pages:

- Wrap the page in `DottedBackground`.
- Add `FloatingNav` with short anchor labels that map to every major section.
- Keep the content in a centered vertical column: `w-full items-center justify-center flex flex-col lg:px-[10dvw]`.
- Start with `ProjectSpotlightHero`, backed by `ProjectHeroRings`, inside a full-screen `ScrollableSection`.
- Use large gradient hero headings from `themeClasses.gradient.heroHeading`.
- Let the hero animation settle before revealing the caption and CTA.
- Structure the body as stacked `ScrollableSection` blocks with generous viewport spacing, usually `mb-[15dvh]` to `mb-[20dvh]`.
- Use `SectionHeading` for section titles and `ProjectText` for narrative copy.
- Use `ProjectTechStack` for icon rows instead of hand-built tech grids.
- Use `ProjectDetail` for feature and implementation rows. Prefer `multipleCol` for paired media/text sections.
- Put media first and explanatory text second in `ProjectDetail`; on desktop this becomes a `5fr 3fr` grid.
- Keep detail media at stable sizes, commonly `height="300px"` and `width={600}` for diagrams or screenshots.
- Align technical deep-dive copy left on desktop with `lg:text-start`, but keep top-level narrative text centered.
- Use `LinkPreview` sparingly for external source links, related internal demos, and the final GitHub link.
- Leave bottom breathing room after the final section so the floating nav does not crowd the content.

Recommended section order for similar project pages:

1. Hero
2. Why it matters
3. Tech stack
4. Features
5. Workflows or architecture
6. Deep dive / implementation details
7. External demo or repository link

Keep the tone narrative: open with the user-facing value, then move into features, workflows, and implementation. Avoid turning project pages into dashboards or documentation pages; they should feel like guided case studies.

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
