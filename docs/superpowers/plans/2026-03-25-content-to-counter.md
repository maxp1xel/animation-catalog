# Content to Counter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Content to Counter" animation to the catalog under the "Live Now" feature — a bottom sheet slides up, then collapses with content flying to a header counter badge.

**Architecture:** Standalone HTML file at `downloads/live-now/content-to-counter.html` is the source of truth. A minimal `<section>` in `index.html` points to it via `data-file`. Catalog uses iframe for preview and `@snippet` markers for code blocks. Follow the same pattern as `downloads/live-now/chat-button-animation.html`.

**Tech Stack:** Plain HTML + CSS (@keyframes) + vanilla JS (~30 lines). No build step.

**Spec:** `docs/superpowers/specs/2026-03-25-content-to-counter-design.md`

---

## File Map

- **Create:** `downloads/live-now/content-to-counter.html` — standalone animation file with all CSS, HTML, JS
- **Modify:** `index.html` — add `<section>` entry inside `#animations`
- **Reference:** `catalog.js` — no changes needed, auto-discovers sections + uses iframe + @snippet extraction
- **Reference:** `downloads/live-now/chat-button-animation.html` — pattern to follow for file structure and @snippet markers

---

### Task 1: Create standalone file with static layout

**Files:**
- Create: `downloads/live-now/content-to-counter.html`

This task creates the complete standalone HTML file with phone frame, skeletons, header, bottom sheet, and photo card — everything except animation keyframes and JS. The file follows the same pattern as `chat-button-animation.html`: full HTML page, `:root` vars, `@snippet` markers.

- [ ] **Step 1: Create `downloads/live-now/content-to-counter.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content to Counter — Live Now</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap">
  <style>
    /* === Tokens === */
    :root {
      --ctc-sheet-duration: 300ms;
      --ctc-sheet-collapse: 250ms;
      --ctc-fly-duration: 300ms;
      --ctc-badge-pop: 300ms;
      --ctc-pause-idle: 800ms;
      --ctc-pause-sheet: 1100ms;

      --ctc-bg: #1f1825;
      --ctc-header-bg: #1e1727;
      --ctc-overlay-bg: rgba(17,12,21,0.7);
      --ctc-badge-red: #ea3a40;
      --ctc-accent-from: #b14cee;
      --ctc-accent-to: #8049f3;
      --ctc-btn-bg: rgba(255,255,255,0.12);
      --ctc-btn-border: rgba(255,255,255,0.12);
      --ctc-sheet-border: rgba(255,255,255,0.12);
      --ctc-text-tertiary: #9b9caa;
      --ctc-skel: rgba(255,255,255,0.08);
      --ctc-skel-light: rgba(255,255,255,0.12);
      --ctc-font: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* === Reset === */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    /* @snippet:css */
    /* --- Animation Keyframes --- */
    @keyframes ctc-overlay-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes ctc-overlay-out {
      from { opacity: 1; }
      to   { opacity: 0; }
    }
    @keyframes ctc-sheet-in {
      from { transform: translateY(100%); }
      to   { transform: translateY(0); }
    }
    @keyframes ctc-sheet-out {
      from { transform: translateY(0); }
      to   { transform: translateY(100%); }
    }
    @keyframes ctc-fly {
      0%   { transform: translate(0, 0) scale(1); opacity: 1; }
      70%  { opacity: 1; }
      100% { transform: var(--ctc-fly-target); opacity: 0; }
    }
    @keyframes ctc-badge-pop {
      0%   { transform: scale(0); }
      60%  { transform: scale(1.3); }
      80%  { transform: scale(0.9); }
      100% { transform: scale(1); }
    }
    @keyframes ctc-btn-glow {
      0%   { box-shadow: 0 0 0 0 rgba(234,58,64,0.4); }
      50%  { box-shadow: 0 0 12px 4px rgba(234,58,64,0.3); }
      100% { box-shadow: 0 0 0 0 rgba(234,58,64,0); }
    }

    /* --- Phase: sheet in --- */
    .ctc-root.phase-sheet-in .ctc-overlay {
      animation: ctc-overlay-in 200ms ease-out forwards;
    }
    .ctc-root.phase-sheet-in .ctc-sheet {
      animation: ctc-sheet-in var(--ctc-sheet-duration) cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
    }

    /* --- Phase: collapse --- */
    .ctc-root.phase-collapse .ctc-overlay {
      animation: ctc-overlay-out var(--ctc-sheet-collapse) ease-in forwards;
    }
    .ctc-root.phase-collapse .ctc-sheet {
      animation: ctc-sheet-out var(--ctc-sheet-collapse) ease-in forwards;
    }
    .ctc-root.phase-collapse .ctc-flying-card {
      display: flex;
      animation: ctc-fly var(--ctc-fly-duration) ease-in-out forwards;
    }

    /* --- Phase: badge pop --- */
    .ctc-root.phase-badge-pop .ctc-counter-badge {
      animation: ctc-badge-pop var(--ctc-badge-pop) cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
    }
    .ctc-root.phase-badge-pop .ctc-target-btn {
      animation: ctc-btn-glow 400ms ease-out;
    }

    /* --- Counter badge --- */
    .ctc-counter-badge {
      position: absolute;
      top: -4px;
      right: 28px;
      width: 16px;
      height: 16px;
      background: var(--ctc-badge-red);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 500;
      color: white;
      transform: scale(0);
      pointer-events: none;
    }

    /* --- Overlay --- */
    .ctc-overlay {
      position: absolute;
      inset: 0;
      background: var(--ctc-overlay-bg);
      opacity: 0;
      pointer-events: none;
      z-index: 20;
    }

    /* --- Bottom Sheet --- */
    .ctc-sheet {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 420px;
      background: rgba(30,23,39,0.95);
      border-top: 1px solid var(--ctc-sheet-border);
      border-radius: 24px 24px 0 0;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      z-index: 30;
      transform: translateY(100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    .ctc-sheet-divider {
      width: 45px;
      height: 3px;
      background: white;
      border-radius: 40px;
    }
    .ctc-sheet-title {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.4px;
      text-align: center;
    }
    .ctc-sheet-subtitle {
      font-size: 14px;
      color: var(--ctc-text-tertiary);
      letter-spacing: -0.14px;
      text-align: center;
      margin-bottom: 4px;
    }

    /* --- Photo Card --- */
    .ctc-photo-card,
    .ctc-flying-card {
      width: 220px;
      height: 296px;
      border-radius: 12px;
      border: 1px solid var(--ctc-accent-from);
      background: linear-gradient(160deg, rgba(177,76,238,0.4) 0%, rgba(80,30,160,0.6) 100%);
      backdrop-filter: blur(22px);
      -webkit-backdrop-filter: blur(22px);
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      box-shadow: 0 0 12px rgba(128,0,255,0.13);
    }
    .ctc-card-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      right: 12px;
      height: 20px;
      border-radius: 36px;
      background: linear-gradient(-21deg, rgba(177,76,238,0.9) 27%, rgba(142,71,220,0.9) 100%);
      border: 1px solid rgba(255,255,255,0.06);
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .ctc-card-lock { font-size: 20px; opacity: 0.8; }
    .ctc-card-text-main {
      font-size: 14px;
      font-weight: 500;
      color: #e9f2ff;
      text-align: center;
    }
    .ctc-card-text-sub {
      font-size: 10px;
      font-weight: 500;
      color: rgba(217,209,220,0.8);
      text-align: center;
      line-height: 1.4;
    }
    .ctc-card-btn {
      width: 100%;
      height: 32px;
      border-radius: 12px;
      background: linear-gradient(134deg, var(--ctc-accent-from) 7%, var(--ctc-accent-to) 100%);
      box-shadow: 0 5px 26px rgba(104,26,199,0.61), 0 1px 4px rgba(104,26,199,0.31);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 500;
      color: white;
    }

    /* --- Flying Card (clone for flight) --- */
    .ctc-flying-card {
      position: absolute;
      z-index: 40;
      display: none;
    }
    /* @snippet:end */

    /* === Layout === */
    body {
      background: #0d0d1a;
      font-family: var(--ctc-font);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }

    /* --- Phone frame --- */
    .ctc-root {
      position: relative;
      width: 375px;
      height: 812px;
      background: var(--ctc-bg);
      border-radius: 32px;
      border: 1px solid rgba(255,255,255,0.12);
      overflow: hidden;
      font-family: var(--ctc-font);
      color: white;
      display: flex;
      flex-direction: column;
    }

    /* --- Status bar skeleton --- */
    .ctc-status-bar {
      height: 52px;
      background: var(--ctc-header-bg);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
    }
    .ctc-status-time { font-size: 15px; font-weight: 700; color: white; }
    .ctc-status-icons { display: flex; gap: 6px; }
    .ctc-status-icons span {
      display: block; width: 18px; height: 10px;
      background: var(--ctc-skel-light); border-radius: 3px;
    }

    /* --- Header (precise) --- */
    .ctc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      flex-shrink: 0;
      position: relative;
      z-index: 10;
    }
    .ctc-header-left { display: flex; align-items: center; gap: 12px; }
    .ctc-btn-back {
      width: 32px; height: 32px;
      background: var(--ctc-btn-bg);
      border: 1px solid var(--ctc-btn-border);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .ctc-btn-back::after {
      content: ''; display: block; width: 8px; height: 8px;
      border-left: 2px solid white; border-bottom: 2px solid white;
      transform: rotate(45deg); margin-left: 2px;
    }
    .ctc-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, var(--ctc-accent-from), var(--ctc-accent-to));
      flex-shrink: 0;
    }
    .ctc-name { font-size: 16px; font-weight: 500; letter-spacing: -0.32px; }
    .ctc-header-actions { display: flex; gap: 8px; position: relative; }
    .ctc-action-btn {
      width: 32px; height: 32px;
      background: var(--ctc-btn-bg);
      border: 1px solid var(--ctc-btn-border);
      border-radius: 12px;
    }

    /* --- Chat messages skeletons --- */
    .ctc-messages {
      flex: 1; padding: 8px 16px;
      display: flex; flex-direction: column; gap: 10px;
      justify-content: flex-end; overflow: hidden;
    }
    .ctc-msg {
      height: 20px; background: var(--ctc-skel);
      border-radius: 10px; flex-shrink: 0;
    }
    .ctc-msg--right { align-self: flex-end; }
    .ctc-msg--left { align-self: flex-start; }
    .ctc-msg--w60 { width: 60%; }
    .ctc-msg--w45 { width: 45%; }
    .ctc-msg--w70 { width: 70%; }
    .ctc-msg--w50 { width: 50%; }
    .ctc-msg--w40 { width: 40%; }
    .ctc-msg--purple {
      background: linear-gradient(113deg, rgba(177,76,238,0.3) 7%, rgba(128,73,243,0.3) 100%);
    }

    /* --- Chat input skeleton --- */
    .ctc-input-bar { padding: 8px 16px; flex-shrink: 0; }
    .ctc-input-skel { height: 44px; background: var(--ctc-skel); border-radius: 12px; }

    /* --- Tab bar skeleton --- */
    .ctc-tab-bar {
      display: flex; justify-content: space-around;
      padding: 10px 16px 16px; flex-shrink: 0;
    }
    .ctc-tab-dot {
      width: 28px; height: 28px;
      background: var(--ctc-skel); border-radius: 50%;
    }
  </style>
</head>
<body>
  <div class="ctc-root">
    <!-- Status bar skeleton -->
    <div class="ctc-status-bar">
      <span class="ctc-status-time">9:41</span>
      <div class="ctc-status-icons"><span></span><span></span><span></span></div>
    </div>

    <!-- @snippet:html -->
    <!-- Header (precise) -->
    <div class="ctc-header">
      <div class="ctc-header-left">
        <div class="ctc-btn-back"></div>
        <div class="ctc-avatar"></div>
        <span class="ctc-name">Mia</span>
      </div>
      <div class="ctc-header-actions">
        <div class="ctc-action-btn"></div>
        <div class="ctc-action-btn"></div>
        <div class="ctc-action-btn ctc-target-btn"></div>
        <div class="ctc-counter-badge">1</div>
      </div>
    </div>

    <!-- Chat messages skeletons -->
    <div class="ctc-messages">
      <div class="ctc-msg ctc-msg--right ctc-msg--w45 ctc-msg--purple"></div>
      <div class="ctc-msg ctc-msg--left ctc-msg--w70"></div>
      <div class="ctc-msg ctc-msg--left ctc-msg--w60"></div>
      <div class="ctc-msg ctc-msg--right ctc-msg--w40 ctc-msg--purple"></div>
      <div class="ctc-msg ctc-msg--left ctc-msg--w50"></div>
      <div class="ctc-msg ctc-msg--right ctc-msg--w45 ctc-msg--purple"></div>
    </div>

    <!-- Overlay -->
    <div class="ctc-overlay"></div>

    <!-- Bottom Sheet -->
    <div class="ctc-sheet">
      <div class="ctc-sheet-divider"></div>
      <div class="ctc-sheet-title">Ready to see?</div>
      <div class="ctc-sheet-subtitle">Saved to chat media. You can always see it</div>
      <div class="ctc-photo-card">
        <div class="ctc-card-tag">My secret shot</div>
        <div class="ctc-card-lock">🔒</div>
        <div class="ctc-card-text-main">Yours Forever</div>
        <div class="ctc-card-text-sub">Unlock me and keep me pinned forever</div>
        <div class="ctc-card-btn">Unlock for 100</div>
      </div>
    </div>

    <!-- Flying card (clone for flight animation) -->
    <div class="ctc-flying-card">
      <div class="ctc-card-tag">My secret shot</div>
      <div class="ctc-card-lock">🔒</div>
      <div class="ctc-card-text-main">Yours Forever</div>
      <div class="ctc-card-text-sub">Unlock me and keep me pinned forever</div>
      <div class="ctc-card-btn">Unlock for 100</div>
    </div>
    <!-- @snippet:end -->

    <!-- Chat input skeleton -->
    <div class="ctc-input-bar"><div class="ctc-input-skel"></div></div>

    <!-- Tab bar skeleton -->
    <div class="ctc-tab-bar">
      <div class="ctc-tab-dot"></div>
      <div class="ctc-tab-dot"></div>
      <div class="ctc-tab-dot"></div>
      <div class="ctc-tab-dot"></div>
    </div>
  </div>

  <script>
    /* @snippet:js */
    (function() {
      var root = document.querySelector('.ctc-root');
      if (!root) return;

      var flyCard = root.querySelector('.ctc-flying-card');
      var photoCard = root.querySelector('.ctc-photo-card');
      var targetBtn = root.querySelector('.ctc-target-btn');

      // Read timing from CSS variables (keeps JS in sync with CSS)
      var style = getComputedStyle(root);
      var ms = function(prop) { return parseFloat(style.getPropertyValue(prop)) || 0; };
      var PAUSE_IDLE = ms('--ctc-pause-idle');
      var SHEET_IN = ms('--ctc-sheet-duration');
      var PAUSE_SHEET = ms('--ctc-pause-sheet');
      var FLY_DURATION = ms('--ctc-fly-duration');

      function computeFlyTarget() {
        var cardRect = photoCard.getBoundingClientRect();
        var btnRect = targetBtn.getBoundingClientRect();
        var dx = btnRect.left + btnRect.width / 2 - (cardRect.left + cardRect.width / 2);
        var dy = btnRect.top + btnRect.height / 2 - (cardRect.top + cardRect.height / 2);
        var scale = btnRect.width / cardRect.width;
        root.style.setProperty('--ctc-fly-target',
          'translate(' + dx + 'px, ' + dy + 'px) scale(' + scale.toFixed(3) + ')');
      }

      function positionFlyCard() {
        var rootRect = root.getBoundingClientRect();
        var cardRect = photoCard.getBoundingClientRect();
        flyCard.style.left = (cardRect.left - rootRect.left) + 'px';
        flyCard.style.top = (cardRect.top - rootRect.top) + 'px';
        flyCard.style.width = cardRect.width + 'px';
        flyCard.style.height = cardRect.height + 'px';
      }

      // Phase 2: sheet appears
      setTimeout(function() {
        root.classList.add('phase-sheet-in');
      }, PAUSE_IDLE);

      // Phase 4: collapse + fly
      // Compute positions BEFORE removing phase-sheet-in (card must be visible)
      setTimeout(function() {
        computeFlyTarget();
        positionFlyCard();
        requestAnimationFrame(function() {
          root.classList.remove('phase-sheet-in');
          root.classList.add('phase-collapse');
        });
      }, PAUSE_IDLE + SHEET_IN + PAUSE_SHEET);

      // Phase 5: badge pop
      setTimeout(function() {
        root.classList.remove('phase-collapse');
        root.classList.add('phase-badge-pop');
      }, PAUSE_IDLE + SHEET_IN + PAUSE_SHEET + FLY_DURATION);
    })();
    /* @snippet:end */
  </script>
</body>
</html>
```

- [ ] **Step 2: Open `downloads/live-now/content-to-counter.html` directly in browser**

Verify the standalone file works by itself:
- Phone frame (375x812) centered on dark background
- Status bar, header with Mia, skeleton messages, input, tab bar
- After 800ms: overlay + bottom sheet slides up
- After 2200ms: sheet collapses, card flies to header button
- After 2500ms: red counter badge pops in

- [ ] **Step 3: Commit**

```bash
git add downloads/live-now/content-to-counter.html
git commit -m "feat(live-now): add Content to Counter standalone animation file"
```

---

### Task 2: Add section entry to index.html

**Files:**
- Modify: `index.html` — add `<section>` inside `#animations`

- [ ] **Step 1: Add the section entry**

Inside `<div id="animations">`, after the existing Chat Button Animation `</section>`, add:

```html
<section class="animation"
  data-feature="Live Now"
  data-name="Content to Counter"
  data-duration="2.8s"
  data-easing="cubic-bezier(0.2, 0.9, 0.3, 1)"
  data-delay="800ms"
  data-css-vars="--ctc-sheet-duration, --ctc-sheet-collapse, --ctc-fly-duration, --ctc-badge-pop, --ctc-pause-idle, --ctc-pause-sheet"
  data-file="downloads/live-now/content-to-counter.html">
</section>
```

- [ ] **Step 2: Open `index.html` in browser**

Verify:
- Sidebar shows "Live Now" with two animations: "Chat Button Animation" and "Content to Counter"
- Clicking "Content to Counter" loads iframe preview
- Code blocks (CSS, HTML, JS) are extracted from `@snippet` markers
- Download button links to the standalone file
- Replay reloads the iframe

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(live-now): add Content to Counter to catalog index"
```

---

### Task 3: Visual polish and tuning

**Files:**
- Modify: `downloads/live-now/content-to-counter.html`

- [ ] **Step 1: Open catalog, test in iframe context**

Check in the catalog preview (not standalone). The iframe is 500px tall (set by `.preview-iframe` in `styles.css`). The 812px phone frame will be clipped. Either:
- Scale the phone frame to fit: add `transform: scale(0.6); transform-origin: top center;` on `.ctc-root`
- Or adjust the iframe height if needed

- [ ] **Step 2: Fix any visual issues**

Common adjustments:
- Phone frame scale to fit iframe
- `getBoundingClientRect` may need offsets in iframe context
- Badge position `right` offset
- Sheet height relative to phone frame

- [ ] **Step 3: Verify Replay works in catalog**

Click "Replay" — the iframe reloads and animation plays again from the start.

- [ ] **Step 4: Commit**

```bash
git add downloads/live-now/content-to-counter.html
git commit -m "fix(live-now): visual polish for Content to Counter in catalog iframe"
```

---

### Task 4: Update documentation

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add Content to Counter to README**

Read `README.md`. Add "Content to Counter" under the "Live Now" feature in the animation list.

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add Content to Counter to README"
```
