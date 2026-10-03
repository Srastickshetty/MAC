// Pinned "Signature cocktails" section: scrolling swaps the cocktail and drives the 3D glass.
import { cocktails } from './data.js';
import { set } from './store.js';
import { scroller } from './scroll.js';

const $ = (id) => document.getElementById(id);
const rupee = (n) => '₹' + n;
const parts = (desc) => desc.split(',').map((s) => s.trim()).filter(Boolean);

function renderStatic() {
  const host = $('ckStatic');
  if (!host) return;
  host.textContent = '';
  const h = document.createElement('h2');
  h.className = 'display';
  h.textContent = 'Signature cocktails';
  const grid = document.createElement('div');
  grid.className = 'ck-static-grid';
  cocktails.forEach((c) => {
    const art = document.createElement('article');
    const circ = document.createElement('div');
    circ.className = 'circ' + (c.img ? '' : ' sw');
    if (c.img) {
      const img = document.createElement('img');
      img.src = c.img;
      img.alt = c.name;
      img.loading = 'lazy';
      img.width = 400; img.height = 400;
      circ.append(img);
    } else {
      circ.style.setProperty('--liquid', c.color);
    }
    const name = document.createElement('h3');
    name.textContent = c.name;
    const desc = document.createElement('p');
    desc.textContent = c.desc;
    const price = document.createElement('p');
    price.className = 'pr';
    price.textContent = rupee(c.price);
    art.append(circ, name, desc, price);
    grid.append(art);
  });
  host.append(h, grid);
}

export function initCocktails({ isStatic }) {
  if (isStatic) {
    renderStatic();
    return;
  }

  const N = cocktails.length;
  const pin = $('ckPin');
  const card = $('ckCard');
  const img = $('ckImg');
  const swatchName = $('ckSwatchName');
  const nameEl = $('ckName');
  const chipsEl = $('ckChips');
  const priceEl = $('ckPrice');
  const countEl = $('ckCount');
  const dotsEl = $('ckDots');
  const bar = $('ckBar');
  if (!pin || !card) return;

  // Warm the cache for the real photos.
  cocktails.forEach((c) => { if (c.img) { const i = new Image(); i.src = c.img; } });

  // Dots
  const dots = cocktails.map((c, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Show ' + c.name);
    b.addEventListener('click', () => goTo(i));
    li.append(b);
    dotsEl.append(li);
    return b;
  });

  let cur = 0;
  let trigger = null;
  let tl = null;

  function render(i) {
    const c = cocktails[i];
    nameEl.textContent = c.name;
    priceEl.textContent = rupee(c.price);
    chipsEl.textContent = '';
    parts(c.desc).forEach((p) => {
      const li = document.createElement('li');
      li.textContent = p;
      chipsEl.append(li);
    });
    card.style.setProperty('--liquid', c.color);
    if (c.img) {
      card.classList.remove('is-swatch');
      img.src = c.img;
      img.alt = c.name;
    } else {
      card.classList.add('is-swatch');
      swatchName.textContent = c.name;
      img.removeAttribute('src');
      img.alt = '';
    }
    dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    countEl.textContent = `${i + 1} of ${N}`;
  }

  function show(i) {
    if (i === cur) return;
    const dir = i > cur ? 1 : -1;
    cur = i;
    const c = cocktails[i];
    set({ active: i, liquid: c.color, foam: c.foam, garnish: c.garnish });

    if (tl) tl.kill();
    const texts = [nameEl, chipsEl, priceEl];
    const hidden = 'circle(0% at 50% 50%)';
    const full = 'circle(80% at 50% 50%)';
    tl = gsap.timeline();
    tl.to(texts, { autoAlpha: 0, y: -14 * dir, duration: 0.2, ease: 'power1.in' }, 0)
      .to(card, { clipPath: hidden, duration: 0.26, ease: 'power2.in' }, 0)
      .add(() => render(i))
      .fromTo(texts, { autoAlpha: 0, y: 20 * dir }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.07 })
      .fromTo(card, { clipPath: hidden }, { clipPath: full, duration: 0.75, ease: 'power3.out', clearProps: 'clipPath' }, '<');
  }

  function goTo(i) {
    if (!trigger) return;
    const y = trigger.start + ((i + 0.5) / N) * (trigger.end - trigger.start);
    if (scroller.lenis) scroller.lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  // First cocktail, no animation.
  const first = cocktails[0];
  set({ active: 0, liquid: first.color, foam: first.foam, garnish: first.garnish });
  render(0);

  trigger = ScrollTrigger.create({
    trigger: pin,
    start: 'top top',
    end: () => '+=' + Math.round(window.innerHeight * 0.55 * N),
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate(self) {
      const p = self.progress;
      bar.style.transform = `scaleX(${p.toFixed(4)})`;
      set({ cockP: p });
      const idx = Math.min(N - 1, Math.floor(p * N));
      if (idx !== cur) show(idx);
    },
  });

  // The fixed 3D layer is only needed until the marquee covers the screen.
  ScrollTrigger.create({
    trigger: '.marquee',
    start: 'top top',
    onEnter: () => set({ visible: false }),
    onLeaveBack: () => set({ visible: true }),
  });
}
