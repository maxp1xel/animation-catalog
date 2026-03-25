# Chat Button Animation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a standalone animated preview of the Go Live button icon (core vibrates, waves pulse outward) in a skeleton chat context.

**Architecture:** Single self-contained HTML file with inline CSS. SVG icon with separate `<g>` groups animated via `@keyframes`. Skeleton chat layout provides visual context without reproducing the full UI.

**Tech Stack:** HTML, CSS, inline SVG. No JS, no build step, no dependencies.

**Spec:** `docs/superpowers/specs/2026-03-25-chat-button-animation-design.md`

**Figma reference:** `https://www.figma.com/design/zFdbBbBDIilw96AZQD3x3N/Live-now?node-id=134-6638`

---

## File Map

- **Create:** `downloads/live-now/chat-button-animation.html` — the only deliverable. Fully self-contained standalone HTML with inline `<style>`.

No other files are created or modified. The `index.html` integration (adding `<section>`) happens separately after the catalog agent finishes building `catalog.js`.

---

### Task 1: Create HTML shell with CSS variables and keyframes

**Files:**
- Create: `downloads/live-now/chat-button-animation.html`

- [ ] **Step 1: Create directory and base HTML file**

```bash
mkdir -p downloads/live-now
```

Write `downloads/live-now/chat-button-animation.html` with this content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat Button Animation — Live Now</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap">
  <style>
    /* === Tokens === */
    :root {
      --vibrate-duration: 0.4s;
      --wave-duration: 1.8s;
      --wave-stagger: 0.15s;

      --bg-app: #1f1825;
      --bg-header: rgba(255,255,255,0.06);
      --bg-bubble-model: rgba(255,255,255,0.06);
      --bg-bubble-user-from: rgba(177,76,238,0.5);
      --bg-bubble-user-to: rgba(128,73,243,0.5);
      --border-subtle: rgba(255,255,255,0.12);
      --border-field: rgba(255,255,255,0.24);
      --text-primary: #fff;
      --text-secondary: rgba(255,255,255,0.6);
      --text-muted: #9b9caa;
      --gradient-btn-from: rgb(177,76,238);
      --gradient-btn-to: rgb(128,73,243);
      --gradient-golive-from: rgba(241,98,152,0.2);
      --gradient-golive-to: rgba(122,39,236,0.2);
      --font: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* === Reset === */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    /* === Keyframes === */
    @keyframes core-vibrate {
      0%   { transform: translate(0, 0); }
      20%  { transform: translate(-1px, 0.5px); }
      40%  { transform: translate(0.5px, -1px); }
      60%  { transform: translate(-0.5px, 0.5px); }
      80%  { transform: translate(1px, -0.5px); }
      100% { transform: translate(0, 0); }
    }

    @keyframes wave-pulse {
      0%   { transform: scaleX(0.7); opacity: 0; }
      30%  { transform: scaleX(1); opacity: 1; }
      100% { transform: scaleX(1.1); opacity: 0; }
    }
  </style>
</head>
<body>
  <!-- Content added in subsequent tasks -->
</body>
</html>
```

- [ ] **Step 2: Open in browser, verify blank dark page loads with no console errors**

Open `downloads/live-now/chat-button-animation.html` in a browser. Expect: white page (no body styles yet), no errors in console.

- [ ] **Step 3: Commit**

```bash
git add downloads/live-now/chat-button-animation.html
git commit -m "feat(live-now): scaffold HTML with CSS variables and keyframes"
```

---

### Task 2: Build the animated SVG icon

**Files:**
- Modify: `downloads/live-now/chat-button-animation.html`

The icon from Figma is a broadcast/vibration symbol: a central shape (core) with arc waves on both sides. We recreate it as inline SVG with separate groups so each part can be animated independently.

- [ ] **Step 1: Add SVG icon styles**

Add to the `<style>` block, after the keyframes:

```css
/* === Icon Animation === */
.icon-svg { display: block; }

.icon-svg .core {
  fill: #fff;
  animation: core-vibrate var(--vibrate-duration) ease-in-out infinite;
}

.icon-svg .wave-near,
.icon-svg .wave-far {
  fill: none;
  stroke: #fff;
  stroke-width: 1.2;
  stroke-linecap: round;
  transform-origin: center;
  animation: wave-pulse var(--wave-duration) ease-out infinite;
}

.icon-svg .waves-left .wave-near  { animation-delay: 0s; }
.icon-svg .waves-left .wave-far   { animation-delay: calc(var(--wave-stagger) * 2); }
.icon-svg .waves-right .wave-near { animation-delay: var(--wave-stagger); }
.icon-svg .waves-right .wave-far  { animation-delay: calc(var(--wave-stagger) * 3); }
```

- [ ] **Step 2: Add SVG markup to body**

Replace the body comment with a temporary centered test container and the SVG icon. The icon is 16x16 viewBox, displayed at 64px for easy visual inspection during development. We'll reduce it to 16px when placed inside the button later.

The core is an ellipse. The waves are arc `<path>` elements — two on each side (near and far), mirrored horizontally.

```html
<body style="background: var(--bg-app); display: flex; align-items: center; justify-content: center; min-height: 100vh;">

  <!-- Temporary test: icon at 64px for visual inspection -->
  <svg class="icon-svg" width="64" height="64" viewBox="0 0 16 16" fill="none">
    <g class="waves-left">
      <path class="wave-near" d="M5.5 5.5 Q4 8 5.5 10.5" />
      <path class="wave-far"  d="M4 4 Q1.5 8 4 12" />
    </g>
    <g class="core">
      <ellipse cx="8" cy="8" rx="1.8" ry="2.2" />
    </g>
    <g class="waves-right">
      <path class="wave-near" d="M10.5 5.5 Q12 8 10.5 10.5" />
      <path class="wave-far"  d="M12 4 Q14.5 8 12 12" />
    </g>
  </svg>

</body>
```

- [ ] **Step 3: Open in browser, verify icon renders and animates**

Expect: A white icon (ellipse core + 4 arc strokes) on dark background at 64x64px. Core should tremble rapidly. Wave arcs should pulse in/out with staggered timing. All animation is infinite loop.

Tune SVG paths if arcs don't look right. The exact curvature of the arcs can be adjusted — the key requirement is that they look like broadcast waves emanating from the core.

- [ ] **Step 4: Commit**

```bash
git add downloads/live-now/chat-button-animation.html
git commit -m "feat(live-now): add animated SVG icon with core vibrate and wave pulse"
```

---

### Task 3: Build the Go Live button and input field

**Files:**
- Modify: `downloads/live-now/chat-button-animation.html`

This is the detailed area at the bottom of the preview. The Go Live button (44x44, rounded, gradient) contains the icon. Next to it is the Message input field with a send button.

- [ ] **Step 1: Add button and field styles**

Add to `<style>`, after the icon animation styles:

```css
/* === Layout === */
body {
  background: var(--bg-app);
  font-family: var(--font);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.phone-frame {
  width: 375px;
  height: 680px;
  background: var(--bg-app);
  border-radius: 32px;
  border: 1px solid var(--border-subtle);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* === Chat Panel (bottom) === */
.chat-panel {
  padding: 0 16px 20px;
  display: flex;
  gap: 9px;
  align-items: center;
}

.go-live-btn {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: linear-gradient(-34deg, var(--gradient-golive-from) 9%, var(--gradient-golive-to) 77%);
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  flex-shrink: 0;
  box-shadow: 0 0 128px rgba(0,0,0,0.18), 0 0 21px rgba(0,0,0,0.09);
}

.go-live-btn .icon-svg {
  width: 16px;
  height: 16px;
}

.go-live-label {
  font-family: var(--font);
  font-size: 8px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 14px;
}

.message-field {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--border-field);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 6px 8px 12px;
}

.message-placeholder {
  font-family: var(--font);
  font-size: 14px;
  color: var(--text-primary);
  opacity: 0.6;
  letter-spacing: -0.14px;
}

.send-btn {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: linear-gradient(99deg, var(--gradient-btn-from) 7%, var(--gradient-btn-to) 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 26px rgba(104,26,199,0.61), 0 1px 4px rgba(104,26,199,0.31);
  flex-shrink: 0;
}

.send-icon {
  width: 16px;
  height: 16px;
  fill: #fff;
}
```

- [ ] **Step 2: Replace the temporary test body with the phone frame structure**

Remove the temporary centered SVG. Build the phone frame with the chat panel at the bottom. The skeleton content area will be added in the next task — for now, use a spacer.

```html
<body>
  <div class="phone-frame">
    <!-- Skeleton header and content added in Task 4 -->
    <div style="flex: 1;"></div>

    <!-- Chat Panel — detailed -->
    <div class="chat-panel">
      <button class="go-live-btn" aria-label="Go Live">
        <svg class="icon-svg" viewBox="0 0 16 16" fill="none">
          <g class="waves-left">
            <path class="wave-near" d="M5.5 5.5 Q4 8 5.5 10.5" />
            <path class="wave-far"  d="M4 4 Q1.5 8 4 12" />
          </g>
          <g class="core">
            <ellipse cx="8" cy="8" rx="1.8" ry="2.2" />
          </g>
          <g class="waves-right">
            <path class="wave-near" d="M10.5 5.5 Q12 8 10.5 10.5" />
            <path class="wave-far"  d="M12 4 Q14.5 8 12 12" />
          </g>
        </svg>
        <span class="go-live-label">Play</span>
      </button>

      <div class="message-field">
        <span class="message-placeholder">Message</span>
        <button class="send-btn" aria-label="Send">
          <svg class="send-icon" viewBox="0 0 16 16">
            <path d="M2 8.5l5 3.5V8.5H2zm0-1h5V4L2 7.5zm6.5 4.5l5.5-4-5.5-4v8z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</body>
```

- [ ] **Step 3: Open in browser, verify button and field render correctly**

Expect: Dark phone frame (375x680px) centered on page. At the bottom: Go Live button (44px square, pink-purple gradient, animated icon with "Play" label) next to the Message input field (rounded, bordered, with purple send button). Icon animation should be running.

- [ ] **Step 4: Commit**

```bash
git add downloads/live-now/chat-button-animation.html
git commit -m "feat(live-now): add Go Live button and message field"
```

---

### Task 4: Add skeleton chat context

**Files:**
- Modify: `downloads/live-now/chat-button-animation.html`

Add skeleton elements above the chat panel: a header bar, profile area, and chat bubble placeholders. These use simple rounded rects and circles in Figma's colors — no real content, just enough to show context.

- [ ] **Step 1: Add skeleton styles**

Add to `<style>`:

```css
/* === Skeleton === */
.skeleton-header {
  height: 61px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.skeleton-circle {
  border-radius: 50%;
  background: var(--bg-header);
  flex-shrink: 0;
}

.skeleton-rect {
  border-radius: 8px;
  background: var(--bg-header);
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 16px;
  overflow: hidden;
}

.skeleton-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 0;
}

.skeleton-bubble {
  border-radius: 20px;
  padding: 12px;
  max-width: 260px;
}

.skeleton-bubble--model {
  background: var(--bg-bubble-model);
  align-self: flex-start;
  border-bottom-left-radius: 2px;
}

.skeleton-bubble--user {
  background: linear-gradient(113deg, var(--bg-bubble-user-from) 7%, var(--bg-bubble-user-to) 100%);
  border: 1px solid rgba(255,255,255,0.22);
  align-self: flex-end;
  border-bottom-right-radius: 2px;
}
```

- [ ] **Step 2: Replace the spacer div with skeleton content**

Replace `<div style="flex: 1;"></div>` with:

```html
    <!-- Skeleton Header -->
    <div class="skeleton-header">
      <div class="skeleton-circle" style="width: 32px; height: 32px;"></div>
      <div class="skeleton-circle" style="width: 40px; height: 40px; border: 1px solid #f16298;"></div>
      <div class="skeleton-rect" style="width: 48px; height: 14px;"></div>
      <div style="flex: 1;"></div>
      <div class="skeleton-rect" style="width: 32px; height: 32px; border-radius: 12px;"></div>
      <div class="skeleton-rect" style="width: 32px; height: 32px; border-radius: 12px;"></div>
    </div>

    <!-- Skeleton Content -->
    <div class="skeleton-content">
      <!-- Profile -->
      <div class="skeleton-profile">
        <div class="skeleton-circle" style="width: 72px; height: 72px; border: 1px solid #f16298;"></div>
        <div class="skeleton-rect" style="width: 80px; height: 18px;"></div>
        <div class="skeleton-rect" style="width: 200px; height: 12px; opacity: 0.4;"></div>
      </div>

      <!-- Chat bubbles -->
      <div class="skeleton-bubble skeleton-bubble--model">
        <div class="skeleton-rect" style="width: 200px; height: 12px; opacity: 0.5;"></div>
        <div class="skeleton-rect" style="width: 160px; height: 12px; opacity: 0.3; margin-top: 6px;"></div>
      </div>

      <div class="skeleton-bubble skeleton-bubble--user">
        <div class="skeleton-rect" style="width: 180px; height: 12px; opacity: 0.5; background: rgba(255,255,255,0.15);"></div>
        <div class="skeleton-rect" style="width: 120px; height: 12px; opacity: 0.3; margin-top: 6px; background: rgba(255,255,255,0.1);"></div>
      </div>
    </div>
```

- [ ] **Step 3: Open in browser, verify full preview**

Expect: Phone-shaped frame with skeleton header (circles + rects), profile placeholder, two chat bubbles (one left-aligned gray, one right-aligned purple), and the detailed animated chat panel at the bottom. The Go Live icon should still be animating.

- [ ] **Step 4: Commit**

```bash
git add downloads/live-now/chat-button-animation.html
git commit -m "feat(live-now): add skeleton chat context around animated button"
```

---

### Task 5: Polish and final verification

**Files:**
- Modify: `downloads/live-now/chat-button-animation.html`

- [ ] **Step 1: Add the catalog page background styling**

The standalone file will be viewed both directly and embedded in the catalog's preview area (`#0d0d1a` background). Add a body background that works well standalone (the dark app color is already set) and ensure the phone frame is nicely centered.

**Replace** the existing `body { ... }` rule in `<style>` (added in Task 3) with this updated version:

```css
body {
  background: #0d0d1a;
  font-family: var(--font);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
```

This changes the outer background from `var(--bg-app)` (#1f1825) to `#0d0d1a` (the catalog's preview background), so the phone frame stands out against a slightly darker surround.

- [ ] **Step 2: Open in browser at various zoom levels**

Verify:
- Icon core trembles subtly (1px displacement)
- Wave arcs pulse outward with staggered timing
- Animation loops smoothly with no jank
- Skeleton provides enough context to understand this is a chat input area
- Go Live button gradient is visible
- No console errors

- [ ] **Step 3: Final commit**

```bash
git add downloads/live-now/chat-button-animation.html
git commit -m "feat(live-now): polish standalone preview — final version"
```
