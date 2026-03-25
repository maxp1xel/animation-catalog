# Catalog Template Redesign

Two-column layout replacing the current vertical stack.

## Layout

```
+------------------------------------------+
| Card Header (name, feature, actions)     |
+-------------------+----------------------+
|                   | SPECIFICATION        |
|    PREVIEW        |  Duration  | badges  |
|    (iframe)       |  Easing    | badges  |
|                   |  Delay     | badges  |
|    full height    |  CSS Vars  | badges  |
|    of right col   +----------------------+
|                   | Note (optional)      |
|                   +----------------------+
|                   | Code blocks          |
|                   |  CSS  [Copy]         |
|                   |  HTML [Copy]         |
|                   |  JS   [Copy]         |
+-------------------+----------------------+
```

## Changes from Current Design

### Grid layout
- `card-body`: `display: grid; grid-template-columns: 1fr 1fr; gap: 24px`
- Preview section: `grid-row: 1 / -1` — spans full height of right column
- Right column: flex column with spec, optional note, code blocks
- `max-width` increased from 900px to 1100px to accommodate two columns

### Spec table
- Current: grid of small cards (`spec-grid` with `auto-fit` columns)
- New: vertical table with rows — each row has a fixed-width label (120px) and value
- Values displayed in `badge` elements: monospace font, subtle accent background + border, rounded corners

### Badge styling
```css
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

### Section labels
- Uppercase labels "PREVIEW" and "SPECIFICATION" above each column
- `font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted)`

### Preview height
- `min-height: 600px` (up from 160px)
- iframe height: 600px (up from 500px)

### Optional note block
- Placed between spec and code blocks in right column
- Only rendered when `data-note` attribute is present on the animation section
- Styled with subtle accent background and border

### Note styling
```css
.note {
  background: rgba(160, 160, 255, 0.06);
  border: 1px solid rgba(160, 160, 255, 0.2);
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
}
```

### Code blocks
- Moved from full-width below everything to right column below spec/note
- No structural changes to individual code block styling

### Spec value badge parsing
- Spec values like `"0.4s / 1.8s"` are split on `/` and `,` separators
- Each token is wrapped in a `<span class="badge">` element
- Separators and any trailing text (e.g., "(stagger)") stay as plain text between badges

## Data Model Changes

One new optional attribute on `<section class="animation">`:
- `data-note` — optional technical note text (renders in note block)

## Files to Modify

1. **styles.css** — new layout styles (card-body grid, spec rows, badges, notes, section labels)
2. **catalog.js** — update `renderCard` / `renderSpec` to produce new markup; add note rendering
3. **index.html** — update card template structure (two-column grid, right column wrapper)

## What Stays the Same

- Sidebar (no changes)
- Card header (name, feature, actions)
- Hash-based routing
- File-based animation architecture
- Code block extraction via `@snippet` markers
- Copy functionality
- Replay functionality
- Download functionality
- Theme tokens (all existing CSS variables preserved)
