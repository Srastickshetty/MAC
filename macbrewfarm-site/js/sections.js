// ---------------------------------------------------------------------------
// Mac Brew Farm: Sections, Interactive Spaces, Kitchen, Parallax & Motion
// Built for 60fps GPU-accelerated motion (transforms & opacity only).
// ---------------------------------------------------------------------------
import { spaces, kitchenDishes } from './data.js';
import { onReady } from './store.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// Split text into animated letter spans
function splitLetters(el) {
  const text = el.textContent;
  el.textContent = '';
  return Array.from(text).map((ch) => {
    const mask = document.createElement('span');
    mask.className = 'hero-mask';
    const c = document.createElement('span');
    c.className = 'ch';
    c.textContent = ch === ' ' ? '\u00A0' : ch;
    mask.append(c);
    el.append(mask);
    return c;
  });
}

// ---------------------------------------------------------------------------
// Hero Section Motion
// ---------------------------------------------------------------------------
function initHero({ isStatic, reduce }) {
  const hero = $('#top');
  const mac = $('.hero-mac');
  const brew = $('.hero-brew');
  const chars = mac ? splitLetters(mac) : [];
  const copy = $$('.hero-tag, .hero-sub, .hero-live-badge');
  const btns = $$('.hero-cta .btn');
  const heroVideo = $('#heroVideo');

  if (isStatic || reduce || !window.gsap) {
    if (heroVideo) heroVideo.play().catch(() => {});
    return;
  }

  // Pre-set initial states
  gsap.set(chars, { yPercent: 110, rotateZ: 3 });
  gsap.set(brew, { autoAlpha: 0, letterSpacing: '0.8em' });
  gsap.set(copy, { autoAlpha: 0, y: 30 });
  gsap.set(btns, { autoAlpha: 0, y: 25 });

  onReady(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(chars, { yPercent: 0, rotateZ: 0, duration: 1.2, stagger: 0.08 }, 0)
      .to(brew, { autoAlpha: 1, letterSpacing: '0.45em', duration: 1.5 }, 0.4)
      .to(copy, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.8)
      .to(btns, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1 }, 1.1)
      .add(() => {
        $$('.hero-mask').forEach((m) => { m.style.overflow = 'visible'; });
        if (heroVideo) heroVideo.play().catch(() => {});
      });
  });

  // Gentle subtle parallax on hero text as user scrolls down naturally (no pin!)
  if (window.ScrollTrigger) {
    gsap.to('.hero-fg', {
      opacity: 0.2,
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Spaces Showcase: Horizontal Drag & Lightbox
// ---------------------------------------------------------------------------
function initSpaces() {
  const container = $('#spacesApp');
  if (!container) return;

  container.innerHTML = `
    <div class="spaces-wrapper">
      <div class="spaces-head wrap">
        <div>
          <span class="spaces-pill">Bengaluru Sanctuary</span>
          <h2 class="display spaces-title">A Little Green. A Little Golden Hour.</h2>
          <p class="lede spaces-lede">Woven canopies, curved pavilions, stepped fountains, and an illuminated island bar beneath the open Bengaluru sky.</p>
        </div>
        <div class="spaces-controls-row">
          <div class="spaces-nav-buttons">
            <button class="spaces-arrow-btn" id="spacesPrevBtn" type="button" aria-label="Previous spaces">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button class="spaces-arrow-btn" id="spacesNextBtn" type="button" aria-label="Next spaces">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div class="spaces-drag-hint">
            <span>Drag or scroll</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>
      </div>

      <div class="spaces-track-viewport" id="spacesViewport">
        <div class="spaces-cards-track" id="spacesTrack">
          ${spaces.map((sp, idx) => `
            <div class="space-card" data-index="${idx}" tabindex="0" role="button" aria-label="View ${sp.name}">
              <div class="space-card-inner">
                <img class="space-card-img" src="${sp.img}" alt="${sp.name}" width="420" height="600" loading="lazy">
                <div class="space-card-overlay">
                  <span class="space-card-tag">${sp.tag}</span>
                  <h3 class="space-card-name">${sp.name}</h3>
                  <p class="space-card-desc">${sp.desc}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Spaces Lightbox Modal -->
      <div class="spaces-modal" id="spacesModal" aria-hidden="true" role="dialog">
        <div class="spaces-modal-backdrop" id="spacesModalBackdrop"></div>
        <div class="spaces-modal-dialog">
          <button class="spaces-modal-close" id="spacesModalClose" type="button" aria-label="Close dialog">&times;</button>
          <div class="spaces-modal-media">
            <img id="spacesModalImg" src="" alt="">
          </div>
          <div class="spaces-modal-info">
            <span class="spaces-modal-tag" id="spacesModalTag"></span>
            <h3 class="display spaces-modal-title" id="spacesModalTitle"></h3>
            <p class="spaces-modal-desc" id="spacesModalDesc"></p>
            <a class="btn btn-small btn-solid" href="https://maps.app.goo.gl/RtQ9ZF1NsLNxJRQh9?g_st=ic" target="_blank" rel="noopener">Visit Mac Brew Farm</a>
          </div>
        </div>
      </div>
    </div>
  `;

  // Horizontal Drag Interaction & Arrows
  const track = container.querySelector('#spacesTrack');
  const viewport = container.querySelector('#spacesViewport');
  const prevBtn = container.querySelector('#spacesPrevBtn');
  const nextBtn = container.querySelector('#spacesNextBtn');
  const modal = container.querySelector('#spacesModal');
  const modalImg = container.querySelector('#spacesModalImg');
  const modalTag = container.querySelector('#spacesModalTag');
  const modalTitle = container.querySelector('#spacesModalTitle');
  const modalDesc = container.querySelector('#spacesModalDesc');
  const modalClose = container.querySelector('#spacesModalClose');
  const modalBackdrop = container.querySelector('#spacesModalBackdrop');

  if (!track || !viewport) return;

  let isDown = false;
  let startX;
  let scrollLeft;
  let moved = false;

  viewport.addEventListener('mousedown', (e) => {
    isDown = true;
    moved = false;
    viewport.classList.add('is-dragging');
    startX = e.pageX - viewport.offsetLeft;
    scrollLeft = viewport.scrollLeft;
  });

  viewport.addEventListener('mouseleave', () => {
    isDown = false;
    viewport.classList.remove('is-dragging');
  });

  viewport.addEventListener('mouseup', () => {
    isDown = false;
    viewport.classList.remove('is-dragging');
  });

  viewport.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    moved = true;
    const x = e.pageX - viewport.offsetLeft;
    const walk = (x - startX) * 1.6;
    viewport.scrollLeft = scrollLeft - walk;
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      viewport.scrollBy({ left: -360, behavior: 'smooth' });
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      viewport.scrollBy({ left: 360, behavior: 'smooth' });
    });
  }

  // Card click opens Lightbox Modal
  container.querySelectorAll('.space-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (moved) return;
      const idx = parseInt(card.getAttribute('data-index'), 10);
      const sp = spaces[idx];
      modalImg.src = sp.img;
      modalImg.alt = sp.name;
      modalTag.textContent = sp.tag;
      modalTitle.textContent = sp.name;
      modalDesc.textContent = sp.desc;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
}

// ---------------------------------------------------------------------------
// Kitchen Highlights Showcase
// ---------------------------------------------------------------------------
function initKitchen() {
  const container = $('#kitchenApp');
  if (!container) return;

  container.innerHTML = `
    <div class="kitchen-showcase-wrap wrap">
      <div class="kitchen-head-group">
        <span class="kitchen-pill">Global Kitchen Craft</span>
        <h2 class="display kitchen-main-title">From the Wok, Grill & Farm Kitchen</h2>
        <p class="lede kitchen-main-lede">Burmese coconut curries, charred chicken skewers, garlic butter seafood, and legendary royal sundaes.</p>
      </div>

      <div class="kitchen-grid-cards">
        ${kitchenDishes.map((dish) => `
          <div class="kitchen-dish-card" data-tilt>
            <div class="dish-card-media">
              <img src="${dish.img}" alt="${dish.name}" width="480" height="480" loading="lazy">
              <span class="dish-badge-pill">${dish.badge}</span>
              <span class="dish-diet-icon ${dish.diet}"></span>
            </div>
            <div class="dish-card-body">
              <h3 class="dish-card-title">${dish.name}</h3>
              <p class="dish-card-desc">${dish.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// 3D Tilt for Interactive Event Posters & Cards
// ---------------------------------------------------------------------------
function initTilt() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', (px * 16).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-py * 16).toFixed(2) + 'deg');
      card.style.transform = `perspective(1000px) rotateY(${(px * 12).toFixed(2)}deg) rotateX(${(-py * 12).toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)';
    });
  });
}

// ---------------------------------------------------------------------------
// Organic Scroll Batch Reveals (Smooth 60fps, No Jitter)
// ---------------------------------------------------------------------------
function initReveals({ isStatic }) {
  if (isStatic || !window.gsap || !window.ScrollTrigger) return;

  const revealSelectors = [
    '.story-title', '.story .lede', '.checks li', '.story-fig',
    '.pours-circle', '.pours .display', '.pours .lede',
    '.kitchen-head-group > *', '.kitchen-dish-card',
    '.spaces-head > div > *', '.space-card',
    '.nights .display', '.nights .lede', '.night-poster-card',
    '.menu-head > div > *', '.menu-control-bar', '.menu-sheet-panel',
    '.visit-fig', '.visit-copy > *',
  ].join(',');

  const els = $$(revealSelectors);
  gsap.set(els, { autoAlpha: 0, y: 35 });

  ScrollTrigger.batch(els, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.08,
        overwrite: true,
      });
    },
  });
}

// ---------------------------------------------------------------------------
export function initSections({ isStatic, reduce }) {
  initHero({ isStatic, reduce });
  initSpaces();
  initKitchen();
  initTilt();
  initReveals({ isStatic });
}
