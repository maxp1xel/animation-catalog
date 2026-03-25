# Animation Catalog — Design Spec

## Overview

Static HTML catalog of CSS/JS animations for a development team. Organized by product features, hosted at `test.shaihalov.com/animations/`. No build step, no frameworks — pure HTML + CSS + JS.

## Goals

- Team members browse animations, see live previews, copy code, download standalone HTML files
- Animations are organized by product features (onboarding, dashboard, etc.), not by animation type
- Simple to add new animations — no config files, no build process
- Scales from 2-3 features to dozens without architectural changes

## URL & Hosting

- URL: `https://test.shaihalov.com/animations/`
- Deployed via GitHub Actions + rsync to a subdirectory on an existing server
- Must not affect other projects on the same domain (e.g., `/cute-or-slut/`)

## File Structure

```
animation-catalog/
├── index.html              # Main catalog page
├── styles.css              # Dark theme styles
├── catalog.js              # Navigation, replay, copy, download logic
├── downloads/              # Standalone downloadable HTML files
│   ├── onboarding/
│   │   ├── card-entrance.html
│   │   └── progress-bar.html
│   └── dashboard/
│       ├── chart-reveal.html
│       └── sidebar-toggle.html
├── .github/
│   └── workflows/
│       └── deploy.yml      # GH Actions → rsync to server
└── .gitignore
```

## Page Layout

Sidebar + Content layout:

### Sidebar (left, fixed)
- Title/logo at the top
- List of features, each expandable/collapsible
- Clicking a feature reveals its animations as a nested list
- Clicking an animation name loads its card in the main content area
- Active animation is visually highlighted

```
▼ Онбординг
    Card Entrance  ← active
    Progress Bar
    Step Indicator
▶ Дашборд
▶ Корзина
```

### Main Content (right)
Displays the selected animation's card. Sections from top to bottom:

1. **Header** — animation name, feature name, Replay button, Download HTML button
2. **Preview** — live animation running in an isolated container
3. **Spec** — grid showing duration, easing, delay, CSS variables
4. **Code blocks** — separate blocks for CSS, HTML, JS (optional), each with its own Copy button positioned next to the code

## Animation Card Detail

### Header
- Animation name (large)
- Feature name (subtitle)
- `▶ Replay` button — restarts the animation
- `⬇ Download HTML` button — downloads the standalone file from `downloads/`

### Preview Area
- Dark container with the animation running live
- Replay: remove the preview element from DOM, force a reflow via `element.offsetHeight`, then re-insert. This is the only reliable way to retrigger CSS animations — toggling classes alone does not work because the browser optimizes away re-triggering the same animation name.

### Spec Block
- Grid layout showing: duration, easing function, delay, CSS variable names
- Read from `data-*` attributes on the animation section

### Code Blocks
- **CSS** block with Copy button
- **HTML** block with Copy button
- **JS** block with Copy button (shown only if animation has JS)
- Each Copy button is positioned in the top-right corner of its code block
- Code is displayed as plain monospace text with the accent color. No syntax highlighting in v1 — can be added later with a micro-library like Prism if needed.

## Animation Data Format

Each animation is a `<section>` in `index.html` with data attributes:

```html
<section class="animation"
  data-feature="onboarding"
  data-name="Card Entrance"
  data-duration="0.3s"
  data-easing="ease-out"
  data-delay="0s"
  data-css-vars="--card-duration, --card-ease"
  data-file="downloads/onboarding/card-entrance.html">

  <div class="animation-preview">
    <!-- Live preview HTML -->
  </div>

  <!-- Code is stored in <template> tags to prevent execution and preserve raw text -->
  <template class="animation-css">
@keyframes cardEntrance {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.card { animation: cardEntrance var(--card-duration, 0.3s) var(--card-ease, ease-out); }
  </template>

  <template class="animation-html">
<div class="card">
  <h3>Welcome</h3>
  <p>Get started...</p>
</div>
  </template>

  <template class="animation-js">
// Optional JS for this animation
const observer = new IntersectionObserver(
  entries => entries.forEach(e =>
    e.target.classList.toggle('visible', e.isIntersecting)
  )
);
  </template>
</section>
```

**Code extraction:** `catalog.js` reads `.textContent` from each `<template>` element (`.animation-css`, `.animation-html`, `.animation-js`). This gives clean raw code without any wrapping tags. The code is displayed in `<pre><code>` blocks. If `.animation-js` template is empty or absent, the JS code block is hidden.

**Preview rendering:** The preview is built by injecting a `<style>` with the CSS template content and the HTML template content into `.animation-preview`. This keeps the animation live while the raw code stays in `<template>` for display and copy.

The sidebar navigation is built automatically by `catalog.js` — it reads all `<section class="animation">` elements, groups them by `data-feature`, and generates the sidebar tree. Features appear in source order (the order `<section>` elements appear in `index.html`), giving the author full control over sidebar ordering.

## Adding a New Animation

1. Add a new `<section class="animation" data-feature="..." data-name="..." ...>` to `index.html`
2. Create a standalone HTML file in `downloads/<feature>/<name>.html` — fully self-contained with inline styles and scripts. The standalone file must contain the same CSS, HTML, and JS as the `<template>` tags in `index.html` — this is a manual duplication; keep both in sync when updating.
3. Push to `main` — GH Actions deploys automatically
4. Sidebar updates automatically (built from data attributes)

## Visual Design

- **Theme:** Dark, minimalist — focus on the animations themselves
- **Background:** Deep dark (`#0d0d1a` for preview areas, `#1a1a2e` for page, `#12122a` for sidebar)
- **Accent:** Soft blue/purple (`#a0a0ff`) for interactive elements
- **Typography:** Monospace for code, system sans-serif for UI text
- **No decorative elements** — clean, functional, developer-tool aesthetic

## Functionality

### Replay
- Clicking Replay restarts the animation in the preview area
- Implementation: remove the animated element, force reflow (`void element.offsetHeight`), re-insert it. This reliably retriggers CSS animations.

### Copy
- Each code block (CSS, HTML, JS) has its own Copy button
- Copies the raw code text to clipboard via `navigator.clipboard.writeText()`
- Visual feedback: button text changes to "Copied!" briefly

### Download
- Downloads the standalone HTML file from `downloads/<feature>/<name>.html`
- Uses an `<a>` tag with `href` pointing to the `data-file` path and `download` attribute
- The standalone file is fully self-contained (inline CSS, inline JS)

### Sidebar Navigation
- Built dynamically from `data-feature` attributes
- Features are collapsible (click to expand/collapse)
- First animation of first feature is selected by default on page load
- URL hash updates on selection (e.g., `#onboarding/card-entrance`) for direct linking
- If hash does not match any animation (stale link, typo), falls back to the first animation of the first feature

## Deployment

### GitHub Actions Workflow

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup SSH key
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.DEPLOY_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
      - name: Deploy via rsync
        run: |
          rsync -avz --delete \
            --exclude '.github' \
            --exclude '.gitignore' \
            --exclude '.superpowers' \
            --exclude 'docs' \
            ./ ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }}:${{ secrets.DEPLOY_PATH }}/animations/
        env:
          RSYNC_RSH: "ssh -o StrictHostKeyChecking=no -i ~/.ssh/deploy_key"
```

**Note:** The `--delete` flag removes files in the remote `/animations/` directory that are not in the repo. This directory is fully owned by this project — do not place files there manually on the server.

### Required GitHub Secrets
- `DEPLOY_HOST` — server hostname
- `DEPLOY_USER` — SSH username
- `DEPLOY_PATH` — web root path on server
- `DEPLOY_KEY` — SSH private key for authentication

## Scalability

- At 2-3 features (10-15 animations), single file works perfectly
- At 30+ animations, file size may grow but remains manageable (HTML + CSS is lightweight)
- If needed later: migrate to a generator approach (JSON config → static HTML) without changing the URL structure or user experience
- Sidebar tree structure scales naturally to many features

## Responsive Behavior

Desktop only. The sidebar + content layout assumes a wide viewport. No responsive/mobile layout in v1 — the audience is developers on desktop machines.

## Out of Scope

- Search/filtering (can be added later)
- Dark/light theme toggle (dark only)
- Animation parameter controls (e.g., sliders for duration)
- Multi-user editing or CMS
- Framework-specific code examples (React, Vue, etc.)
- Syntax highlighting (can add Prism later)
- Responsive/mobile layout
