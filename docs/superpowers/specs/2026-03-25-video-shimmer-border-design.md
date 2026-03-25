# Video Shimmer Border — Design Spec

## Summary

A conic gradient border that rotates around a video player to indicate the next video is being prepared in the background. The shimmer creates a loading/buffering feel without blocking the currently playing video.

## Animation Details

| Property | Value |
|----------|-------|
| Name | Video Shimmer Border |
| Feature | Live Now |
| Type | Conic gradient rotation (`@property`) |
| Duration | `2.5s` per revolution |
| Easing | `linear` (continuous) |
| Delay | `0s` |
| Iteration | `infinite` |
| Colors | `#7a27ec` (purple), `#f162a0` (pink) |
| Background | `#1f1825` (dark purple, from Figma) |
| Border width | `3px` (via `inset` on inner container) |
| Outer glow | `blur(12px)` halo, same gradient at 40% opacity |
| Border radius | `24px` outer / `21px` inner |
| CSS variables | `--shimmer-speed` (duration, default `2.5s`), `--shimmer-size` (border width, default `3px`) |
| Video | `idle.mp4` copied from `/Users/maxim/Coding/live-now/public/videos/idle.mp4` (1.9MB) |

### CSS Variables Clarification

- **`--shimmer-speed`** — controls rotation duration (maps to `animation-duration`)
- **`--shimmer-size`** — controls border width (maps to `inset` value on `.vsb-video`)
- **`--shimmer-angle`** — internal `@property`-registered custom property for animating the conic gradient angle; not user-facing

## HTML Structure

```
.vsb-root              ← container, position: relative, sized to content
├── .vsb-shimmer       ← conic-gradient background + ::after (outer glow)
│   └── animates @property --shimmer-angle from 0deg to 360deg
└── .vsb-video         ← position: absolute, inset: var(--shimmer-size), overflow: hidden
    ├── <video>        ← idle.mp4, loop, muted, autoplay, playsinline
    └── .vsb-overlay   ← top/bottom gradient darkening (background #1f1825)
```

## CSS Approach

1. **`@property --shimmer-angle`** — registered custom property (`<angle>`, initial `0deg`) enabling smooth conic-gradient animation
2. **`.vsb-shimmer`** — `conic-gradient(from var(--shimmer-angle), transparent 0%, #7a27ec 10%, #f162a0 25%, #7a27ec 35%, transparent 45%, transparent 100%)` — partial arc (~35% of circumference) that sweeps around
3. **`.vsb-shimmer::after`** — same gradient at 40% opacity with `blur(12px)` for outer glow effect, positioned `inset: -4px` beyond the shimmer
4. **`.vsb-video`** — `inset: var(--shimmer-size, 3px)` creates the border gap, `border-radius: 21px` matches inner curve, background `#1f1825`
5. **`.vsb-overlay`** — `linear-gradient(to bottom, rgba(31,24,37,0.4) 0%, transparent 25%, transparent 75%, rgba(31,24,37,0.7) 100%)` for top/bottom darkening

## Catalog Integration

### Section element in index.html

```html
<section class="animation"
  data-feature="Live Now"
  data-name="Video Shimmer Border"
  data-duration="2.5s"
  data-easing="linear"
  data-delay="0s"
  data-css-vars="--shimmer-speed, --shimmer-size"
  data-file="downloads/live-now/video-shimmer-border.html">
</section>
```

- Uses **file-based** mode: preview via iframe, code blocks extracted via `@snippet` markers
- No inline `<template>` tags needed (file-based rendering handles everything)

### Standalone file: `downloads/live-now/video-shimmer-border.html`

- Self-contained HTML with embedded CSS
- Video referenced as `idle.mp4` (same directory)
- Uses `/* @snippet:css */` ... `/* @snippet:end */` and `<!-- @snippet:html -->` ... `<!-- @snippet:end -->` markers for catalog code block extraction
- Background color: `#1f1825` to match Figma and catalog preview background (`--bg-preview: #0d0d1a`)

### File placement

- `downloads/live-now/video-shimmer-border.html` — standalone animation file
- `downloads/live-now/idle.mp4` — video file (copied from live-now project)

## Browser Support

- `@property`: Chrome 85+, Edge 85+, Safari 15.4+, Firefox 128+
- Fallback: static gradient border (no rotation) for unsupported browsers

## Figma Reference

- File: `zFdbBbBDIilw96AZQD3x3N`
- Node: `120:4335` (Live now: Start.Playing)
- Colors extracted from design: purple `#7a27ec`, pink `#f162a0`, background `#1f1825`
