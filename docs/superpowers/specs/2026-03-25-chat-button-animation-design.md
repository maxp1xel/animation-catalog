# Chat Button Animation — Design Spec

## Overview

Animated icon for the "Go Live" (Play) button in the chat input area of the Live Now feature. The icon has two logical parts — **core** (central shape) and **waves** (arcs radiating left and right). Core vibrates continuously; waves pulse outward in a loop.

## Feature

- **Feature name:** Live Now
- **Animation name:** Chat Button Animation
- **Catalog path:** `downloads/live-now/chat-button-animation.html`

## Source

- **Figma:** `https://www.figma.com/design/zFdbBbBDIilw96AZQD3x3N/Live-now?node-id=134-6638`
- **Key node:** GoLive button `170:6713`, icon `282:6093`

## Approach

Pure CSS animations. No JS. Inline SVG with separate `<g>` groups for core and waves, animated via `@keyframes`.

## SVG Structure

```
<svg viewBox="0 0 16 16">
  <g class="waves-left">
    <path class="wave-near" ... />   <!-- inner arc -->
    <path class="wave-far" ... />    <!-- outer arc -->
  </g>
  <g class="core">
    <path ... />                      <!-- central shape -->
  </g>
  <g class="waves-right">
    <path class="wave-near" ... />   <!-- inner arc, mirrored -->
    <path class="wave-far" ... />    <!-- outer arc, mirrored -->
  </g>
</svg>
```

Arcs use `stroke` (no fill). Core uses `fill`. All white (`#fff`).

## Animations

### Core — Vibrate

- **Keyframes:** `translate` shifts ±1px on X and Y across 5-6 steps to create organic trembling
- **Duration:** `0.4s`
- **Iteration:** `infinite`
- **Easing:** `ease-in-out`

```css
@keyframes core-vibrate {
  0%   { transform: translate(0, 0); }
  20%  { transform: translate(-1px, 0.5px); }
  40%  { transform: translate(0.5px, -1px); }
  60%  { transform: translate(-0.5px, 0.5px); }
  80%  { transform: translate(1px, -0.5px); }
  100% { transform: translate(0, 0); }
}
```

### Waves — Pulse Outward

- **Keyframes:** `scaleX(0.7)` + `opacity: 0` → `scaleX(1)` + `opacity: 1` → `scaleX(1.1)` + `opacity: 0`
- **Duration:** `1.8s`
- **Iteration:** `infinite`
- **Easing:** `ease-out`
- **transform-origin:** `center`
- **Stagger:**
  - `.waves-left`: `delay: 0s`
  - `.waves-right`: `delay: 0.15s`
  - `.wave-far` (both sides): additional `+0.3s` delay vs their `.wave-near`

```css
@keyframes wave-pulse {
  0%   { transform: scaleX(0.7); opacity: 0; }
  30%  { transform: scaleX(1); opacity: 1; }
  100% { transform: scaleX(1.1); opacity: 0; }
}
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--vibrate-duration` | `0.4s` | Core vibration speed |
| `--wave-duration` | `1.8s` | Wave pulse cycle |
| `--wave-stagger` | `0.15s` | Delay between left/right waves |

## Preview Layout (Skeleton)

The standalone HTML file shows the button in context — a simplified chat interface using skeleton elements in Figma's color palette:

- **Background:** `#1f1825` (from Figma)
- **Skeleton header:** rounded rect with circle avatar placeholder, simulating the chat header
- **Skeleton chat bubbles:** 1-2 rounded rects (one left-aligned, one right-aligned with purple gradient border)
- **Detailed area (bottom):**
  - Go Live button: 44x44px, `border-radius: 16px`, gradient background `linear-gradient(-34deg, rgba(241,98,152,0.2) 9%, rgba(122,39,236,0.2) 77%)`, contains the animated SVG icon + "Play" label
  - Input field: `border: 1px solid rgba(255,255,255,0.24)`, `border-radius: 12px`, height 44px, placeholder "Message", send button with purple gradient

## Catalog Integration

### `index.html` section (add after agent finishes)

```
data-feature="live-now"
data-name="Chat Button Animation"
data-duration="0.4s / 1.8s"
data-easing="ease-in-out / ease-out"
data-delay="0s, 0.15s, 0.3s (stagger)"
data-css-vars="--vibrate-duration, --wave-duration, --wave-stagger"
data-file="downloads/live-now/chat-button-animation.html"
```

### Standalone file

`downloads/live-now/chat-button-animation.html` — fully self-contained HTML with inline `<style>`. Contains the skeleton preview layout and the animated button. Same code as `<template>` blocks in `index.html`.

## Out of Scope

- JS interactions (hover, click states)
- Exact reproduction of all chat UI elements (skeletons suffice)
- Mobile responsiveness (catalog is desktop-only)
