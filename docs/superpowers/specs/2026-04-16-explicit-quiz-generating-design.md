# Explicit Quiz — Generating Animation

## Overview

Two-phase animation for an AI character generation screen. Phase 1 shows a loading state with a rotating shimmer border around a photo, a progress bar with star particles, and cycling status text. Phase 2 transitions to a revealed state where the photo "comes alive" as a video and a CTA button appears.

**Feature:** Explicit Quiz
**Animation name:** Generating
**Total duration:** ~6.8s (6s loading + 0.8s transition)

## Figma References

- Loading state: `node-id=2235-21962` in `iDDSD4VFs8qqJfYstGOLzh`
- Complete state: `node-id=2231-21907` in `iDDSD4VFs8qqJfYstGOLzh`

## Design Tokens (from Figma)

| Token | Value |
|-------|-------|
| Background | `#110c15` |
| Gradient start | `#B14CEE` |
| Gradient end | `#8049F3` |
| Border color (static) | `#8b4af2` |
| Progress bg | `rgba(255,255,255,0.22)` |
| Status text color | `rgba(255,255,255,0.5)` |
| Font | Poppins Medium 14px, letter-spacing -0.14px |
| Button glow | `0 5px 26px rgba(104,26,199,0.61), 0 1px 4.2px rgba(104,26,199,0.31)` |
| Photo dimensions | 312x520px, border-radius 24px |
| Progress bar | 312x20px, border-radius 32px |
| Button | 240x44px, border-radius 16px |

## Phase 1 — Loading (0–6s)

### Shimmer Border

Rotating iridescent border around the photo container.

- **Technique:** Outer container slightly larger than the photo. Pseudo-element `::before` fills the container with a `conic-gradient` of purple/pink hues (`#8b4af2`, `#b14cee`, `#e879f9`, `#8b4af2`). Rotates via `transform: rotate()`.
- **Animation:** `rotate 2.5s linear infinite`
- **Photo:** Sits inside with `z-index: 1`, clipped with matching `border-radius: 24px`. The ~3px gap between photo edge and container edge reveals the spinning gradient.

### Progress Bar

Fills left-to-right over 6 seconds.

- **Container:** 312x20px, `border-radius: 32px`, background `rgba(255,255,255,0.22)`
- **Fill:** `linear-gradient(141deg, #B14CEE, #8049F3)`, width animates 0% → 100% over 6s (linear timing)
- **Glow edge:** A blurred white element (~48px wide) at the leading edge of the fill, `blur: 3px`, white border, creates a bright "tip" effect
- **Star particles:** 8–12 small white elements (1–6px) inside the filled area. Each has a CSS `@keyframes star-fly` animation moving left-to-right with randomized `animation-delay` and `animation-duration` via inline styles. Varying opacity (0.4–1.0) and sizes create depth.

### Status Text

Cycles through three messages with fade transitions.

- **Messages:** "Analyzing your desires…" → "Crafting her personality…" → "Designing her look…"
- **Timing:** Changes every 2s (at 0s, 2s, 4s)
- **Transition:** 0.3s fade out → 0.3s fade in (CSS opacity transition, JS swaps text content)
- **Style:** Poppins Medium 14px, `rgba(255,255,255,0.5)`, centered, `letter-spacing: -0.14px`

## Phase 2 — Complete (after 6s)

### Timeline

| Time | Event |
|------|-------|
| 6.0s | JS adds `.complete` class to root container |
| 6.0–6.5s | Shimmer border, progress bar, status text fade out (opacity → 0, 0.5s ease) |
| 6.3–6.8s | Video fades in over photo (crossfade), button fades in |
| 6.8s+ | Final state — video loops, button visible |

### Video Reveal

- `<video>` element is present in DOM from the start, hidden with `opacity: 0`, positioned exactly over the photo
- `preload="auto"` ensures it's ready at transition time
- On `.complete`: video gets `opacity: 1` (transition 0.5s), JS calls `video.play()`
- Attributes: `autoplay`, `loop`, `muted`, `playsinline`
- Photo remains underneath — the crossfade is purely opacity-based

### Button

- Appears via fade in (opacity 0 → 1, 0.5s, delayed 0.3s after `.complete`)
- 240x44px, `border-radius: 16px`
- Background: `linear-gradient(130deg, #B14CEE, #8049F3)`
- Shadow: `0 5px 26px rgba(104,26,199,0.61), 0 1px 4.2px rgba(104,26,199,0.31)`
- Text: "Start Fucking", Poppins Medium 14px, white

### Cleanup

- Shimmer border stops rotating and fades (no need to remove from DOM)
- Progress bar and text fade out via CSS transitions triggered by `.complete`

## JS Logic

Minimal JS, mostly CSS-driven:

1. On page load: start shimmer rotation and progress bar animation (pure CSS)
2. `setInterval` every 2s: cycle status text with fade transition (3 steps)
3. `setTimeout` at 6s: add `.complete` class to root, call `video.play()`
4. All phase 2 transitions handled by CSS reacting to `.complete` class

## File Structure

```
downloads/explicit-quiz/
├── assets/
│   ├── girl-photo.jpg         # Static photo for loading phase
│   └── aigirlfriend_2.mp4     # Video for reveal phase
└── generating.html            # Standalone animation file
```

### Snippet Markers

- `/* @snippet:css */` — keyframes: shimmer-rotate, progress-fill, star-fly; transitions for .complete state
- `<!-- @snippet:html -->` — main container with photo, shimmer border, progress bar, status text, video, button

### Catalog Entry (index.html)

```html
<section class="animation"
  data-feature="Explicit Quiz"
  data-name="Generating"
  data-duration="6s (loading) + 0.8s (transition)"
  data-easing="linear (progress), ease (fades)"
  data-file="downloads/explicit-quiz/generating.html"
  data-note="Two-phase: loading progress with shimmer border → video reveal with button">
</section>
```

## Layout

Standalone file includes a phone frame (375x812px, rounded corners, dark background `#110c15`) matching the existing pattern from other animations. Content centered within the frame.

## Out of Scope

- No interactivity on the button (visual only)
- No responsive scaling (fixed 375px mobile viewport)
