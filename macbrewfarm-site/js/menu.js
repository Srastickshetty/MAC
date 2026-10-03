// Menu: tabs + a printed-menu style sheet that re-themes per tab.
import { menu } from './data.js';

function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  kids.flat().forEach((kid) => { if (kid != null) el.append(kid); });
  return el;
}
const hop = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'hop');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#hop');
  svg.append(use);
  return svg;
};

export function initMenu({ animate }) {
  const host = document.getElementById('menuApp');
  if (!host) return;

  const tabsEl = h('div', { class: 'menu-tabs', role: 'tablist', 'aria-label': 'Menu sections' });
  const ink = h('span', { class: 'tab-ink', 'aria-hidden': 'true' });
  const tabs = menu.map((m, i) => {
    const b = h('button', {
      class: 'menu-tab', type: 'button', role: 'tab', id: 'tab-' + m.id,
      'aria-controls': 'menuPanel', 'aria-selected': 'false', tabindex: '-1', text: m.label,
    });
    b.addEventListener('click', () => select(i, true));
    tabsEl.append(b);
    return b;
  });
  tabsEl.append(ink);

  const titleH = h('h3');
  const title = h('div', { class: 'sheet-title' }, h('span', { class: 'line' }), hop(), titleH, hop(), h('span', { class: 'line' }));
  const note = h('p', { class: 'sheet-note' });
  const body = h('div', { class: 'sheet-body' });
  const sheet = h('div', { class: 'sheet', id: 'menuPanel', role: 'tabpanel', tabindex: '0' },
    h('div', { class: 'sheet-head' }, h('div', { class: 'sheet-badge' }, h('img', { src: 'media/img/mark-cream.png', alt: '', width: '64', height: '66' }))),
    title, note, body);
  host.append(tabsEl, sheet);

  // ---- rows ----
  function dish(item, columns) {
    const main = h('div', { class: 'dish-main' });
    const line = h('div', { class: 'dish-line' }, h('h4', { text: item.name }));
    if (item.prices) {
      line.append(h('span', { class: 'dots', 'aria-hidden': 'true' }),
        h('span', { class: 'p3' }, item.prices.map((p, i) => h('span', null, String(p), h('i', { text: columns ? columns[i] : '' })))));
    } else if (item.price != null) {
      line.append(h('span', { class: 'dots', 'aria-hidden': 'true' }), h('span', { class: 'price', text: String(item.price) }));
    }
    main.append(line);
    if (item.desc) main.append(h('p', { class: 'dish-desc', text: item.desc }));
    const li = h('li', { class: 'dish' + (item.img ? ' has-img' : '') }, main);
    if (item.img) {
      li.dataset.img = item.img;
      li.append(h('img', { class: 'dish-thumb', src: item.img, alt: '', width: '56', height: '56', loading: 'lazy' }));
    }
    return li;
  }

  function fill(m) {
    const list = h('ul', { class: 'dish-list' });
    if (m.groups) {
      m.groups.forEach((g) => {
        list.append(h('li', { class: 'group', text: g.label }));
        g.items.forEach((it) => list.append(dish(it, m.columns)));
      });
    } else {
      m.items.forEach((it) => list.append(dish(it, m.columns)));
    }
    body.textContent = '';
    body.append(list);
    titleH.textContent = m.title;
    note.textContent = m.note || '';
    note.hidden = !m.note;
    sheet.style.setProperty('--band', m.theme.band);
    sheet.style.setProperty('--ink', m.theme.ink);
    sheet.style.setProperty('--badge', m.theme.badge);
    sheet.setAttribute('aria-labelledby', 'tab-' + m.id);
    return list;
  }

  // ---- tabs ----
  let current = -1;
  function placeInk() {
    const t = tabs[current];
    if (!t) return;
    tabsEl.style.setProperty('--x', t.offsetLeft + 'px');
    tabsEl.style.setProperty('--w', t.offsetWidth + 'px');
  }
  function select(i, fromUser) {
    if (i === current) return;
    current = i;
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i));
      t.tabIndex = k === i ? 0 : -1;
    });
    const list = fill(menu[i]);
    placeInk();
    // keep the chosen tab visible in the horizontal strip on small screens
    const t = tabs[i];
    tabsEl.scrollTo({ left: Math.max(0, t.offsetLeft - (tabsEl.clientWidth - t.offsetWidth) / 2), behavior: animate ? 'smooth' : 'auto' });
    if (fromUser && animate && window.gsap) {
      const rows = list.children;
      gsap.from(rows, {
        y: 18, autoAlpha: 0, duration: 0.5, ease: 'power3.out', clearProps: 'all',
        stagger: Math.min(0.035, 0.7 / Math.max(1, rows.length)),
      });
    }
  }
  tabsEl.addEventListener('keydown', (e) => {
    const k = e.key;
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(k)) return;
    e.preventDefault();
    let n = current;
    if (k === 'ArrowRight') n = (current + 1) % tabs.length;
    if (k === 'ArrowLeft') n = (current - 1 + tabs.length) % tabs.length;
    if (k === 'Home') n = 0;
    if (k === 'End') n = tabs.length - 1;
    select(n, true);
    tabs[n].focus();
  });
  select(0, false);
  window.addEventListener('resize', placeInk);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeInk);

  // ---- hover image that follows the pointer (mouse only) ----
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const fig = h('figure', { class: 'hover-img', 'aria-hidden': 'true' }, h('img', { alt: '', width: '224', height: '224' }));
    document.body.append(fig);
    const im = fig.firstChild;
    const S = 224;
    let tx = 0, ty = 0, x = 0, y = 0, on = false, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      fig.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = on || Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    const aim = (e) => {
      tx = Math.min(e.clientX + 28, window.innerWidth - S - 12);
      ty = Math.max(12, Math.min(e.clientY - S / 2, window.innerHeight - S - 12));
    };
    body.addEventListener('mouseover', (e) => {
      const li = e.target.closest('.dish.has-img');
      if (!li) return;
      if (!on) { aim(e); x = tx; y = ty; }
      im.src = li.dataset.img;
      on = true;
      fig.classList.add('show');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    body.addEventListener('mousemove', (e) => { if (on) aim(e); });
    body.addEventListener('mouseout', (e) => {
      const li = e.target.closest('.dish.has-img');
      if (!li || li.contains(e.relatedTarget)) return;
      on = false;
      fig.classList.remove('show');
    });
    // Tab change or scroll while hovering: hide it.
    tabsEl.addEventListener('click', () => { on = false; fig.classList.remove('show'); });
    window.addEventListener('scroll', () => { if (on) { on = false; fig.classList.remove('show'); } }, { passive: true });
  }
}
