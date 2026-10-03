// ---------------------------------------------------------------------------
// Mac Brew Farm: Main Application Entry
// World-class UI/UX, buttery smooth Lenis scrolling, no fake 3D glass traps.
// ---------------------------------------------------------------------------
import { site } from './data.js';
import { subscribe, markReady } from './store.js';
import { scroller, scrollToEl } from './scroll.js';
import { initUI } from './ui.js';
import { initCocktails } from './cocktails.js';
import { initVideoTheater } from './video-theater.js';
import { initMenu } from './menu.js';
import { initSections } from './sections.js';

clearTimeout(window.__mbfFallback);

const $ = (s, r = document) => r.querySelector(s);
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const libsOk = !!(window.gsap && window.ScrollTrigger);
const isStatic = reduce || !libsOk;

if (isStatic) root.classList.add('is-static');
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

// ---------------------------------------------------------------------------
// Contact & Hours Details
// ---------------------------------------------------------------------------
function fillSite() {
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  const info = $('#visitInfo');
  const cta = $('#visitCta');
  if (!info || !cta) return;

  const row = (label, node) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.append(node);
    info.append(dt, dd);
  };

  const link = (href, text, cls) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    if (cls) a.className = cls;
    if (/^https?:/.test(href)) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    return a;
  };

  if (site.address) row('Address', document.createTextNode(site.address));
  if (site.hours) row('Hours', document.createTextNode(site.hours));
  if (site.phone) row('Reservations', link('tel:' + site.phone.replace(/[^\d+]/g, ''), site.phone));
  if (site.email) row('Email', link('mailto:' + site.email, site.email));

  if (site.mapsUrl) {
    const dir = cta.querySelector('a');
    if (dir) dir.href = site.mapsUrl;
  }
  if (site.whatsapp) {
    const waText = encodeURIComponent("Hi Mac Brew Farm, I would like to reserve a table / inquire about tonight's line-up.");
    cta.append(link('https://wa.me/' + site.whatsapp.replace(/\D/g, '') + '?text=' + waText, 'WhatsApp RSVP', 'btn btn-ghost'));
  }
  if (site.instagram) {
    cta.append(link(site.instagram, 'Instagram', 'btn btn-ghost'));
  }
}

// ---------------------------------------------------------------------------
// Smooth Scroll (Lenis) wired to ScrollTrigger
// ---------------------------------------------------------------------------
function setupSmoothScroll() {
  if (isStatic || !window.Lenis) return;
  const lenis = new window.Lenis({
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: false,
  });
  scroller.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop(); // unlocked when preloader finishes
}

// ---------------------------------------------------------------------------
// Fixed Background Ambient Glow
// ---------------------------------------------------------------------------
function setupBackground() {
  const glow = $('#bgGlow');
  if (!glow) return;

  const parse = (hex) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  subscribe((s) => {
    if (s.liquid) {
      const rgb = parse(s.liquid);
      glow.style.setProperty('--glow', `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.35)`);
    }
  });
}

// ---------------------------------------------------------------------------
// Preloader: Fast, sleek, authentic
// ---------------------------------------------------------------------------
function runPreloader() {
  const pl = $('#preloader');
  const bar = $('#plBar');
  const num = $('#plNum');
  let finished = false;

  function reveal(withAnimation) {
    if (finished) return;
    finished = true;
    root.classList.remove('is-loading');

    const go = () => {
      if (scroller.lenis) scroller.lenis.start();
      markReady();
      if (libsOk) ScrollTrigger.refresh();
      const hash = location.hash;
      if (hash.length > 1) {
        let el = null;
        try { el = document.querySelector(hash); } catch (_) {}
        if (el) setTimeout(() => scrollToEl(el, { immediate: true }), 80);
      }
    };

    if (!pl) {
      go();
      return;
    }

    if (withAnimation && libsOk && !reduce) {
      const tl = gsap.timeline({ onComplete: () => pl.remove() });
      tl.to('.pl-center', { autoAlpha: 0, scale: 0.94, duration: 0.35, ease: 'power2.in' })
        .add(go, '-=0.1')
        .to('.pl-top', { yPercent: -101, duration: 0.8, ease: 'power4.inOut' }, '<')
        .to('.pl-bottom', { yPercent: 101, duration: 0.8, ease: 'power4.inOut' }, '<');
    } else {
      pl.style.opacity = '0';
      setTimeout(() => pl.remove(), 350);
      go();
    }
  }

  if (!pl || isStatic) {
    reveal(false);
    return;
  }

  const C = 339.3;
  const t0 = performance.now();
  let shown = 0;

  function frame(now) {
    if (finished) return;
    const elapsed = now - t0;
    const targetProgress = Math.min(1, elapsed / 800);
    shown += (targetProgress - shown) * 0.18;

    if (shown > 0.98 || elapsed > 1200) shown = 1;
    if (bar) bar.style.strokeDashoffset = String(C * (1 - shown));
    if (num) num.textContent = String(Math.round(shown * 100));

    if (shown >= 1) {
      setTimeout(() => reveal(true), 120);
      return;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  setTimeout(() => reveal(true), 2500);
}

// ---------------------------------------------------------------------------
// App Boot Sequence
// ---------------------------------------------------------------------------
function boot() {
  if (libsOk) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  fillSite();
  setupSmoothScroll();
  setupBackground();
  initUI({ reduce });
  initCocktails({ isStatic });
  initVideoTheater({ isStatic, reduce });
  initMenu({ animate: !isStatic });
  initSections({ isStatic, reduce });

  runPreloader();

  if (libsOk) {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  }
}

try {
  boot();
} catch (err) {
  console.error(err);
  root.classList.remove('is-loading');
  root.classList.add('is-static');
  const pl = $('#preloader');
  if (pl) pl.remove();
  markReady();
}
