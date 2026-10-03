// Shared scroll helpers. `scroller.lenis` is filled in by main.js when smooth scroll is active.

export const scroller = { lenis: null };

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function scrollToY(y, { immediate = false, duration = 1.4 } = {}) {
  if (scroller.lenis) {
    scroller.lenis.scrollTo(y, { immediate, duration });
  } else {
    window.scrollTo({ top: y, behavior: immediate || reduce ? 'auto' : 'smooth' });
  }
}

export function scrollToEl(el, opts) {
  const y = el.getBoundingClientRect().top + window.scrollY;
  scrollToY(y, opts);
}
