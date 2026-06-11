# Tinted Glass Options

## Current Recommendation

Use the existing `GlassSurface` primitive for high-emphasis controls and add tint through CSS custom properties:

- `tintColor`: color source, usually a semantic token such as `var(--color-accent-primary)`
- `tintOpacity`: strength of the tint overlay
- `tintBlendMode`: how the tint mixes with the glass, usually `screen`, `overlay`, or `soft-light`

This keeps the primary button visually aligned with the navigation dock because both use the same SVG-displacement glass where supported and the same CSS fallback elsewhere.

## Options

### 1. CSS Backdrop Filter With Transparent Tint

This is the most reliable baseline:

```css
.tinted-glass {
  background: rgb(99 102 241 / 0.12);
  backdrop-filter: blur(12px) saturate(1.6) brightness(1.12);
  -webkit-backdrop-filter: blur(12px) saturate(1.6) brightness(1.12);
  border: 1px solid rgb(255 255 255 / 0.18);
}
```

Use this for cards, modals, and simple buttons. It is easy to theme and performs well when used sparingly.

### 2. Pseudo-Element Tint Layer

This is what `GlassSurface` now supports. It adds a tint layer over the glass without changing the displacement filter:

```css
.glass::before {
  background: var(--glass-tint);
  opacity: var(--glass-tint-opacity);
  mix-blend-mode: var(--glass-tint-blend-mode);
}
```

Use this when you want each glass surface to have a contextual tint while preserving one shared component.

### 3. SVG Displacement + Tint Overlay

The navigation dock already uses this approach through `GlassSurface`: SVG displacement creates the refractive edge, while CSS fallback handles Safari/Firefox cases. This is the richest look and should be reserved for important controls, floating navigation, and hero interactions.

### 4. Color-Mix Token System

For a future refinement, define tint tokens with `color-mix()`:

```css
--glass-tint-primary: color-mix(in oklch, var(--color-accent-primary) 18%, transparent);
```

This makes tint strength systematic, but it is slightly harder to reason about than explicit `rgb(... / alpha)` values.

### 5. Dynamic Background-Aware Tint

For project pages with strong video or image backgrounds, a tint could be chosen from the project accent or media palette. This can look premium, but it needs guardrails:

- Cap tint opacity between `0.08` and `0.18`
- Keep text color stable
- Always preserve a white glass border
- Avoid changing tint while the user is reading

## Browser Notes

- `backdrop-filter` is now Baseline 2024, but older browsers and some embedded webviews still need a non-blurred fallback.
- The element must be transparent or semi-transparent for the backdrop effect to be visible.
- CSS and SVG filters can be used together, but SVG filter support inside `backdrop-filter` varies across engines, which is why `GlassSurface` keeps an explicit fallback path.

## Sources

- [MDN: backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)
- [web.dev: Create OS-style backgrounds with backdrop-filter](https://web.dev/articles/backdrop-filter)
- [web.dev: Learn CSS filters](https://web.dev/learn/css/filters)
- [CSS-Tricks: Using CSS backdrop-filter for UI Effects](https://css-tricks.com/using-css-backdrop-filter-for-ui-effects/)

