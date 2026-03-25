# Agents Instructions

## Documentation Maintenance

When making any changes to the project, update the relevant documentation:

- **README.md** — update if changes affect: file structure, how to add animations, deploy process, design tokens, or functionality
- **docs/superpowers/specs/2026-03-25-animation-catalog-design.md** — update if changes affect: architecture, data format, layout, deployment workflow, or scope decisions

Do not let documentation drift from the actual implementation. If you add a feature, change a convention, or modify the file structure — update docs in the same commit.

## Code Conventions

- No build step. Everything is plain HTML + CSS + JS.
- All internal links must be relative (no leading `/`).
- Animations are organized by product features, not by animation type.
- Standalone files in `downloads/` must stay in sync with `<template>` content in `index.html`.
- Dark theme only. Color tokens: `#0d0d1a` (preview bg), `#1a1a2e` (page bg), `#12122a` (sidebar bg), `#a0a0ff` (accent).

## Deployment

- Deploy target: `test.shaihalov.com/animations/`
- Other projects exist on the same domain under different paths — never deploy to the root or affect other directories.
- rsync `--delete` is scoped to `/animations/` only.
