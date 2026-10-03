// ---------------------------------------------------------------------------
// Mac Brew Farm: Interactive Cocktail & Craft Pours Deck
// Free-scrolling, zero scroll-trapping, 3D card tilt & category filters.
// ---------------------------------------------------------------------------
import { cocktails } from './data.js';
import { set } from './store.js';

const $ = (id) => document.getElementById(id);
const rupee = (n) => '₹' + n;

export function initCocktails({ isStatic }) {
  const host = $('cocktailsApp');
  if (!host) return;

  let activeIndex = 0;
  let activeCategory = 'all';

  // Categories
  const categories = [
    { id: 'all', label: 'All Pours' },
    { id: 'signature', label: 'Signature Craft' },
    { id: 'botanical', label: 'Botanical & Floral' },
    { id: 'tropical', label: 'Tropical Fusion' },
    { id: 'brews', label: 'Craft Beers' },
    { id: 'indulgence', label: 'Indulgent' },
  ];

  // Helper to filter
  const getVisibleCocktails = () => {
    if (activeCategory === 'all') return cocktails;
    return cocktails.filter((c) => c.category === activeCategory);
  };

  // Build DOM layout
  host.innerHTML = `
    <div class="ck-deck-wrapper">
      <div class="ck-deck-header">
        <div class="ck-deck-title-group">
          <span class="ck-badge-pill">Craft Mixology & On Tap</span>
          <h2 class="display ck-deck-title">Signature Cocktails & Fresh Pours</h2>
          <p class="lede ck-deck-lede">Handcrafted botanical infusions, smoked reductions, and crisp golden beers straight from the farm taps.</p>
        </div>
        <div class="ck-filter-tabs" role="tablist" aria-label="Cocktail categories">
          ${categories.map((cat) => `
            <button class="ck-tab-btn ${cat.id === 'all' ? 'is-active' : ''}" type="button" data-cat="${cat.id}">
              ${cat.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="ck-stage-grid">
        <!-- Main Highlight Card (3D Tilt) -->
        <div class="ck-feature-card" id="ckFeatureCard">
          <div class="ck-card-glare" id="ckGlare"></div>
          <div class="ck-card-halo" id="ckHalo"></div>
          <div class="ck-image-box">
            <img class="ck-active-img" id="ckActiveImg" src="${cocktails[0].img || 'media/img/pomrita.webp'}" alt="${cocktails[0].name}" width="600" height="600" loading="eager">
            <div class="ck-swatch-badge" id="ckSwatchBadge">
              <span class="ck-swatch-dot" id="ckSwatchDot"></span>
              <span class="ck-swatch-label" id="ckSwatchLabel">${cocktails[0].categoryLabel}</span>
            </div>
          </div>
          <div class="ck-card-content">
            <div class="ck-meta-row">
              <span class="ck-flavor-cat" id="ckCatName">${cocktails[0].categoryLabel}</span>
              <span class="ck-price-pill" id="ckPrice">${rupee(cocktails[0].price)}</span>
            </div>
            <h3 class="display ck-active-name" id="ckName">${cocktails[0].name}</h3>
            <p class="ck-active-tagline" id="ckTagline">${cocktails[0].tagline}</p>
            <div class="ck-ingredients-box">
              <span class="ck-ing-label">Recipe & Notes:</span>
              <p class="ck-active-desc" id="ckDesc">${cocktails[0].desc}</p>
            </div>
            <div class="ck-chips-list" id="ckChips">
              ${(cocktails[0].notes || []).map((n) => `<span class="ck-chip-tag">${n}</span>`).join('')}
            </div>

            <!-- Palate Profile Meters -->
            <div class="ck-sensory-panel">
              <span class="ck-ing-label">Palate & Tasting Profile:</span>
              <div class="ck-meter-grid">
                <div class="ck-meter-item">
                  <div class="ck-meter-labels"><span>Proof / Body</span><span id="ckValStrength">70%</span></div>
                  <div class="ck-meter-track"><div class="ck-meter-fill" id="ckBarStrength" style="width: 70%"></div></div>
                </div>
                <div class="ck-meter-item">
                  <div class="ck-meter-labels"><span>Sweetness</span><span id="ckValSweet">50%</span></div>
                  <div class="ck-meter-track"><div class="ck-meter-fill" id="ckBarSweet" style="width: 50%"></div></div>
                </div>
                <div class="ck-meter-item">
                  <div class="ck-meter-labels"><span>Citrus & Crisp</span><span id="ckValCitrus">85%</span></div>
                  <div class="ck-meter-track"><div class="ck-meter-fill" id="ckBarCitrus" style="width: 85%"></div></div>
                </div>
                <div class="ck-meter-item">
                  <div class="ck-meter-labels"><span>Botanical Aroma</span><span id="ckValAroma">65%</span></div>
                  <div class="ck-meter-track"><div class="ck-meter-fill" id="ckBarAroma" style="width: 65%"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Thumbnails Reel & Selector -->
        <div class="ck-rail-column">
          <div class="ck-rail-header">
            <span class="ck-rail-counter" id="ckRailCounter">1 of ${cocktails.length} Cocktails</span>
            <div class="ck-nav-arrows">
              <button class="ck-arrow-btn" id="ckPrevBtn" aria-label="Previous cocktail">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button class="ck-arrow-btn" id="ckNextBtn" aria-label="Next cocktail">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
          <div class="ck-thumb-list" id="ckThumbList" data-lenis-prevent role="listbox" aria-label="Cocktail selections"></div>
        </div>
      </div>

      <div class="ck-legal-strip">
        <span class="ck-legal-text">🔞 <strong>Karnataka Excise Act Notice:</strong> Alcoholic beverages served strictly to patrons 21+ with valid government photo ID. Please drink responsibly. Don't drink and drive.</span>
        <button type="button" class="ck-legal-link tc-modal-trigger">View Excise T&C →</button>
      </div>
    </div>
  `;

  // DOM Elements
  const featureCard = $('ckFeatureCard');
  const activeImg = $('ckActiveImg');
  const halo = $('ckHalo');
  const glare = $('ckGlare');
  const catName = $('ckCatName');
  const priceEl = $('ckPrice');
  const nameEl = $('ckName');
  const taglineEl = $('ckTagline');
  const descEl = $('ckDesc');
  const chipsEl = $('ckChips');
  const swatchDot = $('ckSwatchDot');
  const swatchLabel = $('ckSwatchLabel');
  const thumbList = $('ckThumbList');
  const counterEl = $('ckRailCounter');
  const prevBtn = $('ckPrevBtn');
  const nextBtn = $('ckNextBtn');
  const tabBtns = host.querySelectorAll('.ck-tab-btn');

  // Render Thumbnails
  function renderThumbs() {
    const list = getVisibleCocktails();
    thumbList.innerHTML = list.map((c) => {
      const isSelected = cocktails[activeIndex].id === c.id;
      return `
        <button class="ck-thumb-card ${isSelected ? 'is-selected' : ''}" type="button" data-id="${c.id}" role="option" aria-selected="${isSelected}">
          <div class="ck-thumb-media">
            <img src="${c.img || 'media/img/pomrita.webp'}" alt="" width="90" height="90" loading="lazy">
            <span class="ck-thumb-color-dot" style="background:${c.color}"></span>
          </div>
          <div class="ck-thumb-info">
            <div class="ck-thumb-title-line">
              <span class="ck-thumb-name">${c.name}</span>
              <span class="ck-thumb-price">${rupee(c.price)}</span>
            </div>
            <span class="ck-thumb-cat">${c.categoryLabel}</span>
          </div>
        </button>
      `;
    }).join('');

    // Rebind thumb click
    thumbList.querySelectorAll('.ck-thumb-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const idx = cocktails.findIndex((item) => item.id === id);
        if (idx !== -1) selectCocktail(idx);
      });
    });

    // Auto-scroll selected thumbnail into view inside the list
    setTimeout(() => {
      const activeCard = thumbList.querySelector('.ck-thumb-card.is-selected');
      if (activeCard) {
        activeCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 50);
  }

  // Update Highlight Display
  function selectCocktail(index, animate = true) {
    activeIndex = (index + cocktails.length) % cocktails.length;
    const c = cocktails[activeIndex];

    // Notify global store for background ambiance tinting
    set({
      active: activeIndex,
      liquid: c.color,
      foam: c.foam || 0.4,
    });

    // Animate Card Elements with GSAP if available
    if (animate && window.gsap && !isStatic) {
      const tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to([nameEl, taglineEl, descEl, chipsEl], { autoAlpha: 0, y: -8, duration: 0.18, stagger: 0.03 })
        .to(activeImg, { scale: 0.94, opacity: 0.3, duration: 0.2 }, 0)
        .add(() => {
          updateText(c);
        })
        .to(activeImg, { scale: 1, opacity: 1, duration: 0.45 })
        .fromTo([nameEl, taglineEl, descEl, chipsEl], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 }, '<+0.1');
    } else {
      updateText(c);
    }

    renderThumbs();
    updateCounter();
  }

  function updateText(c) {
    activeImg.src = c.img || 'media/img/pomrita.webp';
    activeImg.alt = c.name;
    catName.textContent = c.categoryLabel;
    swatchLabel.textContent = c.categoryLabel;
    swatchDot.style.background = c.color;
    priceEl.textContent = rupee(c.price);
    nameEl.textContent = c.name;
    taglineEl.textContent = c.tagline;
    descEl.textContent = c.desc;
    chipsEl.innerHTML = (c.notes || []).map((n) => `<span class="ck-chip-tag">${n}</span>`).join('');
    halo.style.background = `radial-gradient(circle at 50% 50%, ${c.color}66 0%, transparent 70%)`;
    featureCard.style.setProperty('--card-accent', c.color);

    // Palate Profile Meters Animation
    const prof = c.profile || { strength: 65, sweetness: 50, citrus: 60, aroma: 70 };
    const valStrength = $('ckValStrength');
    const valSweet = $('ckValSweet');
    const valCitrus = $('ckValCitrus');
    const valAroma = $('ckValAroma');
    if (valStrength) valStrength.textContent = prof.strength + '%';
    if (valSweet) valSweet.textContent = prof.sweetness + '%';
    if (valCitrus) valCitrus.textContent = prof.citrus + '%';
    if (valAroma) valAroma.textContent = prof.aroma + '%';

    if (window.gsap && !isStatic) {
      window.gsap.to('#ckBarStrength', { width: prof.strength + '%', duration: 0.65, ease: 'power2.out' });
      window.gsap.to('#ckBarSweet', { width: prof.sweetness + '%', duration: 0.65, ease: 'power2.out' });
      window.gsap.to('#ckBarCitrus', { width: prof.citrus + '%', duration: 0.65, ease: 'power2.out' });
      window.gsap.to('#ckBarAroma', { width: prof.aroma + '%', duration: 0.65, ease: 'power2.out' });
    } else {
      const b1 = $('ckBarStrength'); if (b1) b1.style.width = prof.strength + '%';
      const b2 = $('ckBarSweet'); if (b2) b2.style.width = prof.sweetness + '%';
      const b3 = $('ckBarCitrus'); if (b3) b3.style.width = prof.citrus + '%';
      const b4 = $('ckBarAroma'); if (b4) b4.style.width = prof.aroma + '%';
    }
  }

  function updateCounter() {
    const visible = getVisibleCocktails();
    const currInVisible = visible.findIndex((item) => item.id === cocktails[activeIndex].id);
    if (currInVisible !== -1) {
      counterEl.textContent = `${currInVisible + 1} of ${visible.length} Cocktails`;
    } else {
      counterEl.textContent = `${activeIndex + 1} of ${cocktails.length} Cocktails`;
    }
  }

  // 3D Perspective Tilt on the Highlight Card
  if (featureCard && !isStatic) {
    featureCard.addEventListener('pointermove', (e) => {
      const rect = featureCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      featureCard.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale3d(1.01, 1.01, 1.01)`;
      glare.style.opacity = '0.35';
      glare.style.transform = `translate(${x * 60}px, ${y * 60}px)`;
    });

    featureCard.addEventListener('pointerleave', () => {
      featureCard.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
      glare.style.opacity = '0';
    });
  }

  // Prev / Next Navigation
  prevBtn.addEventListener('click', () => {
    const visible = getVisibleCocktails();
    const curr = visible.findIndex((item) => item.id === cocktails[activeIndex].id);
    const nextIdx = curr <= 0 ? visible.length - 1 : curr - 1;
    const globalIdx = cocktails.findIndex((item) => item.id === visible[nextIdx].id);
    selectCocktail(globalIdx);
  });

  nextBtn.addEventListener('click', () => {
    const visible = getVisibleCocktails();
    const curr = visible.findIndex((item) => item.id === cocktails[activeIndex].id);
    const nextIdx = (curr + 1) % visible.length;
    const globalIdx = cocktails.findIndex((item) => item.id === visible[nextIdx].id);
    selectCocktail(globalIdx);
  });

  // Category Tabs Filter
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeCategory = btn.getAttribute('data-cat');
      const visible = getVisibleCocktails();
      if (visible.length > 0) {
        // If current active is not in visible, switch to first visible
        const exists = visible.some((item) => item.id === cocktails[activeIndex].id);
        if (!exists) {
          const firstIdx = cocktails.findIndex((item) => item.id === visible[0].id);
          selectCocktail(firstIdx);
        } else {
          renderThumbs();
          updateCounter();
        }
      }
    });
  });

  // Initial render
  selectCocktail(0, false);
}
