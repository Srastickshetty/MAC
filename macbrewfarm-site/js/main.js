// Mac Brew Farm: boot sequence.
// Order: detect motion + libraries -> start the 3D scene loading -> build sections -> preloader -> reveal.
import { site } from './data.js';
import { subscribe, intro, markReady } from './store.js';
import { scroller, scrollToEl } from './scroll.js';
import { initUI } from './ui.js';
import { initCocktails } from './cocktails.js';
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
// Contact details from data.js (blank fields stay hidden)
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
    if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  };

  if (site.address) row('Address', document.createTextNode(site.address));
  if (site.hours) row('Hours', document.createTextNode(site.hours));
  if (site.phone) row('Phone', link('tel:' + site.phone.replace(/[^\d+]/g, ''), site.phone));
  if (site.email) row('Email', link('mailto:' + site.email, site.email));
  if (!info.children.length) info.remove();

  if (site.mapsUrl) {
    const dir = cta.querySelector('a');
    if (dir) dir.href = site.mapsUrl;
  }
  if (site.whatsapp) cta.append(link('https://wa.me/' + site.whatsapp.replace(/\D/g, ''), 'WhatsApp', 'btn btn-ghost'));
  if (site.instagram) cta.append(link(site.instagram, 'Instagram', 'btn btn-ghost'));
}

// ---------------------------------------------------------------------------
// Smooth scroll (Lenis) wired to ScrollTrigger
// ---------------------------------------------------------------------------
function setupSmoothScroll() {
  if (isStatic || !window.Lenis) return;
  const lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  scroller.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop(); // released when the preloader leaves
}

// ---------------------------------------------------------------------------
// Fixed background: forest green -> maroon as the hero scrolls out,
// with a soft glow that takes the colour of the active cocktail.
// ---------------------------------------------------------------------------
function setupBackground() {
  const maroon = $('#bgMaroon');
  const glow = $('#bgGlow');
  if (!maroon || !glow) return;

  const GREEN = [36, 74, 57];
  const parse = (hex) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  let cur = GREEN.slice();
  let target = GREEN.slice();
  let heroP = 0;
  let running = false;

  function paint() {
    maroon.style.opacity = heroP.toFixed(3);
    glow.style.setProperty('--glow', `rgba(${cur[0] | 0}, ${cur[1] | 0}, ${cur[2] | 0}, ${(0.85 - 0.25 * heroP).toFixed(2)})`);
  }
  function tick() {
    let moving = false;
    for (let i = 0; i < 3; i++) {
      const d = target[i] - cur[i];
      if (Math.abs(d) > 0.5) { cur[i] += d * 0.08; moving = true; } else cur[i] = target[i];
    }
    paint();
    if (moving) requestAnimationFrame(tick); else running = false;
  }
  subscribe((s) => {
    heroP = s.heroP;
    const liquid = parse(s.liquid);
    // Green in the hero, the cocktail colour (darkened a little) once pinned.
    const mix = heroP;
    target = GREEN.map((g, i) => g + (liquid[i] * 0.75 - g) * mix);
    paint();
    if (!running) { running = true; requestAnimationFrame(tick); }
  });
  paint();
}

// ---------------------------------------------------------------------------
// Preloader
// ---------------------------------------------------------------------------
function runPreloader(scenePromise) {
  const pl = $('#preloader');
  const bar = $('#plBar');
  const num = $('#plNum');
  let finished = false;

  const visited = (() => {
    try { return sessionStorage.getItem('mbf-visited') === '1'; } catch (_) { return false; }
  })();
  try { sessionStorage.setItem('mbf-visited', '1'); } catch (_) { /* ignore */ }

  function reveal(withAnimation) {
    if (finished) return;
    finished = true;
    root.classList.remove('is-loading');
    const go = () => {
      if (scroller.lenis) scroller.lenis.start();
      window.scrollTo(0, 0);
      markReady();
      if (libsOk) ScrollTrigger.refresh();
      const hash = location.hash;
      if (hash.length > 1) {
        let el = null;
        try { el = document.querySelector(hash); } catch (_) { /* ignore */ }
        if (el) setTimeout(() => scrollToEl(el, { immediate: true }), 60);
      }
      // Safety net: if the glass intro never ran, show it.
      setTimeout(() => { if (intro.v < 1) intro.v = 1; }, 7000);
    };
    if (!pl) { go(); return; }
    if (withAnimation && libsOk && !reduce) {
      const tl = gsap.timeline({ onComplete: () => pl.remove() });
      tl.to('.pl-center', { autoAlpha: 0, scale: 0.92, duration: 0.45, ease: 'power2.in' })
        .add(go, '-=0.1')
        .to('.pl-top', { yPercent: -101, duration: 1, ease: 'power4.inOut' }, '<')
        .to('.pl-bottom', { yPercent: 101, duration: 1, ease: 'power4.inOut' }, '<');
    } else {
      pl.style.transition = 'opacity .4s';
      pl.style.opacity = '0';
      setTimeout(() => pl.remove(), 450);
      go();
    }
  }

  if (!pl || isStatic) {
    // No animation: reveal as soon as the page itself has loaded.
    const done = () => reveal(false);
    if (document.readyState === 'complete') done(); else window.addEventListener('load', done, { once: true });
    setTimeout(done, 5000);
    return;
  }

  // Progress = fonts (25%) + page load (25%) + 3D scene (50%), eased, with a minimum show time.
  const parts = { fonts: false, load: document.readyState === 'complete', scene: false };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { parts.fonts = true; });
  else parts.fonts = true;
  if (!parts.load) window.addEventListener('load', () => { parts.load = true; }, { once: true });
  scenePromise.then(() => { parts.scene = true; });

  const C = 339.3;
  const MIN = visited ? 500 : 1800;
  const MAX = 7000;
  const t0 = performance.now();
  let shown = 0;
  let last = t0;

  function frame(now) {
    if (finished) return;
    const el = now - t0;
    const real = el > MAX ? 1 : (parts.fonts ? 0.25 : 0) + (parts.load ? 0.25 : 0) + (parts.scene ? 0.5 : 0);
    const goal = Math.min(real, Math.min(1, el / MIN));
    const dt = now - last;
    last = now;
    shown += (goal - shown) * (1 - Math.exp(-dt / 140));
    if (goal >= 1 && shown > 0.992) shown = 1;
    bar.style.strokeDashoffset = String(C * (1 - shown));
    num.textContent = String(Math.round(shown * 100));
    if (shown >= 1) {
      setTimeout(() => reveal(true), 180);
      return;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  // Hard stop: never leave a visitor staring at the loader.
  setTimeout(() => reveal(true), MAX + 2500);
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
function boot() {
  // Start the 3D scene loading first so it downloads while the rest builds.
  let scenePromise = Promise.resolve(false);
  if (!isStatic) {
    const canvas = $('#gl');
    scenePromise = import('./scene.js')
      .then((m) => m.initScene(canvas))
      .then(() => true)
      .catch((err) => {
        console.warn('3D scene unavailable, using the flat layout.', err);
        root.classList.add('no-gl');
        return false;
      });
  } else {
    intro.v = 1;
  }

  if (libsOk) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  fillSite();
  setupSmoothScroll();
  setupBackground();
  initUI({ reduce });
  initMenu({ animate: !isStatic });
  initCocktails({ isStatic });
  initSections({ isStatic, reduce });

  runPreloader(scenePromise);

  // Layout settles once fonts and images are in.
  if (libsOk) {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  }
}

try {
  boot();
} catch (err) {
  // Whatever went wrong, the content must stay usable.
  console.error(err);
  root.classList.remove('is-loading');
  root.classList.add('is-static');
  const pl = $('#preloader');
  if (pl) pl.remove();
  markReady();
}
