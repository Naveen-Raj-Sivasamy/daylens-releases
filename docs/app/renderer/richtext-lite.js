// A small rich-text box: **bold**, *italic*, - bullets, 1. numbered lists
// and [links](https://…) — the same light format the forms' rich text
// fields store. It's saved as that plain text (readable straight in the
// Sheet cell) and turned into formatting only where it's shown, escaped
// first so nothing typed can become real HTML or a script link.
(function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function inline(line) {
    return line
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*([^\s*](?:[^*]*[^\s*])?)\*(?!\*)/g, '$1<em>$2</em>');
  }
  function render(text) {
    if (!text) return '';
    let out = '';
    let list = null;
    const close = () => { if (list) { out += '</' + list + '>'; list = null; } };
    esc(text).split('\n').forEach((line) => {
      const b = /^\s*[-•] (.*)$/.exec(line);
      const n = /^\s*\d+\. (.*)$/.exec(line);
      if (b || n) {
        const want = b ? 'ul' : 'ol';
        if (list !== want) { close(); out += '<' + want + '>'; list = want; }
        out += '<li>' + inline((b || n)[1]) + '</li>';
      } else {
        close();
        out += inline(line) + '<br>';
      }
    });
    close();
    return out.replace(/(<br>)+$/, '');
  }
  function plain(text) {
    return String(text || '')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/(^|[^*\w])\*([^\s*](?:[^*]*[^\s*])?)\*(?!\*)/g, '$1$2');
  }

  // The editor: toolbar + text box + live preview. Returns the element,
  // with .value (get/set) and .setDisabled(on, why).
  function editor(value, opts) {
    opts = opts || {};
    const wrap = document.createElement('div');
    wrap.className = 'rt-wrap' + (opts.className ? ' ' + opts.className : '');
    const bar = document.createElement('div');
    bar.className = 'rt-toolbar';
    bar.setAttribute('role', 'toolbar');
    const ta = document.createElement('textarea');
    ta.className = 'rt-text';
    ta.rows = opts.rows || 4;
    ta.maxLength = opts.maxLength || 4000;
    ta.placeholder = opts.placeholder || '';
    ta.value = value || '';
    if (opts.label) ta.setAttribute('aria-label', opts.label);
    const linkRow = document.createElement('div');
    linkRow.className = 'rt-link-row';
    linkRow.hidden = true;
    linkRow.innerHTML = '<input type="url" class="rt-link-url" placeholder="Paste the link — https://…" aria-label="Link address" /><button type="button" class="rt-btn plain-btn rt-link-add">Add link</button><button type="button" class="rt-btn plain-btn rt-link-cancel">Cancel</button>';
    const preview = document.createElement('div');
    preview.className = 'rt-preview';
    preview.setAttribute('aria-live', 'polite');

    let sel = [0, 0];
    const remember = () => { sel = [ta.selectionStart, ta.selectionEnd]; };
    ta.addEventListener('select', remember);
    ta.addEventListener('keyup', remember);
    ta.addEventListener('mouseup', remember);
    const sync = () => {
      preview.innerHTML = ta.value.trim() ? render(ta.value) : '<span class="rt-preview-empty">' + esc(opts.emptyPreview || 'Preview appears here as you type…') + '</span>';
      if (opts.onChange) opts.onChange(ta.value);
    };
    const wrapSel = (before, after) => {
      const [s, e] = [ta.selectionStart, ta.selectionEnd];
      ta.focus();
      ta.setRangeText(before + ta.value.slice(s, e) + after, s, e, 'end');
      sync();
    };
    const prefixLines = (make) => {
      const s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
      const ls = v.lastIndexOf('\n', s - 1) + 1;
      const nb = v.indexOf('\n', e);
      const le = nb === -1 ? v.length : nb;
      ta.focus();
      ta.setRangeText(v.slice(ls, le).split('\n').map(make).join('\n'), ls, le, 'end');
      sync();
    };
    const btn = (label, title, cls, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'rt-btn plain-btn ' + cls;
      b.textContent = label;
      b.title = title;
      b.setAttribute('aria-label', title);
      b.onmousedown = (e) => e.preventDefault(); // keep the selection in the text box
      b.onclick = fn;
      bar.appendChild(b);
      return b;
    };
    btn('B', 'Bold', 'rt-bold', () => wrapSel('**', '**'));
    btn('I', 'Italic', 'rt-italic', () => wrapSel('*', '*'));
    btn('•', 'Bullet list', 'rt-bullets', () => prefixLines((l) => (/^\s*[-•] /.test(l) ? l : '- ' + l)));
    btn('1.', 'Numbered list', 'rt-numbers', () => prefixLines((l, i) => (i + 1) + '. ' + l.replace(/^\s*\d+\.\s*/, '')));
    btn('🔗', 'Insert link', 'rt-link', () => {
      remember();
      linkRow.hidden = false;
      linkRow.querySelector('.rt-link-url').value = '';
      linkRow.querySelector('.rt-link-url').focus();
    });
    const addLink = () => {
      let url = linkRow.querySelector('.rt-link-url').value.trim();
      if (!url) return;
      if (!/^(https?:\/\/|mailto:)/i.test(url)) url = (/@/.test(url) && !/\//.test(url) ? 'mailto:' : 'https://') + url;
      const [s, e] = sel;
      const label = ta.value.slice(s, e) || url.replace(/^mailto:|^https?:\/\//i, '');
      ta.focus();
      ta.setRangeText('[' + label + '](' + url.replace(/\s/g, '%20') + ')', s, e, 'end');
      linkRow.hidden = true;
      sync();
    };
    linkRow.querySelector('.rt-link-add').onclick = addLink;
    linkRow.querySelector('.rt-link-url').onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } if (e.key === 'Escape') linkRow.hidden = true; };
    linkRow.querySelector('.rt-link-cancel').onclick = () => { linkRow.hidden = true; ta.focus(); };
    ta.addEventListener('input', sync);
    wrap.appendChild(bar);
    wrap.appendChild(ta);
    wrap.appendChild(linkRow);
    wrap.appendChild(preview);
    sync();
    Object.defineProperty(wrap, 'value', { get: () => ta.value, set: (v) => { ta.value = v || ''; sync(); } });
    wrap.setDisabled = (on, why) => {
      ta.disabled = !!on;
      bar.querySelectorAll('button').forEach((b) => { b.disabled = !!on; });
      wrap.classList.toggle('rt-disabled', !!on);
      wrap.title = on && why ? why : '';
    };
    return wrap;
  }

  window.DaylensRichText = { render, plain, editor };
})();
