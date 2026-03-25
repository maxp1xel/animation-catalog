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
| Iteration | `infinite` |
| Colors | `#7a27ec` (purple), `#f162a0` (pink) |
| Border width | `3px` (via `inset` on inner container) |
| Outer glow | `blur(12px)` halo, same gradient at 40% opacity |
| Border radius | `24px` outer / `21px` inner |
| CSS variables | `--shimmer-speed`, `--shimmer-size` |
| Video | `idle.mp4` (1.9MB, loop, muted, autoplay) |

## HTML Structure

```
.vsb-root              ← container, position: relative, sized to content
├── .vsb-shimmer       ← conic-gradient background + ::after (outer glow)
│   └── animates @property --shimmer-angle from 0deg to 360deg
└── .vsb-video         ← position: absolute, inset: 3px, overflow: hidden
    ├── <video>        ← idle.mp4, loop, muted, autoplay
    └── .vsb-overlay   ← top/bottom gradient darkening
```

## CSS Approach

1. **`@property --shimmer-angle`** — registered custom property (`<angle>`, initial `0deg`) enabling smooth conic-gradient animation
2. **`.vsb-shimmer`** — `conic-gradient(from var(--shimmer-angle), ...)` with transparent gaps creating a partial arc of purple→pink that sweeps around
3. **`.vsb-shimmer::after`** — same gradient at reduced opacity with `blur(12px)` for outer glow effect
4. **`.vsb-video`** — `inset: 3px` creates the border gap, `border-radius: 21px` matches inner curve
5. **`.vsb-overlay`** — subtle top/bottom gradient for depth

## Catalog Integration

- New `<section class="animation">` in `index.html` under feature "Live Now"
- Video file copied to `downloads/live-now/idle.mp4`
- Standalone download file at `downloads/live-now/video-shimmer-border.html`
- Preview uses inline `<style>` with `vsb-` prefix (namespaced, no conflicts)
- Template blocks: CSS, HTML (no JS needed — pure CSS animation)

## Browser Support

- `@property`: Chrome 85+, Edge 85+, Safari 15.4+, Firefox 128+
- Fallback: static gradient border (no rotation) for unsupported browsers

## Figma Reference

- File: `zFdbBbBDIilw96AZQD3x3N`
- Node: `120:4335` (Live now: Start.Playing)
- Colors extracted from design: purple `#7a27ec`, pink `#f162a0`, background `#1f1825`
