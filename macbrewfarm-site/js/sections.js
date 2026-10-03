// Hero + every other scroll-driven section. Created in document order so pinned sections measure correctly.
import { set, intro, onReady } from './store.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// ---------------------------------------------------------------------------
// Videos: lazy-load, play only while visible
// ---------------------------------------------------------------------------
function initVideos(reduce) {
  const reels = $$('.reel video');
  const feast = $('#feastVideo');
  if (reduce) {
    // Reduced motion: no autoplay. Give people controls instead.
    [...reels, feast].filter(Boolean).forEach((v) => {
      if (v.dataset.src && !v.src) v.src = v.dataset.src;
      v.controls = true;
      v.removeAttribute('loop');
    });
    return;
  }
  if (!('IntersectionObserver' in window)) {
    [...reels, feast].filter(Boolean).forEach((v) => {
      if (v.dataset.src && !v.src) v.src = v.dataset.src;
      v.controls = true;
    });
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.getAttribute('src') && !v.querySelector('source') && v.dataset.src) {
          v.src = v.dataset.src;
          v.load();
        }
        const p = v.play();
        if (p && p.catch) p.catch(() => { v.controls = true; });
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.35 });
  reels.forEach((v) => io.observe(v));
  // The feast video is also started/stopped by its pinned trigger; this covers the static layout.
  if (feast && !window.ScrollTrigger) io.observe(feast);
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
function splitLetters(el) {
  const text = el.textContent;
  el.textContent = '';
  return Array.from(text).map((ch) => {
    const mask = document.createElement('span');
    mask.className = 'hero-mask';
    const c = document.createElement('span');
    c.className = 'ch';
    c.textContent = ch === ' ' ? ' ' : ch;
    mask.append(c);
    el.append(mask);
    return c;
  });
}

function initHero() {
  const hero = $('#top');
  const mac = $('.hero-mac');
  const brew = $('.hero-brew');
  const chars = splitLetters(mac);
  const copy = $$('.hero-tag, .hero-sub');
  const btns = $$('.hero-cta .btn');

  // Hidden until the preloader opens.
  gsap.set(chars, { yPercent: 118 });
  gsap.set(brew, { autoAlpha: 0, letterSpacing: '0.95em' });
  gsap.set(copy, { autoAlpha: 0, y: 28 });
  gsap.set(btns, { autoAlpha: 0, y: 20 });

  onReady(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(chars, { yPercent: 0, duration: 1.15, stagger: 0.09 }, 0)
      .to(brew, { autoAlpha: 1, letterSpacing: '0.5em', duration: 1.7 }, 0.35)
      .to(intro, { v: 1, duration: 2.4, ease: 'power2.out' }, 0.1)
      .to(copy, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.9)
      .to(btns, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, 1.2)
      .add(() => $$('.hero-mask').forEach((m) => { m.style.overflow = 'visible'; }));
  });

  // 0 -> 1 while the hero scrolls away: drives the glass move, the bg colour and the hop scatter.
  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => set({ heroP: self.progress }),
    onRefresh: (self) => set({ heroP: self.progress }),
  });

  gsap.to('.hero-fg', {
    opacity: 0, y: -50, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: '55% top', scrub: true },
  });
  gsap.to('.hero-title', {
    yPercent: -12, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
}

// ---------------------------------------------------------------------------
// Everything below the cocktails
// ---------------------------------------------------------------------------
function initParallax() {
  const fig = $('.story-fig');
  if (fig) {
    gsap.fromTo($('img', fig), { yPercent: -5 }, {
      yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }
  const circle = $('.pours-circle');
  if (circle) {
    gsap.fromTo($('img', circle), { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: circle, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }
}

function initSpaces() {
  const strip = $('#spaces');
  const track = strip && $('.spaces-track', strip);
  if (!track) return;
  gsap.to(track, {
    x: () => -Math.max(0, track.scrollWidth - strip.clientWidth),
    ease: 'none',
    scrollTrigger: { trigger: strip, start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
  });
}

function initKitchen() {
  const section = $('#kitchen');
  const viewport = $('.kitchen-viewport');
  const track = $('.kitchen-track');
  if (!section || !track) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const dist = () => {
      const cs = getComputedStyle(viewport);
      const visible = viewport.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      return Math.max(0, track.scrollWidth - visible);
    };
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: section, start: 'top top', end: () => '+=' + dist(),
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });
    $$('.dish-card img', track).forEach((img, i) => {
      gsap.fromTo(img, { yPercent: i % 2 ? 4 : -4 }, { yPercent: i % 2 ? -4 : 4, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + dist(), scrub: true, invalidateOnRefresh: true } });
    });
  });
}

function initFeast(reduce) {
  const section = $('#feast');
  const stage = $('.feast-stage');
  const card = $('.feast-card');
  const video = $('#feastVideo');
  if (!section || !stage) return;
  const l1 = $('.feast-line-1');
  const l2 = $('.feast-line-2');

  gsap.set(card, { scale: 0.45 });
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: section, start: 'top top', end: '+=140%', pin: stage, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true },
  });
  tl.to(card, { scale: 1, duration: 1 }, 0)
    .fromTo(l1, { opacity: 0.2, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.45 }, 0)
    .fromTo(l2, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3 }, 0.7)
    .to({}, { duration: 0.15 });

  if (video && !reduce) {
    ScrollTrigger.create({
      trigger: section, start: 'top 70%', end: 'bottom 20%',
      onEnter: () => { const p = video.play(); if (p && p.catch) p.catch(() => { video.controls = true; }); },
      onEnterBack: () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); },
      onLeave: () => video.pause(),
      onLeaveBack: () => video.pause(),
    });
  }
}

function initTilt() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('[data-tilt]').forEach((poster) => {
    poster.addEventListener('pointermove', (e) => {
      const r = poster.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      poster.style.setProperty('--ry', (px * 14).toFixed(2) + 'deg');
      poster.style.setProperty('--rx', (-py * 14).toFixed(2) + 'deg');
    });
    poster.addEventListener('pointerleave', () => {
      poster.style.setProperty('--rx', '0deg');
      poster.style.setProperty('--ry', '0deg');
    });
  });
}

function initReveals() {
  const sel = [
    '.story-title', '.story .lede', '.checks li', '.story-fig',
    '.pours-circle', '.pours .display', '.pours .lede', '.pours-minis',
    '.kitchen-head > *',
    '.menu-head > div > *', '.menu-fig',
    '.nights .display', '.nights .lede', '.night',
    '.reels .display', '.reel',
    '.visit-fig', '.visit-copy > *',
  ].join(',');
  const els = $$(sel);
  gsap.set(els, { autoAlpha: 0, y: 40 });
  ScrollTrigger.batch(els, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.09, overwrite: true }),
  });
}

// ---------------------------------------------------------------------------
export function initSections({ isStatic, reduce }) {
  initVideos(reduce);
  initTilt();
  if (isStatic) return;

  // main.js calls initCocktails() (the first pin) before this, so pins are created in page order.
  initHero();
  initParallax();
  initSpaces();
  initKitchen();
  initFeast(reduce);
  initReveals();
}
