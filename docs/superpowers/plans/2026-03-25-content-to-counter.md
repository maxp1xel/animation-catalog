# Content to Counter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Content to Counter" animation to the catalog under the "Live Now" feature — a bottom sheet slides up, then collapses with content flying to a header counter badge.

**Architecture:** Single `<section class="animation">` added to `index.html` containing CSS in `<template class="animation-css">`, HTML in `<template class="animation-html">`, and JS in `<template class="animation-js">`. No new files. All CSS classes prefixed with `ctc-` to avoid collisions with catalog styles and other animations.

**Tech Stack:** Plain HTML + CSS (@keyframes) + vanilla JS (~30 lines). No build step.

**Spec:** `docs/superpowers/specs/2026-03-25-content-to-counter-design.md`

---

## File Map

- **Modify:** `index.html` — add new `<section class="animation">` inside `#animations`
- **Reference:** `catalog.js` — no changes needed, auto-discovers sections
- **Reference:** `styles.css` — no changes needed, animation styles are self-contained in `<template>`

---

### Task 1: Write the CSS — Phone Frame, Skeletons, Header

**Files:**
- Modify: `index.html` (add `<section>` with `<template class="animation-css">`)

All CSS classes use `ctc-` prefix. This task creates the static layout — everything before animation.

- [ ] **Step 1: Add the section shell to index.html**

Inside `<div id="animations">`, after the existing `</section>`, add:

```html
<section class="animation"
  data-feature="Live Now"
  data-name="Content to Counter"
  data-duration="2.8s"
  data-easing="cubic-bezier(0.2, 0.9, 0.3, 1)"
  data-delay="800ms"
  data-css-vars="--ctc-sheet-duration, --ctc-sheet-collapse, --ctc-fly-duration, --ctc-badge-pop, --ctc-pause-idle, --ctc-pause-sheet">

  <template class="animation-css">
/* --- Content to Counter: variables --- */
.ctc-root {
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

/* --- Phone frame (375x812 per spec, scaled to fit preview) --- */
.ctc-root {
  position: relative;
  width: 375px;
  height: 812px;
  transform: scale(0.86);
  transform-origin: top center;
  background: var(--ctc-bg);
  border-radius: 32px;
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
.ctc-status-time {
  font-size: 15px;
  font-weight: 700;
  color: white;
}
.ctc-status-icons {
  display: flex;
  gap: 6px;
}
.ctc-status-icons span {
  display: block;
  width: 18px;
  height: 10px;
  background: var(--ctc-skel-light);
  border-radius: 3px;
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
.ctc-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ctc-btn-back {
  width: 32px;
  height: 32px;
  background: var(--ctc-btn-bg);
  border: 1px solid var(--ctc-btn-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ctc-btn-back::after {
  content: '';
  display: block;
  width: 8px;
  height: 8px;
  border-left: 2px solid white;
  border-bottom: 2px solid white;
  transform: rotate(45deg);
  margin-left: 2px;
}
.ctc-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ctc-accent-from), var(--ctc-accent-to));
  flex-shrink: 0;
}
.ctc-name {
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.32px;
}
.ctc-header-actions {
  display: flex;
  gap: 8px;
  position: relative;
}
.ctc-action-btn {
  width: 32px;
  height: 32px;
  background: var(--ctc-btn-bg);
  border: 1px solid var(--ctc-btn-border);
  border-radius: 12px;
}
/* Counter badge */
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

/* --- Chat messages skeletons --- */
.ctc-messages {
  flex: 1;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: flex-end;
  overflow: hidden;
}
.ctc-msg {
  height: 20px;
  background: var(--ctc-skel);
  border-radius: 10px;
  flex-shrink: 0;
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
.ctc-input-bar {
  padding: 8px 16px;
  flex-shrink: 0;
}
.ctc-input-skel {
  height: 44px;
  background: var(--ctc-skel);
  border-radius: 12px;
}

/* --- Tab bar skeleton --- */
.ctc-tab-bar {
  display: flex;
  justify-content: space-around;
  padding: 10px 16px 16px;
  flex-shrink: 0;
}
.ctc-tab-dot {
  width: 28px;
  height: 28px;
  background: var(--ctc-skel);
  border-radius: 50%;
}
  </template>

  <template class="animation-html">
  </template>

  <template class="animation-js">
  </template>
</section>
```

- [ ] **Step 2: Open in browser, verify the section appears in sidebar under "Live Now"**

Open `index.html` in browser. Click "Live Now" → "Content to Counter". The preview area should be empty (no HTML yet), but sidebar entry must appear.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(live-now): add Content to Counter section shell with CSS layout"
```

---

### Task 2: Write the HTML — Static Layout

**Files:**
- Modify: `index.html` (fill `<template class="animation-html">`)

- [ ] **Step 1: Write the HTML structure**

Replace the empty `<template class="animation-html">` with:

```html
<div class="ctc-root">
  <!-- Status bar skeleton -->
  <div class="ctc-status-bar">
    <span class="ctc-status-time">9:41</span>
    <div class="ctc-status-icons">
      <span></span><span></span><span></span>
    </div>
  </div>

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

  <!-- Chat input skeleton -->
  <div class="ctc-input-bar">
    <div class="ctc-input-skel"></div>
  </div>

  <!-- Tab bar skeleton -->
  <div class="ctc-tab-bar">
    <div class="ctc-tab-dot"></div>
    <div class="ctc-tab-dot"></div>
    <div class="ctc-tab-dot"></div>
    <div class="ctc-tab-dot"></div>
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
</div>
```

- [ ] **Step 2: Open in browser, verify static layout renders**

The phone frame should show: status bar, header with Mia + 3 buttons, skeleton messages, input bar, tab bar. Bottom sheet and overlay should not be visible yet (they start off-screen / transparent).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(live-now): add Content to Counter HTML structure"
```

---

### Task 3: Write the CSS — Overlay, Bottom Sheet, Photo Card

**Files:**
- Modify: `index.html` (append to `<template class="animation-css">`)

- [ ] **Step 1: Add CSS for overlay, bottom sheet, photo card, and flying card**

Append these rules inside the existing `<template class="animation-css">`, after the tab bar styles:

```css
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
.ctc-card-lock {
  font-size: 20px;
  opacity: 0.8;
}
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
```

- [ ] **Step 2: Verify in browser**

Bottom sheet should not be visible (it's `translateY(100%)`). Flying card should not be visible (`display: none`). Overlay should be invisible (`opacity: 0`). The phone frame layout should look clean.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(live-now): add CSS for overlay, bottom sheet, photo card"
```

---

### Task 4: Write the CSS — Animation Keyframes

**Files:**
- Modify: `index.html` (append keyframes to `<template class="animation-css">`)

- [ ] **Step 1: Add all @keyframes and phase classes**

Append these rules inside `<template class="animation-css">`:

```css
/* --- Keyframes --- */
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
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: var(--ctc-fly-target);
    opacity: 0;
  }
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
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat(live-now): add animation keyframes and phase classes"
```

---

### Task 5: Write the JS Orchestrator

**Files:**
- Modify: `index.html` (fill `<template class="animation-js">`)

- [ ] **Step 1: Write the JS that sequences the phases**

Replace the empty `<template class="animation-js">` with:

```js
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

  // Compute fly target: from photo card position to target button position
  function computeFlyTarget() {
    var cardRect = photoCard.getBoundingClientRect();
    var btnRect = targetBtn.getBoundingClientRect();
    var dx = btnRect.left + btnRect.width / 2 - (cardRect.left + cardRect.width / 2);
    var dy = btnRect.top + btnRect.height / 2 - (cardRect.top + cardRect.height / 2);
    var scale = btnRect.width / cardRect.width;
    root.style.setProperty('--ctc-fly-target', 'translate(' + dx + 'px, ' + dy + 'px) scale(' + scale.toFixed(3) + ')');
  }

  // Position flying card over the photo card
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
  // IMPORTANT: compute positions BEFORE removing phase-sheet-in,
  // while the card is still visible and getBoundingClientRect works.
  setTimeout(function() {
    computeFlyTarget();
    positionFlyCard();
    // Now collapse — remove sheet-in, add collapse in next frame
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
```

- [ ] **Step 2: Open in browser, click Replay to test the full animation sequence**

Expected behavior:
1. 0–800ms: static chat
2. 800ms: overlay fades in + sheet slides up
3. 1100–2200ms: sheet stays
4. 2200ms: sheet slides down + overlay fades + card flies to header
5. 2500ms: counter badge pops in with glow

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(live-now): add JS orchestrator for Content to Counter animation"
```

---

### Task 6: Visual Polish and Tuning

**Files:**
- Modify: `index.html` (tweak CSS values, adjust flying card position if needed)

- [ ] **Step 1: Test in browser and compare with Figma screenshots**

Open browser. Check:
- [ ] Phone frame proportions look right (375x812 scaled to ~375x698 in preview)
- [ ] Header matches Figma: back button, avatar, "Mia", 3 action buttons
- [ ] Bottom sheet glass effect looks close to Figma
- [ ] Photo card has purple gradient border, tag, lock, text, button
- [ ] Flying card trajectory goes from center of sheet to the third action button
- [ ] Counter badge appears in correct position (top-right of third button)
- [ ] Timing feels snappy and iOS-like

- [ ] **Step 2: Fix any visual issues found**

Common adjustments:
- `--ctc-fly-target` may need manual offset if `getBoundingClientRect` is off in preview container
- Badge position may need `right` offset adjustment
- Sheet height may need tweaking to fit phone frame

- [ ] **Step 3: Verify Replay works**

Click "Replay" in the catalog. The animation should restart cleanly from step 1.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "fix(live-now): visual polish for Content to Counter animation"
```

---

### Task 7: Update Documentation

**Files:**
- Modify: `README.md` — add "Live Now" feature to the list if not already there

- [ ] **Step 1: Check README.md for existing feature list**

Read `README.md`. If there's a feature/animation list, add:
- **Live Now** → Content to Counter

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add Content to Counter to README"
```
