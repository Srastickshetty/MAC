// Navigation, anchor links and the custom cursor.
import { scroller, scrollToEl, scrollToY } from './scroll.js';

export function initUI({ reduce }) {
  const root = document.documentElement;
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const overlay = document.getElementById('navOverlay');
  const inertTargets = [document.getElementById('main'), document.querySelector('footer')].filter(Boolean);

  // --- nav background after the first bit of scrolling ---
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- mobile overlay ---
  let open = false;
  function setOpen(next, returnFocus = true) {
    if (next === open) return;
    open = next;
    overlay.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.style.overflow = open ? 'hidden' : '';
    inertTargets.forEach((el) => { el.inert = open; });
    if (scroller.lenis) open ? scroller.lenis.stop() : scroller.lenis.start();
    if (open) {
      const first = overlay.querySelector('a');
      if (first) setTimeout(() => first.focus({ preventScroll: true }), 50);
    } else if (returnFocus) {
      toggle.focus({ preventScroll: true });
    }
  }
  toggle.addEventListener('click', () => setOpen(!open));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) setOpen(false);
  });
  // If the window grows to desktop width while the overlay is open, close it.
  matchMedia('(min-width: 900px)').addEventListener('change', (m) => {
    if (m.matches) setOpen(false, false);
  });

  // --- anchor links (smooth scroll, works with Lenis and without) ---
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const id = a.getAttribute('href');
    if (!id || id.length < 2) return;
    const wasOpen = open;
    if (id === '#top') {
      e.preventDefault();
      setOpen(false, false);
      scrollToY(0);
      return;
    }
    let el = null;
    try { el = document.querySelector(id); } catch (_) { /* invalid selector */ }
    if (!el) return;
    e.preventDefault();
    setOpen(false, false);
    // Give the browser a frame to restore scrolling after the overlay closes.
    requestAnimationFrame(() => {
      scrollToEl(el);
      try { history.pushState(null, '', id); } catch (_) { /* file:// etc. */ }
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    });
    if (wasOpen) toggle.blur();
  });

  // --- custom cursor (mouse devices only) ---
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cursor = document.getElementById('cursor');
  if (fine && !reduce && cursor) {
    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    let mx = -100, my = -100, rx = -100, ry = -100, seen = false;
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!seen) { seen = true; rx = mx; ry = my; root.classList.add('has-cursor'); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => root.classList.remove('has-cursor'));
    document.addEventListener('pointerenter', () => { if (seen) root.classList.add('has-cursor'); });
    document.addEventListener('mouseover', (e) => {
      const hot = e.target.closest && e.target.closest('a, button, [data-tilt], .menu-tab, .dish.has-img');
      root.classList.toggle('cursor-hover', !!hot);
    });
    (function loop() {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    })();
  }
}
