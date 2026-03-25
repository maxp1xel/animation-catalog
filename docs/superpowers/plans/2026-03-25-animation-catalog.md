# Animation Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static HTML catalog of CSS/JS animations organized by product features, with live previews, copy/download functionality, and automated deployment.

**Architecture:** Single `index.html` with all animations as `<section>` elements. `catalog.js` reads data attributes and `<template>` tags to build sidebar navigation and render animation cards dynamically. Standalone downloadable HTML files live in `downloads/`. Deploy via GH Actions + rsync.

**Tech Stack:** HTML, CSS, vanilla JS. No frameworks, no build step.

**Spec:** `docs/superpowers/specs/2026-03-25-animation-catalog-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | Page shell (sidebar container, main content container) + all animation `<section>` elements |
| `styles.css` | Dark theme, layout (sidebar + content), animation card styles, code block styles, buttons |
| `catalog.js` | Build sidebar from DOM, handle navigation/selection, render preview + spec + code blocks, replay, copy, download, URL hash routing |
| `downloads/onboarding/card-entrance.html` | Standalone: card entrance animation |
| `downloads/onboarding/progress-bar.html` | Standalone: progress bar fill animation |
| `downloads/onboarding/step-indicator.html` | Standalone: step indicator transition |
| `downloads/dashboard/chart-reveal.html` | Standalone: chart bars reveal animation |
| `downloads/dashboard/counter-up.html` | Standalone: number counting up animation |
| `.github/workflows/deploy.yml` | CI/CD: rsync to server on push to main |
| `.gitignore` | Ignore .superpowers/, .DS_Store |

---

### Task 1: Project Scaffold — Git, .gitignore, Deploy Workflow

**Files:**
- Create: `.gitignore`
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Initialize git repo**

```bash
cd /Users/maxim/Coding/animation-catalog
git init
```

- [ ] **Step 2: Create .gitignore**

Create `.gitignore`:

```
.DS_Store
.superpowers/
```

- [ ] **Step 3: Create deploy workflow**

Create `.github/workflows/deploy.yml`:

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
            --exclude 'AGENTS.md' \
            ./ ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }}:${{ secrets.DEPLOY_PATH }}/animations/
        env:
          RSYNC_RSH: "ssh -o StrictHostKeyChecking=no -i ~/.ssh/deploy_key"
```

- [ ] **Step 4: Commit scaffold**

Note: `README.md`, `AGENTS.md`, and `docs/` already exist in the working directory (created during brainstorming). Include them in the initial commit.

```bash
git add .gitignore .github/workflows/deploy.yml README.md AGENTS.md docs/
git commit -m "chore: project scaffold — gitignore, deploy workflow, docs"
```

---

### Task 2: Page Shell — HTML Structure + Dark Theme CSS

**Files:**
- Create: `index.html`
- Create: `styles.css`

- [ ] **Step 1: Create index.html with page shell**

Create `index.html` — the page shell with sidebar and main content containers. No animations yet, just the structural HTML:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Animation Catalog</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <h1 class="sidebar-title">Animations</h1>
    </div>
    <nav class="sidebar-nav" id="sidebar-nav">
      <!-- Built dynamically by catalog.js -->
    </nav>
  </aside>

  <main class="content" id="content">
    <div class="card" id="animation-card">
      <!-- Header -->
      <div class="card-header" id="card-header">
        <div class="card-titles">
          <h2 class="card-name" id="card-name"></h2>
          <span class="card-feature" id="card-feature"></span>
        </div>
        <div class="card-actions">
          <button class="btn" id="btn-replay">▶ Replay</button>
          <a class="btn" id="btn-download" download>⬇ Download HTML</a>
        </div>
      </div>

      <!-- Preview -->
      <div class="preview" id="preview"></div>

      <!-- Spec -->
      <div class="spec" id="spec"></div>

      <!-- Code Blocks -->
      <div class="code-blocks" id="code-blocks"></div>
    </div>
  </main>

  <!-- Animation sections go here -->
  <div id="animations" style="display:none">
  </div>

  <script src="catalog.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create styles.css with dark theme and layout**

Create `styles.css` with the complete dark theme:

```css
/* === Reset === */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* === Theme Tokens === */
:root {
  --bg-page: #1a1a2e;
  --bg-sidebar: #12122a;
  --bg-preview: #0d0d1a;
  --bg-code: #0d0d1a;
  --bg-spec: #12122a;
  --border: #2a2a4a;
  --accent: #a0a0ff;
  --accent-hover: #c0c0ff;
  --text-primary: #e0e0ff;
  --text-secondary: #8888aa;
  --text-muted: #6c6c9c;
  --text-dim: #4a4a6a;
  --font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  --sidebar-width: 240px;
}

body {
  font-family: var(--font-ui);
  background: var(--bg-page);
  color: var(--text-primary);
  display: flex;
  min-height: 100vh;
}

/* === Sidebar === */
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px 16px 12px;
  border-bottom: 1px solid var(--border);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.sidebar-nav {
  padding: 8px 0;
  flex: 1;
}

.feature-group {
  margin-bottom: 4px;
}

.feature-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 16px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

.feature-toggle:hover {
  color: var(--text-primary);
}

.feature-toggle .arrow {
  font-size: 10px;
  transition: transform 0.15s ease;
}

.feature-toggle.open .arrow {
  transform: rotate(90deg);
}

.feature-list {
  display: none;
  padding: 2px 0;
}

.feature-list.open {
  display: block;
}

.animation-link {
  display: block;
  padding: 4px 16px 4px 36px;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  border-left: 2px solid transparent;
}

.animation-link:hover {
  color: var(--text-primary);
}

.animation-link.active {
  color: var(--accent);
  background: rgba(160, 160, 255, 0.08);
  border-left-color: var(--accent);
}

/* === Main Content === */
.content {
  margin-left: var(--sidebar-width);
  flex: 1;
  padding: 24px 32px;
  max-width: 900px;
}

/* === Card === */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.card-name {
  font-size: 22px;
  font-weight: 600;
}

.card-feature {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: rgba(160, 160, 255, 0.12);
  color: var(--accent);
  border: 1px solid rgba(160, 160, 255, 0.2);
  border-radius: 6px;
  font-family: var(--font-ui);
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s ease;
}

.btn:hover {
  background: rgba(160, 160, 255, 0.2);
  color: var(--accent-hover);
}

/* === Preview === */
.preview {
  background: var(--bg-preview);
  border: 1px solid var(--border);
  border-radius: 8px;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* === Spec === */
.spec {
  background: var(--bg-spec);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 20px;
}

.spec-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
}

.spec-item-label {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.spec-item-value {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-primary);
}

/* === Code Blocks === */
.code-block {
  background: var(--bg-code);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
}

.code-block-lang {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.btn-copy {
  padding: 3px 10px;
  background: rgba(160, 160, 255, 0.1);
  color: var(--accent);
  border: none;
  border-radius: 4px;
  font-family: var(--font-ui);
  font-size: 10px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-copy:hover {
  background: rgba(160, 160, 255, 0.2);
}

.btn-copy.copied {
  color: #66ffaa;
}

.code-block pre {
  padding: 12px;
  overflow-x: auto;
  margin: 0;
}

.code-block code {
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  color: var(--accent);
  white-space: pre;
}
```

- [ ] **Step 3: Open in browser and verify layout**

Open `index.html` in browser. Verify: dark background, sidebar on the left (empty nav area), main content area on the right. A 404 for `catalog.js` in the console is expected — it will be created in Task 3.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: page shell with sidebar + content layout and dark theme"
```

---

### Task 3: catalog.js — Sidebar Navigation Builder

**Files:**
- Create: `catalog.js`

- [ ] **Step 1: Create catalog.js with sidebar builder**

Create `catalog.js`:

```javascript
(function () {
  'use strict';

  const state = {
    animations: [],   // { el, feature, name, slug }
    features: [],     // { name, animations[] }
    active: null,     // current animation object
  };

  // --- Init ---
  function init() {
    parseAnimations();
    buildSidebar();
    navigateFromHash() || selectFirst();
    window.addEventListener('hashchange', () => navigateFromHash());
  }

  // --- Parse <section class="animation"> elements ---
  function parseAnimations() {
    const sections = document.querySelectorAll('#animations .animation');
    const featureMap = new Map();

    sections.forEach(el => {
      const feature = el.dataset.feature;
      const name = el.dataset.name;
      const slug = slugify(feature) + '/' + slugify(name);

      const anim = { el, feature, name, slug };
      state.animations.push(anim);

      if (!featureMap.has(feature)) {
        featureMap.set(feature, { name: feature, animations: [] });
      }
      featureMap.get(feature).animations.push(anim);
    });

    state.features = Array.from(featureMap.values());
  }

  // --- Build sidebar DOM ---
  function buildSidebar() {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = '';

    state.features.forEach(feature => {
      const group = document.createElement('div');
      group.className = 'feature-group';

      const toggle = document.createElement('button');
      toggle.className = 'feature-toggle';
      toggle.innerHTML = '<span class="arrow">▶</span> ' + feature.name;
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        list.classList.toggle('open');
      });

      const list = document.createElement('div');
      list.className = 'feature-list';

      feature.animations.forEach(anim => {
        const link = document.createElement('a');
        link.className = 'animation-link';
        link.textContent = anim.name;
        link.href = '#' + anim.slug;
        link.addEventListener('click', e => {
          e.preventDefault();
          select(anim);
        });
        anim.linkEl = link;
        list.appendChild(link);
      });

      group.appendChild(toggle);
      group.appendChild(list);
      nav.appendChild(group);
    });
  }

  // --- Select animation ---
  function select(anim) {
    if (state.active) {
      state.active.linkEl.classList.remove('active');
    }

    state.active = anim;
    anim.linkEl.classList.add('active');

    // Expand parent feature
    const group = anim.linkEl.closest('.feature-group');
    group.querySelector('.feature-toggle').classList.add('open');
    group.querySelector('.feature-list').classList.add('open');

    // Update hash without triggering hashchange
    history.replaceState(null, '', '#' + anim.slug);

    renderCard(anim);
  }

  // --- Render animation card ---
  function renderCard(anim) {
    const el = anim.el;

    // Header
    document.getElementById('card-name').textContent = anim.name;
    document.getElementById('card-feature').textContent = anim.feature;

    // Download
    const downloadBtn = document.getElementById('btn-download');
    const file = el.dataset.file;
    if (file) {
      downloadBtn.href = file;
      downloadBtn.style.display = '';
    } else {
      downloadBtn.style.display = 'none';
    }

    // Preview
    renderPreview(anim);

    // Spec
    renderSpec(el);

    // Code blocks
    renderCodeBlocks(el);
  }

  // --- Preview ---
  function renderPreview(anim) {
    const preview = document.getElementById('preview');
    const el = anim.el;

    // Clear previous
    preview.innerHTML = '';

    // Inject CSS
    const cssTemplate = el.querySelector('.animation-css');
    if (cssTemplate) {
      const style = document.createElement('style');
      style.textContent = cssTemplate.textContent;
      preview.appendChild(style);
    }

    // Inject HTML
    const htmlTemplate = el.querySelector('.animation-html');
    if (htmlTemplate) {
      const container = document.createElement('div');
      container.innerHTML = htmlTemplate.innerHTML;
      preview.appendChild(container);
    }

    // Inject JS
    const jsTemplate = el.querySelector('.animation-js');
    if (jsTemplate && jsTemplate.textContent.trim()) {
      const script = document.createElement('script');
      script.textContent = jsTemplate.textContent;
      preview.appendChild(script);
    }
  }

  // --- Replay ---
  document.getElementById('btn-replay').addEventListener('click', () => {
    if (state.active) {
      renderPreview(state.active);
    }
  });

  // --- Spec ---
  function renderSpec(el) {
    const spec = document.getElementById('spec');
    const items = [];

    if (el.dataset.duration) items.push({ label: 'Duration', value: el.dataset.duration });
    if (el.dataset.easing) items.push({ label: 'Easing', value: el.dataset.easing });
    if (el.dataset.delay) items.push({ label: 'Delay', value: el.dataset.delay });
    if (el.dataset.cssVars) items.push({ label: 'CSS Variables', value: el.dataset.cssVars });

    spec.innerHTML = '<div class="spec-title">Spec</div><div class="spec-grid">' +
      items.map(i =>
        '<div><div class="spec-item-label">' + i.label + '</div>' +
        '<div class="spec-item-value">' + i.value + '</div></div>'
      ).join('') + '</div>';
  }

  // --- Code Blocks ---
  function renderCodeBlocks(el) {
    const container = document.getElementById('code-blocks');
    container.innerHTML = '';

    const blocks = [
      { label: 'CSS', selector: '.animation-css' },
      { label: 'HTML', selector: '.animation-html' },
      { label: 'JavaScript', selector: '.animation-js' },
    ];

    blocks.forEach(({ label, selector }) => {
      const template = el.querySelector(selector);
      if (!template) return;

      const code = selector === '.animation-html'
        ? template.innerHTML.trim()
        : template.textContent.trim();

      if (!code) return;

      const block = document.createElement('div');
      block.className = 'code-block';
      block.innerHTML =
        '<div class="code-block-header">' +
          '<span class="code-block-lang">' + label + '</span>' +
          '<button class="btn-copy">Copy</button>' +
        '</div>' +
        '<pre><code></code></pre>';

      block.querySelector('code').textContent = code;

      block.querySelector('.btn-copy').addEventListener('click', function () {
        navigator.clipboard.writeText(code).then(() => {
          this.textContent = 'Copied!';
          this.classList.add('copied');
          setTimeout(() => {
            this.textContent = 'Copy';
            this.classList.remove('copied');
          }, 1500);
        });
      });

      container.appendChild(block);
    });
  }

  // --- Hash routing ---
  function navigateFromHash() {
    const hash = location.hash.slice(1);
    if (!hash) return false;

    const anim = state.animations.find(a => a.slug === hash);
    if (anim) {
      select(anim);
      return true;
    }
    return false;
  }

  function selectFirst() {
    if (state.animations.length > 0) {
      select(state.animations[0]);
    }
  }

  // --- Utility ---
  function slugify(str) {
    return str.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/(^-|-$)/g, '');
  }

  // --- Start ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 2: Open in browser, verify**

Open `index.html`. Sidebar should render empty (no animation sections yet). No JS errors in console.

- [ ] **Step 3: Commit**

```bash
git add catalog.js
git commit -m "feat: catalog.js — sidebar builder, card renderer, copy, replay, hash routing"
```

---

### Task 4: Example Animations — Onboarding (3 animations)

**Files:**
- Modify: `index.html` (add 3 animation sections inside `#animations`)
- Create: `downloads/onboarding/card-entrance.html`
- Create: `downloads/onboarding/progress-bar.html`
- Create: `downloads/onboarding/step-indicator.html`

- [ ] **Step 1: Add 3 onboarding animation sections to index.html**

Inside the `<div id="animations">` in `index.html`, add these three sections:

**Animation 1: Card Entrance**
```html
<section class="animation"
  data-feature="Онбординг"
  data-name="Card Entrance"
  data-duration="0.4s"
  data-easing="ease-out"
  data-delay="0s"
  data-css-vars="--card-duration, --card-ease"
  data-file="downloads/onboarding/card-entrance.html">

  <div class="animation-preview">
    <div class="demo-card">
      <div class="demo-card-icon">👋</div>
      <div class="demo-card-title">Welcome</div>
      <div class="demo-card-text">Get started with your account</div>
    </div>
  </div>

  <template class="animation-css">
@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.demo-card {
  background: #2a2a5a;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  width: 200px;
  animation: cardEntrance var(--card-duration, 0.4s) var(--card-ease, ease-out) both;
}

.demo-card-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.demo-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #e0e0ff;
  margin-bottom: 4px;
}

.demo-card-text {
  font-size: 12px;
  color: #8888aa;
}
  </template>

  <template class="animation-html">
<div class="demo-card">
  <div class="demo-card-icon">👋</div>
  <div class="demo-card-title">Welcome</div>
  <div class="demo-card-text">Get started with your account</div>
</div>
  </template>

  <template class="animation-js"></template>
</section>
```

**Animation 2: Progress Bar**
```html
<section class="animation"
  data-feature="Онбординг"
  data-name="Progress Bar"
  data-duration="1.2s"
  data-easing="ease-in-out"
  data-delay="0.2s"
  data-css-vars="--progress-width, --progress-duration"
  data-file="downloads/onboarding/progress-bar.html">

  <div class="animation-preview">
    <div class="demo-progress-wrap">
      <div class="demo-progress-label">Step 2 of 4</div>
      <div class="demo-progress-track">
        <div class="demo-progress-fill"></div>
      </div>
    </div>
  </div>

  <template class="animation-css">
@keyframes progressFill {
  from { width: 0; }
  to { width: var(--progress-width, 50%); }
}

.demo-progress-wrap {
  width: 280px;
}

.demo-progress-label {
  font-size: 13px;
  color: #8888aa;
  margin-bottom: 8px;
}

.demo-progress-track {
  height: 6px;
  background: #2a2a4a;
  border-radius: 3px;
  overflow: hidden;
}

.demo-progress-fill {
  height: 100%;
  background: #a0a0ff;
  border-radius: 3px;
  animation: progressFill var(--progress-duration, 1.2s) ease-in-out 0.2s both;
}
  </template>

  <template class="animation-html">
<div class="demo-progress-wrap">
  <div class="demo-progress-label">Step 2 of 4</div>
  <div class="demo-progress-track">
    <div class="demo-progress-fill"></div>
  </div>
</div>
  </template>

  <template class="animation-js"></template>
</section>
```

**Animation 3: Step Indicator**
```html
<section class="animation"
  data-feature="Онбординг"
  data-name="Step Indicator"
  data-duration="0.3s"
  data-easing="ease"
  data-delay="0s"
  data-css-vars="--step-scale"
  data-file="downloads/onboarding/step-indicator.html">

  <div class="animation-preview">
    <div class="demo-steps">
      <div class="demo-step completed">1</div>
      <div class="demo-step-line"></div>
      <div class="demo-step active">2</div>
      <div class="demo-step-line"></div>
      <div class="demo-step">3</div>
    </div>
  </div>

  <template class="animation-css">
@keyframes stepPulse {
  0% { transform: scale(1); }
  50% { transform: scale(var(--step-scale, 1.2)); }
  100% { transform: scale(1); }
}

.demo-steps {
  display: flex;
  align-items: center;
  gap: 0;
}

.demo-step {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  background: #2a2a4a;
  color: #6c6c9c;
  transition: all 0.3s ease;
}

.demo-step.completed {
  background: #a0a0ff;
  color: #0d0d1a;
}

.demo-step.active {
  background: #a0a0ff;
  color: #0d0d1a;
  animation: stepPulse 0.3s ease;
  box-shadow: 0 0 12px rgba(160, 160, 255, 0.4);
}

.demo-step-line {
  width: 40px;
  height: 2px;
  background: #2a2a4a;
}
  </template>

  <template class="animation-html">
<div class="demo-steps">
  <div class="demo-step completed">1</div>
  <div class="demo-step-line"></div>
  <div class="demo-step active">2</div>
  <div class="demo-step-line"></div>
  <div class="demo-step">3</div>
</div>
  </template>

  <template class="animation-js"></template>
</section>
```

- [ ] **Step 2: Open in browser, verify sidebar + cards**

Open `index.html`. Verify:
- Sidebar shows "▶ Онбординг" that expands to 3 animations
- Clicking each animation shows its preview, spec, and code blocks
- Copy buttons work (check clipboard)
- Replay button restarts the animation
- URL hash updates

- [ ] **Step 3: Create standalone download files**

Create `downloads/onboarding/card-entrance.html`:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Card Entrance — Онбординг</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0d1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.demo-card {
  background: #2a2a5a;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  width: 200px;
  animation: cardEntrance var(--card-duration, 0.4s) var(--card-ease, ease-out) both;
}

.demo-card-icon { font-size: 32px; margin-bottom: 8px; }
.demo-card-title { font-size: 16px; font-weight: 600; color: #e0e0ff; margin-bottom: 4px; }
.demo-card-text { font-size: 12px; color: #8888aa; }
</style>
</head>
<body>
<div class="demo-card">
  <div class="demo-card-icon">👋</div>
  <div class="demo-card-title">Welcome</div>
  <div class="demo-card-text">Get started with your account</div>
</div>
</body>
</html>
```

Create `downloads/onboarding/progress-bar.html`:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Progress Bar — Онбординг</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0d1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

@keyframes progressFill {
  from { width: 0; }
  to { width: var(--progress-width, 50%); }
}

.demo-progress-wrap { width: 280px; }
.demo-progress-label { font-size: 13px; color: #8888aa; margin-bottom: 8px; }
.demo-progress-track { height: 6px; background: #2a2a4a; border-radius: 3px; overflow: hidden; }
.demo-progress-fill {
  height: 100%;
  background: #a0a0ff;
  border-radius: 3px;
  animation: progressFill var(--progress-duration, 1.2s) ease-in-out 0.2s both;
}
</style>
</head>
<body>
<div class="demo-progress-wrap">
  <div class="demo-progress-label">Step 2 of 4</div>
  <div class="demo-progress-track">
    <div class="demo-progress-fill"></div>
  </div>
</div>
</body>
</html>
```

Create `downloads/onboarding/step-indicator.html`:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Step Indicator — Онбординг</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0d1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

@keyframes stepPulse {
  0% { transform: scale(1); }
  50% { transform: scale(var(--step-scale, 1.2)); }
  100% { transform: scale(1); }
}

.demo-steps { display: flex; align-items: center; gap: 0; }
.demo-step {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600;
  background: #2a2a4a; color: #6c6c9c;
  transition: all 0.3s ease;
}
.demo-step.completed { background: #a0a0ff; color: #0d0d1a; }
.demo-step.active {
  background: #a0a0ff; color: #0d0d1a;
  animation: stepPulse 0.3s ease;
  box-shadow: 0 0 12px rgba(160, 160, 255, 0.4);
}
.demo-step-line { width: 40px; height: 2px; background: #2a2a4a; }
</style>
</head>
<body>
<div class="demo-steps">
  <div class="demo-step completed">1</div>
  <div class="demo-step-line"></div>
  <div class="demo-step active">2</div>
  <div class="demo-step-line"></div>
  <div class="demo-step">3</div>
</div>
</body>
</html>
```

- [ ] **Step 4: Verify download buttons**

Click "Download HTML" for each animation. Verify each downloaded file opens standalone in browser and shows the animation correctly.

- [ ] **Step 5: Commit**

```bash
git add index.html downloads/
git commit -m "feat: add 3 onboarding animations — card entrance, progress bar, step indicator"
```

---

### Task 5: Example Animations — Dashboard (2 animations)

**Files:**
- Modify: `index.html` (add 2 animation sections)
- Create: `downloads/dashboard/chart-reveal.html`
- Create: `downloads/dashboard/counter-up.html`

- [ ] **Step 1: Add 2 dashboard animation sections to index.html**

Append inside `<div id="animations">`, after the onboarding sections:

**Animation 4: Chart Reveal**
```html
<section class="animation"
  data-feature="Дашборд"
  data-name="Chart Reveal"
  data-duration="0.6s"
  data-easing="ease-out"
  data-delay="staggered 0.1s"
  data-css-vars="--bar-height-1, --bar-height-2, --bar-height-3, --bar-height-4"
  data-file="downloads/dashboard/chart-reveal.html">

  <div class="animation-preview">
    <div class="demo-chart">
      <div class="demo-bar" style="--bar-height: 60%; --bar-delay: 0s;"></div>
      <div class="demo-bar" style="--bar-height: 85%; --bar-delay: 0.1s;"></div>
      <div class="demo-bar" style="--bar-height: 45%; --bar-delay: 0.2s;"></div>
      <div class="demo-bar" style="--bar-height: 70%; --bar-delay: 0.3s;"></div>
    </div>
  </div>

  <template class="animation-css">
@keyframes barReveal {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: var(--bar-height, 50%);
    opacity: 1;
  }
}

.demo-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 120px;
  padding: 0 20px;
}

.demo-bar {
  width: 32px;
  background: #a0a0ff;
  border-radius: 4px 4px 0 0;
  animation: barReveal 0.6s ease-out var(--bar-delay, 0s) both;
}
  </template>

  <template class="animation-html">
<div class="demo-chart">
  <div class="demo-bar" style="--bar-height: 60%; --bar-delay: 0s;"></div>
  <div class="demo-bar" style="--bar-height: 85%; --bar-delay: 0.1s;"></div>
  <div class="demo-bar" style="--bar-height: 45%; --bar-delay: 0.2s;"></div>
  <div class="demo-bar" style="--bar-height: 70%; --bar-delay: 0.3s;"></div>
</div>
  </template>

  <template class="animation-js"></template>
</section>
```

**Animation 5: Counter Up**
```html
<section class="animation"
  data-feature="Дашборд"
  data-name="Counter Up"
  data-duration="1s"
  data-easing="ease-out"
  data-delay="0s"
  data-css-vars=""
  data-file="downloads/dashboard/counter-up.html">

  <div class="animation-preview">
    <div class="demo-counter-wrap">
      <div class="demo-counter-value" data-target="1284">0</div>
      <div class="demo-counter-label">Active Users</div>
    </div>
  </div>

  <template class="animation-css">
.demo-counter-wrap {
  text-align: center;
}

.demo-counter-value {
  font-size: 48px;
  font-weight: 700;
  color: #e0e0ff;
  font-variant-numeric: tabular-nums;
}

.demo-counter-label {
  font-size: 13px;
  color: #6c6c9c;
  margin-top: 4px;
}
  </template>

  <template class="animation-html">
<div class="demo-counter-wrap">
  <div class="demo-counter-value" data-target="1284">0</div>
  <div class="demo-counter-label">Active Users</div>
</div>
  </template>

  <template class="animation-js">
// Animate number counting up
const el = document.querySelector('.demo-counter-value');
const target = parseInt(el.dataset.target, 10);
const duration = 1000;
const start = performance.now();

function tick(now) {
  const elapsed = now - start;
  const progress = Math.min(elapsed / duration, 1);
  const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
  el.textContent = Math.round(target * eased);
  if (progress < 1) requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
  </template>
</section>
```

- [ ] **Step 2: Open in browser, verify**

Verify:
- Sidebar shows "▶ Онбординг" (3 animations) and "▶ Дашборд" (2 animations)
- Chart Reveal shows staggered bar animation
- Counter Up counts from 0 to 1284 with JS
- All buttons work (Replay, Copy, Download)

- [ ] **Step 3: Create standalone download files**

Create `downloads/dashboard/chart-reveal.html`:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Chart Reveal — Дашборд</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0d1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

@keyframes barReveal {
  from { height: 0; opacity: 0; }
  to { height: var(--bar-height, 50%); opacity: 1; }
}

.demo-chart {
  display: flex; align-items: flex-end; gap: 12px; height: 120px; padding: 0 20px;
}

.demo-bar {
  width: 32px; background: #a0a0ff; border-radius: 4px 4px 0 0;
  animation: barReveal 0.6s ease-out var(--bar-delay, 0s) both;
}
</style>
</head>
<body>
<div class="demo-chart">
  <div class="demo-bar" style="--bar-height: 60%; --bar-delay: 0s;"></div>
  <div class="demo-bar" style="--bar-height: 85%; --bar-delay: 0.1s;"></div>
  <div class="demo-bar" style="--bar-height: 45%; --bar-delay: 0.2s;"></div>
  <div class="demo-bar" style="--bar-height: 70%; --bar-delay: 0.3s;"></div>
</div>
</body>
</html>
```

Create `downloads/dashboard/counter-up.html`:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Counter Up — Дашборд</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0d1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.demo-counter-wrap { text-align: center; }
.demo-counter-value {
  font-size: 48px; font-weight: 700; color: #e0e0ff;
  font-variant-numeric: tabular-nums;
}
.demo-counter-label { font-size: 13px; color: #6c6c9c; margin-top: 4px; }
</style>
</head>
<body>
<div class="demo-counter-wrap">
  <div class="demo-counter-value" data-target="1284">0</div>
  <div class="demo-counter-label">Active Users</div>
</div>
<script>
const el = document.querySelector('.demo-counter-value');
const target = parseInt(el.dataset.target, 10);
const duration = 1000;
const start = performance.now();

function tick(now) {
  const elapsed = now - start;
  const progress = Math.min(elapsed / duration, 1);
  const eased = 1 - Math.pow(1 - progress, 3);
  el.textContent = Math.round(target * eased);
  if (progress < 1) requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
</script>
</body>
</html>
```

- [ ] **Step 4: Verify download files**

Download and open each file standalone. Verify animations play correctly.

- [ ] **Step 5: Commit**

```bash
git add index.html downloads/dashboard/
git commit -m "feat: add 2 dashboard animations — chart reveal, counter up"
```

---

### Task 6: Final Polish and Verification

**Files:**
- Verify all existing files

- [ ] **Step 1: End-to-end walkthrough**

Open `index.html` in browser. Walk through every animation:
1. Click each animation in sidebar — verify preview, spec, code blocks render
2. Click Replay — verify animation restarts
3. Click Copy on each code block — verify clipboard contains correct code
4. Click Download — verify standalone file downloads and works
5. Copy a URL hash link (e.g., `#дашборд/counter-up`), open in new tab — verify direct link works
6. Navigate to a non-existent hash (`#nonexistent/thing`) — verify fallback to first animation

- [ ] **Step 2: Fix any issues found**

Address any bugs discovered during walkthrough.

- [ ] **Step 3: Final commit if changes were made**

```bash
git add -A
git commit -m "fix: polish from end-to-end verification"
```

- [ ] **Step 4: Push to GitHub**

Create a repo on GitHub and push:

```bash
git remote add origin <github-repo-url>
git branch -M main
git push -u origin main
```

Requires: GitHub repo URL from user.
