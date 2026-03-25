# Catalog Template Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the vertical-stack card layout with a two-column layout (preview left, spec+notes+code right).

**Architecture:** The card area becomes a CSS Grid with two columns. Preview spans the full left column height. The right column is a flex container stacking spec table, optional note, and code blocks. All rendering logic in `catalog.js` is updated to produce the new markup.

**Tech Stack:** Plain HTML, CSS, vanilla JS (no frameworks, no build step)

**Spec:** `docs/superpowers/specs/2026-03-25-catalog-template-redesign.md`

**Mockup:** `.superpowers/brainstorm/1376-1774437407/catalog-layout-v2.html`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `index.html` | Modify (lines 19–41) | Card template: add `card-body` grid wrapper, `preview-section`, `right-column` |
| `styles.css` | Modify | Remove old spec-grid styles, add: card-body grid, section-label, spec-row, badge, note, right-column |
| `catalog.js` | Modify | Update `renderCard`, `renderSpec`, code block target; add `renderNote`, `formatSpecValue` |

---

### Task 1: Update HTML card template

**Files:**
- Modify: `index.html:19-41`

- [ ] **Step 1: Replace the card markup inside `<main>` with the two-column structure**

The current structure is:
```html
<div class="card-header">...</div>
<div class="preview" id="preview"></div>
<div class="spec" id="spec"></div>
<div class="code-blocks" id="code-blocks"></div>
```

Replace with:
```html
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

<div class="card-body">
  <div class="preview-section">
    <div class="section-label">Preview</div>
    <div class="preview" id="preview"></div>
  </div>

  <div class="right-column">
    <div>
      <div class="section-label">Specification</div>
      <div class="spec" id="spec"></div>
    </div>
    <div class="note" id="note" style="display:none"></div>
    <div class="code-blocks" id="code-blocks"></div>
  </div>
</div>
```

Key points:
- `card-header` stays unchanged (same IDs, same buttons)
- New `card-body` grid wrapper with two children: `preview-section` and `right-column`
- `preview`, `spec`, `code-blocks` keep their IDs (JS references don't break)
- `note` block is hidden by default, shown when `data-note` exists

- [ ] **Step 2: Verify page loads without errors**

Run: open `index.html` in browser, check console for errors.
Expected: Page renders (will look broken until CSS is updated — that's fine).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "refactor: update card template to two-column grid structure"
```

---

### Task 2: Update CSS — layout and spec styles

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Update `.content` max-width**

In `styles.css`, change `.content` max-width from `900px` to `1100px`:
```css
.content {
  margin-left: var(--sidebar-width);
  flex: 1;
  padding: 24px 32px;
  max-width: 1100px;
}
```

- [ ] **Step 2: Add card-body grid and column styles**

Add after the `.card-actions` block (after line ~157):

```css
/* === Two-Column Layout === */
.card-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.preview-section {
  grid-row: 1 / -1;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
```

- [ ] **Step 3: Update preview styles**

Change `.preview` min-height to `600px` and `.preview-iframe` height to `600px`:
```css
.preview {
  background: var(--bg-preview);
  border: 1px solid var(--border);
  border-radius: 8px;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.preview-iframe {
  width: 100%;
  height: 600px;
  border: none;
  border-radius: 4px;
  background: transparent;
}
```

Note: `margin-bottom` removed (grid gap handles spacing now), `padding` set to 0 (iframe fills the container).

- [ ] **Step 4: Replace old spec styles with new spec-row table styles**

Remove the old spec styles (`.spec`, `.spec-title`, `.spec-grid`, `.spec-item-label`, `.spec-item-value`) and replace with:

```css
/* === Spec === */
.spec {
  background: var(--bg-spec);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0;
  overflow: hidden;
}

.spec-row {
  display: flex;
  align-items: baseline;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.spec-row:last-child {
  border-bottom: none;
}

.spec-label {
  width: 120px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.spec-value {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.5;
}

.badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 12px;
  background: rgba(160, 160, 255, 0.15);
  border: 1px solid rgba(160, 160, 255, 0.25);
  border-radius: 4px;
  padding: 1px 8px;
  color: var(--accent);
}
```

- [ ] **Step 5: Add note styles**

Add after spec styles:

```css
/* === Note === */
.note {
  background: rgba(160, 160, 255, 0.06);
  border: 1px solid rgba(160, 160, 255, 0.2);
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.note strong {
  color: var(--text-primary);
}
```

- [ ] **Step 6: Remove `margin-bottom` from `.code-block`**

The old `.code-block` has `margin-bottom: 12px`. Replace with a sibling combinator so the last block doesn't have a trailing margin:

```css
.code-block + .code-block {
  margin-top: 12px;
}
```

Remove the existing `margin-bottom: 12px` from `.code-block`.

- [ ] **Step 7: Verify layout in browser**

Open `index.html` — the two-column layout should now render correctly. Preview on the left, spec area on the right. Content will still use old JS rendering (spec-grid markup) but CSS should be close.

- [ ] **Step 8: Commit**

```bash
git add styles.css
git commit -m "style: two-column layout with spec rows, badges, and notes"
```

---

### Task 3: Update JavaScript — renderSpec, renderNote, badge formatting

**Files:**
- Modify: `catalog.js`

- [ ] **Step 1: Add `formatSpecValue` helper function**

Add before the `renderSpec` function (before line ~182):

```javascript
// Format spec value: wrap tokens in badge spans, keep separators as plain text
function formatSpecValue(raw) {
  // Split on / and , keeping the separators
  return raw.split(/(\s*[\/,]\s*)/).map(part => {
    const trimmed = part.trim();
    if (!trimmed || trimmed === '/' || trimmed === ',') {
      return part; // keep separator as-is
    }
    // Check if part has trailing parenthetical like "(stagger)"
    const match = trimmed.match(/^(.+?)(\s*\(.+\))$/);
    if (match) {
      return '<span class="badge">' + escapeHtml(match[1].trim()) + '</span>' + escapeHtml(match[2]);
    }
    return '<span class="badge">' + escapeHtml(trimmed) + '</span>';
  }).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
```

- [ ] **Step 2: Rewrite `renderSpec` function**

Replace the current `renderSpec` function (lines 182-196) with:

```javascript
function renderSpec(el) {
  const spec = document.getElementById('spec');
  const items = [];

  if (el.dataset.duration) items.push({ label: 'Duration', value: el.dataset.duration });
  if (el.dataset.easing) items.push({ label: 'Easing', value: el.dataset.easing });
  if (el.dataset.delay) items.push({ label: 'Delay', value: el.dataset.delay });
  if (el.dataset.cssVars) items.push({ label: 'CSS Variables', value: el.dataset.cssVars });

  spec.innerHTML = items.map(i =>
    '<div class="spec-row">' +
      '<div class="spec-label">' + escapeHtml(i.label) + '</div>' +
      '<div class="spec-value">' + formatSpecValue(i.value) + '</div>' +
    '</div>'
  ).join('');
}
```

Key change: no more `spec-title` / `spec-grid` wrapper — just rows directly inside `#spec`. Values go through `formatSpecValue` for badge wrapping.

- [ ] **Step 3: Add `renderNote` function**

Add after `renderSpec`:

```javascript
function renderNote(el) {
  const note = document.getElementById('note');
  const text = el.dataset.note;
  if (text) {
    note.innerHTML = '<strong>Note:</strong> ' + escapeHtml(text);
    note.style.display = '';
  } else {
    note.style.display = 'none';
  }
}
```

- [ ] **Step 4: Call `renderNote` from `renderCard`**

In the `renderCard` function (line ~100), add `renderNote(el)` after `renderSpec(el)`:

```javascript
function renderCard(anim) {
  const el = anim.el;

  document.getElementById('card-name').textContent = anim.name;
  document.getElementById('card-feature').textContent = anim.feature;

  const downloadBtn = document.getElementById('btn-download');
  const file = el.dataset.file;
  if (file) {
    downloadBtn.href = file;
    downloadBtn.style.display = '';
  } else {
    downloadBtn.style.display = 'none';
  }

  renderPreview(anim);
  renderSpec(el);
  renderNote(el);

  if (file) {
    renderCodeBlocksFromFile(file);
  } else {
    renderCodeBlocks(el);
  }
}
```

- [ ] **Step 5: Verify full rendering in browser**

Open `index.html` — the Chat Button Animation should render with:
- Two-column layout
- Preview iframe on the left (600px tall)
- Spec rows on the right with badge-styled values
- Code blocks below the spec in the right column
- No note (the animation doesn't have `data-note`)

- [ ] **Step 6: Test `data-note` attribute**

Temporarily add `data-note="Test note for validation"` to the Chat Button Animation section in `index.html`. Reload and verify the note block appears between spec and code. Remove the test attribute after verifying.

- [ ] **Step 7: Commit**

```bash
git add catalog.js
git commit -m "feat: spec rows with badges, optional notes, two-column rendering"
```

---

### Task 4: Final verification and cleanup

- [ ] **Step 1: Full visual check against mockup**

Open both the mockup (`.superpowers/brainstorm/1376-1774437407/catalog-layout-v2.html`) and the real catalog (`index.html`) side by side. Verify:
- Section labels "PREVIEW" / "SPECIFICATION" present and styled
- Spec rows match mockup (label left, badge values right)
- Code blocks are in the right column
- Preview is tall enough
- No visual regressions in sidebar, header, buttons

- [ ] **Step 2: Test replay and copy functionality**

- Click "Replay" — iframe should reload
- Click "Copy" on a code block — clipboard should contain the code
- Click "Download HTML" — file should download

- [ ] **Step 3: Test hash navigation**

- Reload the page — should navigate to the animation from the URL hash
- Click sidebar links — should switch animations

- [ ] **Step 4: Clean up any remaining old CSS classes**

Check `styles.css` for orphaned classes that are no longer referenced:
- `.spec-title` — removed (section label is now in HTML)
- `.spec-grid` — removed (replaced by spec-row)
- `.spec-item-label` — removed (replaced by spec-label)
- `.spec-item-value` — removed (replaced by spec-value)

If any remain, remove them.

- [ ] **Step 5: Commit final cleanup if needed**

```bash
git add -A
git commit -m "chore: remove orphaned spec-grid styles"
```
