# Explicit Quiz / Generating — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-phase "generating" animation — loading progress with shimmer border → video reveal with button — as a standalone HTML file, and register it in the catalog.

**Architecture:** Single self-contained HTML file (`downloads/explicit-quiz/generating.html`) with inline CSS and JS. CSS-driven animations (shimmer rotation, progress fill, star particles). Minimal JS for text cycling and phase transition. Uses `.complete` class on root to trigger all phase-2 transitions via CSS.

**Tech Stack:** Plain HTML, CSS (`@property`, `conic-gradient`, mask-composite, keyframes), vanilla JS (setTimeout/setInterval). Google Fonts (Poppins). No build step.

**Spec:** `docs/superpowers/specs/2026-04-16-explicit-quiz-generating-design.md`

---

### Task 1: Create directory structure and copy assets

**Files:**
- Create: `downloads/explicit-quiz/assets/` (directory)
- Copy: `downloads/explicit-quiz/assets/aigirlfriend_2.mp4` (from `~/Downloads/`)
- Download: `downloads/explicit-quiz/assets/girl-photo.jpg` (from Figma asset)

- [ ] **Step 1: Create directory**

```bash
mkdir -p downloads/explicit-quiz/assets
```

- [ ] **Step 2: Copy video file**

```bash
cp /Users/maxim/Downloads/aigirlfriend_2.mp4 downloads/explicit-quiz/assets/aigirlfriend_2.mp4
```

Verify the file exists and is non-zero:
```bash
ls -lh downloads/explicit-quiz/assets/aigirlfriend_2.mp4
```

- [ ] **Step 3: Download photo from Figma**

The photo asset URL from Figma MCP (expires in 7 days):
```
https://www.figma.com/api/mcp/asset/cf90f49d-e5ad-4e53-ba62-b3d144cd7425
```

Download it:
```bash
curl -L -o downloads/explicit-quiz/assets/girl-photo.jpg "https://www.figma.com/api/mcp/asset/cf90f49d-e5ad-4e53-ba62-b3d144cd7425"
```

Verify it's a valid image (should show JPEG or similar):
```bash
file downloads/explicit-quiz/assets/girl-photo.jpg
```

If the Figma URL has expired, use the `get_screenshot` MCP tool with `fileKey: iDDSD4VFs8qqJfYstGOLzh`, `nodeId: 2235:21965` (the image node) to get a fresh URL.

- [ ] **Step 4: Commit assets**

```bash
git add downloads/explicit-quiz/assets/
git commit -m "chore: add assets for Explicit Quiz generating animation"
```

---

### Task 2: Create standalone animation file

**Files:**
- Create: `downloads/explicit-quiz/generating.html`

This is the complete standalone file with all CSS, HTML, and JS.

- [ ] **Step 1: Create the file**

Write this content to `downloads/explicit-quiz/generating.html`:

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generating — Explicit Quiz</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap" rel="stylesheet">
    <style>
        /* === Reset === */
        *, *::before, *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        /* @snippet:css */
        @property --shimmer-angle {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
        }

        :root {
            --gen-bg: #110c15;
            --gen-grad-start: #B14CEE;
            --gen-grad-end: #8049F3;
            --gen-shimmer-speed: 2.5s;
            --gen-progress-dur: 6s;
            --gen-fade: 0.5s;
        }

        @keyframes shimmer-rotate {
            to { --shimmer-angle: 360deg; }
        }

        @keyframes progress-fill {
            from { width: 0%; }
            to { width: 100%; }
        }

        @keyframes star-fly {
            0%   { transform: translateX(0); opacity: 0; }
            15%  { opacity: var(--star-o, 1); }
            85%  { opacity: var(--star-o, 1); }
            100% { transform: translateX(35px); opacity: 0; }
        }

        /* === Phone Frame === */
        .gen-phone {
            width: 375px;
            height: 812px;
            border-radius: 44px;
            background: var(--gen-bg);
            border: 2px solid #333;
            position: relative;
            overflow: hidden;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.6),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.05);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 80px;
            gap: 24px;
        }

        /* === Photo Container === */
        .gen-photo-wrap {
            width: 318px;
            height: 526px;
            border-radius: 27px;
            position: relative;
            flex-shrink: 0;
        }

        /* === Shimmer Border === */
        .gen-shimmer {
            position: absolute;
            inset: 0;
            border-radius: 27px;
            padding: 3px;
            background: conic-gradient(
                from var(--shimmer-angle),
                #8b4af2 0%, #b14cee 25%,
                #e879f9 50%, #8b4af2 75%,
                #b14cee 100%
            );
            animation: shimmer-rotate var(--gen-shimmer-speed) linear infinite;
            -webkit-mask: linear-gradient(#000 0 0) content-box,
                          linear-gradient(#000 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(#000 0 0) content-box,
                  linear-gradient(#000 0 0);
            mask-composite: exclude;
            pointer-events: none;
            z-index: 2;
            transition: opacity var(--gen-fade) ease;
        }

        .gen-shimmer::after {
            content: "";
            position: absolute;
            inset: -4px;
            border-radius: 31px;
            padding: 3px;
            background: conic-gradient(
                from var(--shimmer-angle),
                #8b4af2 0%, #b14cee 25%,
                #e879f9 50%, #8b4af2 75%,
                #b14cee 100%
            );
            opacity: 0.4;
            filter: blur(12px);
            z-index: -1;
        }

        /* === Photo + Video === */
        .gen-photo {
            position: absolute;
            inset: 3px;
            border-radius: 24px;
            overflow: hidden;
            z-index: 1;
        }

        .gen-photo img,
        .gen-photo video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .gen-photo video {
            position: absolute;
            inset: 0;
            opacity: 0;
            transition: opacity var(--gen-fade) ease 0.3s;
        }

        /* === Bottom Section (grid overlap for loading ↔ button) === */
        .gen-bottom {
            display: grid;
            justify-items: center;
            align-items: start;
            width: 312px;
        }

        .gen-loading,
        .gen-button {
            grid-row: 1;
            grid-column: 1;
        }

        .gen-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            width: 100%;
            transition: opacity var(--gen-fade) ease;
        }

        /* === Progress Bar === */
        .gen-progress {
            width: 312px;
            height: 20px;
            border-radius: 32px;
            background: rgba(255, 255, 255, 0.22);
            overflow: hidden;
        }

        .gen-progress-fill {
            height: 100%;
            border-radius: 16px;
            background: linear-gradient(141deg, var(--gen-grad-start), var(--gen-grad-end));
            box-shadow: 0 5px 26px rgba(104, 26, 199, 0.61),
                        0 1px 4.2px rgba(104, 26, 199, 0.31);
            animation: progress-fill var(--gen-progress-dur) linear forwards;
            position: relative;
            overflow: hidden;
        }

        .gen-progress-glow {
            position: absolute;
            right: -2px;
            top: 0;
            width: 48px;
            height: 100%;
            border-radius: 0 16px 16px 0;
            border: 1px solid rgba(255, 255, 255, 0.5);
            filter: blur(3px);
            background: radial-gradient(ellipse at right center,
                rgba(255, 255, 255, 0.3), transparent 70%);
        }

        .gen-star {
            position: absolute;
            right: var(--star-r, 20px);
            top: var(--star-t, 8px);
            width: var(--star-s, 2px);
            height: var(--star-s, 2px);
            background: white;
            border-radius: 50%;
            animation: star-fly var(--star-dur, 1.5s) linear infinite;
            animation-delay: var(--star-del, 0s);
            opacity: 0;
        }

        /* === Status Text === */
        .gen-status {
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.5);
            letter-spacing: -0.14px;
            text-align: center;
            line-height: 1.4;
            transition: opacity 0.3s ease;
        }

        /* === Button === */
        .gen-button {
            align-self: center;
            width: 240px;
            height: 44px;
            border-radius: 16px;
            background: linear-gradient(130deg, var(--gen-grad-start), var(--gen-grad-end));
            box-shadow: 0 5px 26px rgba(104, 26, 199, 0.61),
                        0 1px 4.2px rgba(104, 26, 199, 0.31);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            font-size: 14px;
            color: white;
            letter-spacing: -0.14px;
            border: none;
            cursor: pointer;
            opacity: 0;
            pointer-events: none;
            transition: opacity var(--gen-fade) ease 0.3s;
        }

        /* === Complete State === */
        .gen-phone.complete .gen-shimmer  { opacity: 0; }
        .gen-phone.complete .gen-loading  { opacity: 0; pointer-events: none; }
        .gen-phone.complete .gen-photo video { opacity: 1; }
        .gen-phone.complete .gen-button   { opacity: 1; pointer-events: auto; }
        /* @snippet:end */

        /* === Layout === */
        body {
            background: #0d0d1a;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
    </style>
</head>
<body>
    <div class="gen-phone" id="genRoot">
        <!-- @snippet:html -->
        <div class="gen-photo-wrap">
            <div class="gen-shimmer"></div>
            <div class="gen-photo">
                <img src="assets/girl-photo.jpg" alt="">
                <video src="assets/aigirlfriend_2.mp4"
                       loop muted playsinline preload="auto"></video>
            </div>
        </div>

        <div class="gen-bottom">
            <div class="gen-loading">
                <div class="gen-progress">
                    <div class="gen-progress-fill">
                        <div class="gen-progress-glow"></div>
                        <span class="gen-star" style="--star-r:5px;--star-t:3px;--star-s:2px;--star-dur:1.2s;--star-del:0s"></span>
                        <span class="gen-star" style="--star-r:15px;--star-t:8px;--star-s:4px;--star-dur:1.5s;--star-del:0.3s;--star-o:0.8"></span>
                        <span class="gen-star" style="--star-r:25px;--star-t:14px;--star-s:1px;--star-dur:1.1s;--star-del:0.6s"></span>
                        <span class="gen-star" style="--star-r:10px;--star-t:5px;--star-s:3px;--star-dur:1.4s;--star-del:0.9s"></span>
                        <span class="gen-star" style="--star-r:35px;--star-t:10px;--star-s:6px;--star-dur:1.8s;--star-del:0.2s;--star-o:0.6"></span>
                        <span class="gen-star" style="--star-r:8px;--star-t:16px;--star-s:2px;--star-dur:1.3s;--star-del:1.1s"></span>
                        <span class="gen-star" style="--star-r:20px;--star-t:2px;--star-s:1px;--star-dur:1.6s;--star-del:0.5s;--star-o:0.5"></span>
                        <span class="gen-star" style="--star-r:30px;--star-t:12px;--star-s:3px;--star-dur:1.2s;--star-del:0.8s"></span>
                        <span class="gen-star" style="--star-r:12px;--star-t:7px;--star-s:2px;--star-dur:1.5s;--star-del:1.4s;--star-o:0.7"></span>
                        <span class="gen-star" style="--star-r:40px;--star-t:15px;--star-s:4px;--star-dur:1.7s;--star-del:0.1s;--star-o:0.4"></span>
                    </div>
                </div>
                <p class="gen-status" id="genStatus">Analyzing your desires…</p>
            </div>
            <button class="gen-button">Start Fucking</button>
        </div>
        <!-- @snippet:end -->
    </div>

    <script>
        (function () {
            var root = document.getElementById('genRoot');
            var status = document.getElementById('genStatus');
            var video = root.querySelector('video');
            var messages = [
                'Analyzing your desires…',
                'Crafting her personality…',
                'Designing her look…'
            ];
            var step = 0;

            var tid = setInterval(function () {
                step++;
                if (step >= messages.length) { clearInterval(tid); return; }
                status.style.opacity = '0';
                setTimeout(function () {
                    status.textContent = messages[step];
                    status.style.opacity = '1';
                }, 300);
            }, 2000);

            setTimeout(function () {
                root.classList.add('complete');
                video.play().catch(function () {});
            }, 6000);
        })();
    </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add downloads/explicit-quiz/generating.html
git commit -m "feat: add generating animation for Explicit Quiz"
```

---

### Task 3: Browser verification

**Files:** None (read-only verification)

Start the dev server and verify the animation works correctly in a browser.

- [ ] **Step 1: Start dev server**

```bash
python3 -m http.server 8080
```

- [ ] **Step 2: Open the standalone file**

Navigate to `http://localhost:8080/downloads/explicit-quiz/generating.html`

- [ ] **Step 3: Verify Phase 1 (loading)**

Check all of these:
- [ ] Photo is visible inside the phone frame (312×520, rounded corners)
- [ ] Shimmer border rotates around the photo (purple/pink conic gradient, ~2.5s per rotation)
- [ ] Shimmer has a soft outer glow
- [ ] Progress bar appears below the photo, fills left to right over 6 seconds
- [ ] Progress bar has purple gradient fill with a glowing leading edge
- [ ] Small white star particles are visible near the progress bar's leading edge
- [ ] Status text reads "Analyzing your desires…" initially
- [ ] At ~2s, text fades to "Crafting her personality…"
- [ ] At ~4s, text fades to "Designing her look…"

- [ ] **Step 4: Verify Phase 2 (complete)**

After 6 seconds:
- [ ] Shimmer border fades out
- [ ] Progress bar and status text fade out together
- [ ] Video fades in over the photo (crossfade effect)
- [ ] Video plays automatically (looping, muted)
- [ ] "Start Fucking" button fades in below the video
- [ ] Button has purple gradient and glow shadow

- [ ] **Step 5: Fix any issues found**

If anything doesn't match the spec, edit `downloads/explicit-quiz/generating.html` and reload.

Common things to check:
- If shimmer border doesn't animate: `@property` may not be supported — check browser console
- If video doesn't play: verify `assets/aigirlfriend_2.mp4` path is correct relative to the HTML file
- If stars aren't visible: check they're inside `.gen-progress-fill` (which has `overflow: hidden`)
- If text doesn't cycle: check JS console for errors

- [ ] **Step 6: Commit fixes (if any)**

```bash
git add downloads/explicit-quiz/generating.html
git commit -m "fix: adjust generating animation after browser testing"
```

---

### Task 4: Add catalog entry to index.html

**Files:**
- Modify: `index.html` (inside `<div id="animations">`, after the last `</section>`)

- [ ] **Step 1: Add the animation section**

Add this section as the last entry inside `<div id="animations">`, after the SwipeyTin Style Select Screen section:

```html
    <section class="animation"
      data-feature="Explicit Quiz"
      data-name="Generating"
      data-duration="6s (loading) + 0.8s (transition)"
      data-easing="linear (progress), ease (fades)"
      data-css-vars="--gen-shimmer-speed, --gen-progress-dur, --gen-fade"
      data-note="Two-phase: loading progress with shimmer border → video reveal with button. Photo 'comes alive' as video when generation completes."
      data-file="downloads/explicit-quiz/generating.html">
    </section>
```

- [ ] **Step 2: Verify in catalog**

Navigate to `http://localhost:8080` (or reload if server is running).

Check:
- [ ] "Explicit Quiz" appears as a new group in the sidebar
- [ ] "Generating" appears under it
- [ ] Clicking it shows the iframe preview with the animation
- [ ] Spec table shows duration, easing, and CSS vars
- [ ] Note is displayed
- [ ] CSS and HTML code blocks are extracted from snippet markers
- [ ] Download button works

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: register Explicit Quiz / Generating in the catalog"
```

---

### Task 5: Update README.md

**Files:**
- Modify: `README.md`

Per CLAUDE.md, docs must be updated in sync with changes.

- [ ] **Step 1: Update file structure in README**

In the `## Структура` section, add `explicit-quiz` to the downloads tree. Find this block:

```
│   ├── live-now/
│   │   ├── chat-button-animation.html
│   │   └── content-to-counter.html
```

Replace it with:

```
│   ├── explicit-quiz/
│   │   ├── assets/
│   │   └── generating.html
│   ├── live-now/
│   │   ├── chat-button-animation.html
│   │   └── content-to-counter.html
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add Explicit Quiz to README file structure"
```
