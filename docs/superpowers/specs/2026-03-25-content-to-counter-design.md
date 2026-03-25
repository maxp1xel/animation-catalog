# Content to Counter — Animation Design Spec

## Overview

Animation for the "Live Now" feature demonstrating a bottom sheet appearing, then collapsing with its content flying up to a header button where a counter badge appears. This shows the pattern of "saving" content from a modal into a compact indicator.

## Catalog Entry

- **Feature:** Live Now
- **Name:** Content to Counter
- **Slug:** `live-now/content-to-counter`

## Figma References

- State 1 (Chat): `figma.com/design/zFdbBbBDIilw96AZQD3x3N/Live-now?node-id=161-6733`
- State 2 (Bottom sheet open): `figma.com/design/zFdbBbBDIilw96AZQD3x3N/Live-now?node-id=319-9635`
- State 3 (Counter visible): `figma.com/design/zFdbBbBDIilw96AZQD3x3N/Live-now?node-id=320-10115`

## Visual Fidelity

Elements participating in animation are reproduced closely from Figma. Non-animated elements are replaced with skeleton placeholders.

### Precise elements (animated)

- **Header** — back button, avatar (gradient circle), name "Mia", 3 action buttons (32x32, `rgba(255,255,255,0.12)` bg, rounded-12). Third button receives the counter badge.
- **Bottom sheet** — rounded-top-24, glass-effect background, white divider line, title "Ready to see?", subtitle "Saved to chat media. You can always see it", photo card inside
- **Photo card** — 220x296, blurred background with purple gradient border, "My secret shot" tag, lock icon, "Yours Forever" text, "Unlock for 100" button
- **Overlay** — `rgba(17,12,21,0.7)` covering content
- **Counter badge** — 16x16 red circle `#ea3a40` with "1"

### Skeleton placeholders

- Status bar (time, icons — gray rectangles)
- Chat messages — 4-5 rounded rectangles of varying width, alternating left/right, semi-transparent
- Chat input — skeleton bar
- Tab bar — 4 circles

## Phone Frame

- Size: 375x812 (iPhone-like proportions)
- Background: `#1f1825`
- Border-radius: 32px (matching Figma device frame)

## Animation Phases

### Phase 1: Idle (0–800ms)
Chat stands still. Pause so the viewer sees the starting state.

### Phase 2: Bottom sheet appears (800ms → 1100ms)
- Overlay fade in: `opacity 0→0.7`, 200ms, ease-out
- Bottom sheet slide up: `translateY(100%)→translateY(0)`, 300ms, `cubic-bezier(0.2, 0.9, 0.3, 1)` (iOS spring-like)
- Both run simultaneously

### Phase 3: Pause on bottom sheet (1100ms → 2200ms)
Sheet stays visible for 1100ms so the viewer can see the content.

### Phase 4: Collapse + content flight (2200ms → 2700ms)
Simultaneously:
- Bottom sheet slide down: `translateY(0)→translateY(100%)`, 250ms, ease-in
- Overlay fade out: `opacity 0.7→0`, 250ms
- Photo card detaches from bottom sheet and flies toward header button:
  - `transform: translate(start) → translate(target)`
  - `scale(1) → scale(0.15)` (220px card shrinks to ~32px button size)
  - `opacity 1→0` in the last 100ms
  - 300ms, ease-in-out

### Phase 5: Counter badge appears (2500ms → 2800ms)
- Badge scale in: `scale(0)→scale(1.2)→scale(1)`, 300ms — spring pop effect
- Brief glow/pulse on the button, 200ms

**Total cycle: ~2.8s**

## CSS Variables

```css
--sheet-duration: 300ms;
--sheet-collapse: 250ms;
--fly-duration: 300ms;
--badge-pop: 300ms;
--pause-idle: 800ms;
--pause-sheet: 1100ms;
```

## Implementation Approach

CSS @keyframes + minimal JS orchestration.

### HTML Structure

```
.phone-frame
  .status-bar (skeleton)
  .header
    .btn-back (skeleton)
    .avatar + "Mia"
    .header-actions
      .action-btn x3
      .counter-badge (hidden, scale(0))
  .chat-messages (skeletons)
  .chat-input (skeleton)
  .tab-bar (skeleton)
  .overlay (opacity: 0)
  .bottom-sheet (translateY: 100%)
    .divider-line
    .sheet-title "Ready to see?"
    .sheet-subtitle
    .photo-card (220x296)
  .flying-card (display: none) — clone for flight animation
```

### Flight Mechanic

1. At phase 4 start, JS positions `.flying-card` exactly over the original card in the bottom sheet
2. Original card in bottom sheet is hidden
3. `.flying-card` animates via CSS class with `transform` toward the counter badge position
4. After animation, `.flying-card` hides, badge appears

### JS Orchestrator (~30 lines)

```js
setTimeout → add class "phase-sheet-in"
setTimeout → add class "phase-collapse", position flying card
setTimeout → add class "phase-badge-pop"
```

## Design Tokens (from Figma)

- Background: `#1f1825`
- Header bg: `#1e1727`
- Sheet glass bg: radial gradient with `rgba(244,235,255,0.8)` → `rgba(235,235,255,0.3)` at 20% opacity
- Sheet border: `rgba(255,255,255,0.12)`
- Overlay: `rgba(17,12,21,0.7)`
- Badge red: `#ea3a40`
- Accent gradient: `linear-gradient(133deg, #b14cee, #8049f3)`
- Button bg: `rgba(255,255,255,0.12)` with `rgba(255,255,255,0.12)` border
- Text white: `white`
- Text tertiary: `#9b9caa`
- Font: Poppins (Medium, SemiBold, Regular)

## Catalog Integration

Single `<section>` in `index.html` with:
- `data-feature="Live Now"`
- `data-name="Content to Counter"`
- `data-duration="2.8s"`
- `data-easing="cubic-bezier(0.2, 0.9, 0.3, 1)"`
- `data-delay="800ms"`
- `data-css-vars="--sheet-duration, --sheet-collapse, --fly-duration, --badge-pop, --pause-idle, --pause-sheet"`

CSS in `<template class="animation-css">`, HTML in `<template class="animation-html">`, JS in `<template class="animation-js">`. Catalog picks it up automatically.
