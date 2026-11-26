(function () {
  'use strict';
  const W = ['日', '月', '火', '水', '木', '金', '土'];
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const U = {
    pad,
    parseDate(s) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
      if (!m) return null;
      const y = +m[1], mo = +m[2], d = +m[3], dt = new Date(y, mo - 1, d);
      return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d ? dt : null;
    },
    iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); },
    today() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); },
    addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); },
    // a - b in calendar days (DST/TZ safe)
    diff(a, b) {
      return Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 864e5);
    },
    fmt(d) { return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' (' + W[d.getDay()] + ')'; },
    stamp(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes()); },
    uid() {
      return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    },
    safeUrl(u) {
      if (typeof u !== 'string' || !u.trim()) return null;
      try { const x = new URL(u.trim()); return x.protocol === 'http:' || x.protocol === 'https:' ? x.href : null; } catch (e) { return null; }
    },
    // DOM helper: h('div.cls#id', {attr}, ...children) – strings become text nodes (no innerHTML)
    h(tag, attrs, ...kids) {
      const parts = tag.split('.'), el = document.createElement(parts[0] || 'div');
      if (parts.length > 1) el.className = parts.slice(1).join(' ');
      for (const k in (attrs || {})) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
        else if (k === 'text') el.textContent = v;
        else el.setAttribute(k, v === true ? '' : v);
      }
      for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
      return el;
    },
    icon(name) {
      const NS = 'http://www.w3.org/2000/svg', s = document.createElementNS(NS, 'svg'), u = document.createElementNS(NS, 'use');
      s.setAttribute('class', 'ico'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('viewBox', '0 0 24 24');
      u.setAttribute('href', '#i-' + name); s.append(u); return s;
    },
    uniq(arr) { return [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ja')); }
  };
  window.RxApp = Object.assign(window.RxApp || {}, { U });
})();
