(function () {
  'use strict';

  const state = {
    animations: [],   // { el, feature, name, slug }
    features: [],     // { name, animations[] }
    active: null,     // current animation object
  };

  const dom = {};

  // --- Init ---
  function init() {
    dom.sidebarNav  = document.getElementById('sidebar-nav');
    dom.cardName    = document.getElementById('card-name');
    dom.cardFeature = document.getElementById('card-feature');
    dom.btnDownload = document.getElementById('btn-download');
    dom.btnReplay   = document.getElementById('btn-replay');
    dom.preview     = document.getElementById('preview');
    dom.spec        = document.getElementById('spec');
    dom.note        = document.getElementById('note');
    dom.codeBlocks  = document.getElementById('code-blocks');

    dom.btnReplay.addEventListener('click', () => {
      if (state.active) renderPreview(state.active);
    });

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
    const nav = dom.sidebarNav;
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
    dom.cardName.textContent = anim.name;
    dom.cardFeature.textContent = anim.feature;

    // Download
    const downloadBtn = dom.btnDownload;
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
    renderNote(el);

    // Code blocks — file-based (fetch snippets) or template-based
    if (file) {
      renderCodeBlocksFromFile(file);
    } else {
      renderCodeBlocks(el);
    }
  }

  // --- Preview ---
  function renderPreview(anim) {
    const preview = dom.preview;
    const el = anim.el;
    const file = el.dataset.file;

    // Clear previous
    preview.innerHTML = '';

    // File-based: use iframe
    if (file) {
      const iframe = document.createElement('iframe');
      iframe.src = file;
      iframe.className = 'preview-iframe';
      iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
      iframe.setAttribute('loading', 'lazy');
      preview.appendChild(iframe);
      return;
    }

    // Template-based fallback
    const cssTemplate = el.querySelector('.animation-css');
    if (cssTemplate) {
      const style = document.createElement('style');
      style.textContent = cssTemplate.content.textContent;
      preview.appendChild(style);
    }

    const htmlTemplate = el.querySelector('.animation-html');
    if (htmlTemplate) {
      const container = document.createElement('div');
      container.innerHTML = htmlTemplate.innerHTML;
      preview.appendChild(container);
    }

    const jsTemplate = el.querySelector('.animation-js');
    if (jsTemplate && jsTemplate.content.textContent.trim()) {
      const script = document.createElement('script');
      script.textContent = jsTemplate.content.textContent;
      preview.appendChild(script);
    }
  }

  // --- Spec ---

  // Format spec value: wrap tokens in badge spans, keep separators as plain text
  function formatSpecValue(raw) {
    // Tokenize: split on / and , but NOT inside parentheses
    const tokens = [];
    let depth = 0, current = '';
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (ch === '(') { depth++; current += ch; }
      else if (ch === ')') { depth--; current += ch; }
      else if (depth === 0 && (ch === '/' || ch === ',')) {
        tokens.push(current);
        tokens.push(ch); // separator
        current = '';
      } else {
        current += ch;
      }
    }
    if (current) tokens.push(current);

    return tokens.map(part => {
      const trimmed = part.trim();
      if (!trimmed || trimmed === '/' || trimmed === ',') {
        return part; // keep separator as-is
      }
      // Check if part has trailing parenthetical like "(stagger)"
      const match = trimmed.match(/^(.+?)(\s+\(.+\))$/);
      if (match) {
        return '<span class="badge">' + escapeHtml(match[1].trim()) + '</span>' + escapeHtml(match[2]);
      }
      return '<span class="badge">' + escapeHtml(trimmed) + '</span>';
    }).join('');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderSpec(el) {
    const spec = dom.spec;
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

  function renderNote(el) {
    const note = dom.note;
    const text = el.dataset.note;
    if (text) {
      note.innerHTML = '<strong>Note:</strong> ' + escapeHtml(text);
      note.style.display = '';
    } else {
      note.style.display = 'none';
    }
  }

  // --- Code Blocks from file (snippet markers) ---
  function renderCodeBlocksFromFile(file) {
    const container = dom.codeBlocks;
    container.innerHTML = '';

    fetch(file)
      .then(r => r.text())
      .then(text => {
        const snippets = extractSnippets(text);
        const labels = { css: 'CSS', html: 'HTML', js: 'JavaScript' };

        Object.keys(snippets).forEach(type => {
          const code = snippets[type];
          if (!code) return;
          appendCodeBlock(container, labels[type] || type, code);
        });
      });
  }

  // Extract content between @snippet markers
  // Supports: /* @snippet:css */ ... /* @snippet:end */
  //           <!-- @snippet:html --> ... <!-- @snippet:end -->
  function extractSnippets(text) {
    const snippets = {};
    const regex = /(?:\/\*|<!--)\s*@snippet:(\w+)\s*(?:\*\/|-->)([\s\S]*?)(?:\/\*|<!--)\s*@snippet:end\s*(?:\*\/|-->)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      snippets[match[1]] = match[2].trim();
    }
    return snippets;
  }

  // --- Code Blocks from templates ---
  function renderCodeBlocks(el) {
    const container = dom.codeBlocks;
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
        : template.content.textContent.trim();

      if (!code) return;
      appendCodeBlock(container, label, code);
    });
  }

  // --- Shared: append a code block with Copy ---
  function appendCodeBlock(container, label, code) {
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
