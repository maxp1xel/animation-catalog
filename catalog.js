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

    // Code blocks — file-based (fetch snippets) or template-based
    if (file) {
      renderCodeBlocksFromFile(file);
    } else {
      renderCodeBlocks(el);
    }
  }

  // --- Preview ---
  function renderPreview(anim) {
    const preview = document.getElementById('preview');
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

  // --- Code Blocks from file (snippet markers) ---
  function renderCodeBlocksFromFile(file) {
    const container = document.getElementById('code-blocks');
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
