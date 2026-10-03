// ---------------------------------------------------------------------------
// Mac Brew Farm: Sensory Mixology Lab
// Interactive "What's Your Pour?" Drink Matcher & Flavor Shaker
// ---------------------------------------------------------------------------
import { cocktails } from './data.js';

export function initMixologyLab() {
  const host = document.getElementById('mixologyLabApp');
  if (!host) return;

  const bases = [
    { id: 'tequila', label: 'Agave Tequila', icon: '🌵' },
    { id: 'gin', label: 'Botanical Gin', icon: '🌿' },
    { id: 'beer', label: 'In-House Craft Beer', icon: '🍺' },
    { id: 'rum', label: 'Spiced Cane Rum', icon: '🥥' },
    { id: 'vodka', label: 'Craft Vodka', icon: '✨' },
  ];

  const profiles = [
    { id: 'citrus', label: 'Tart & Citrus Crisp', icon: '🍋' },
    { id: 'floral', label: 'Aromatic Wild Rose', icon: '🌹' },
    { id: 'tropical', label: 'Alphonso & Pineapple', icon: '🥭' },
    { id: 'coffee', label: 'Espresso & Dark Cacao', icon: '☕' },
  ];

  const moods = [
    { id: 'sunset', label: 'Golden Sunset Chill', icon: '🌅' },
    { id: 'party', label: 'High Energy Beat', icon: '⚡' },
    { id: 'romantic', label: 'Candlelight Under Canopies', icon: '🌙' },
  ];

  let selectedBase = 'tequila';
  let selectedProfile = 'citrus';
  let selectedMood = 'sunset';

  host.innerHTML = `
    <div class="lab-container">
      <div class="lab-header">
        <span class="lab-pill">Interactive Mixology Bar</span>
        <h2 class="display lab-title">Craft Your Signature Pour</h2>
        <p class="lede lab-lede">Select your base, flavor note, and tonight's vibe. Our garden mixologists match your palate to the perfect signature concoction.</p>
      </div>

      <div class="lab-grid">
        <!-- Controls Step Column -->
        <div class="lab-selectors">
          <!-- Step 1: Base -->
          <div class="lab-step-group">
            <span class="lab-step-num">Step 01</span>
            <h4 class="lab-step-title">Choose Your Spirit or Brew</h4>
            <div class="lab-chip-group" id="labBaseGroup">
              ${bases.map((b) => `
                <button class="lab-chip-btn ${b.id === selectedBase ? 'is-active' : ''}" data-base="${b.id}" type="button">
                  <span>${b.icon}</span> <span>${b.label}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Step 2: Flavor -->
          <div class="lab-step-group">
            <span class="lab-step-num">Step 02</span>
            <h4 class="lab-step-title">Select Flavor Accent</h4>
            <div class="lab-chip-group" id="labProfileGroup">
              ${profiles.map((p) => `
                <button class="lab-chip-btn ${p.id === selectedProfile ? 'is-active' : ''}" data-profile="${p.id}" type="button">
                  <span>${p.icon}</span> <span>${p.label}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Step 3: Mood -->
          <div class="lab-step-group">
            <span class="lab-step-num">Step 03</span>
            <h4 class="lab-step-title">Tonight's Energy</h4>
            <div class="lab-chip-group" id="labMoodGroup">
              ${moods.map((m) => `
                <button class="lab-chip-btn ${m.id === selectedMood ? 'is-active' : ''}" data-mood="${m.id}" type="button">
                  <span>${m.icon}</span> <span>${m.label}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Result Card / Shaker Reveal -->
        <div class="lab-result-card" id="labResultCard">
          <div class="lab-match-badge" id="labMatchBadge">98% Match</div>
          <div class="lab-drink-visual">
            <div class="lab-drink-halo" id="labDrinkHalo"></div>
            <img class="lab-drink-img" id="labDrinkImg" src="media/img/pomrita.webp" alt="Cocktail match" width="300" height="300">
          </div>
          <div class="lab-drink-info">
            <span class="lab-drink-category" id="labDrinkCat">Recommended For You</span>
            <h3 class="display lab-drink-name" id="labDrinkName">Pom Rita</h3>
            <p class="lab-drink-tagline" id="labDrinkTagline">Bold, ruby crimson with an agave citrus kick</p>
            <div class="lab-drink-details">
              <span class="lab-drink-price" id="labDrinkPrice">₹595</span>
              <a class="btn btn-small btn-solid lab-order-btn" id="labOrderBtn" href="#" target="_blank" rel="noopener">
                Reserve With This Pour
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Logic to determine best match
  function computeMatch() {
    let match = cocktails[0]; // fallback Pom Rita

    if (selectedBase === 'beer' || selectedMood === 'party') {
      match = cocktails.find((c) => c.id === 'system-hack') || match;
    } else if (selectedBase === 'gin' || selectedProfile === 'floral') {
      match = cocktails.find((c) => c.id === 'herbal-rose') || match;
    } else if (selectedProfile === 'coffee' || selectedBase === 'vodka' && selectedProfile === 'coffee') {
      match = cocktails.find((c) => c.id === 'oreo-lady') || match;
    } else if (selectedProfile === 'tropical') {
      match = cocktails.find((c) => c.id === 'honey-mango-katli' || c.id === 'coconut-cloud') || match;
    } else if (selectedBase === 'rum') {
      match = cocktails.find((c) => c.id === 'coconut-cloud' || c.id === 'pineapple-punch') || match;
    } else {
      match = cocktails.find((c) => c.id === 'pom-rita') || match;
    }

    // Update Result UI
    const card = host.querySelector('#labResultCard');
    const img = host.querySelector('#labDrinkImg');
    const name = host.querySelector('#labDrinkName');
    const tagline = host.querySelector('#labDrinkTagline');
    const price = host.querySelector('#labDrinkPrice');
    const halo = host.querySelector('#labDrinkHalo');
    const orderBtn = host.querySelector('#labOrderBtn');
    const matchBadge = host.querySelector('#labMatchBadge');

    const randomMatchScore = 95 + Math.floor(Math.random() * 5);
    matchBadge.textContent = `${randomMatchScore}% Palate Match`;

    img.src = match.img || 'media/img/pomrita.webp';
    img.alt = match.name;
    name.textContent = match.name;
    tagline.textContent = match.tagline;
    price.textContent = '₹' + match.price;
    halo.style.background = `radial-gradient(circle at 50% 50%, ${match.color}88 0%, transparent 70%)`;
    card.style.borderColor = match.color;

    const waText = encodeURIComponent(`Hi Mac Brew Farm! I used your Mixology Lab and matched with the "${match.name}". I'd like to book a table to try it tonight!`);
    orderBtn.href = `https://wa.me/919845012345?text=${waText}`;

    // Micro-animation
    if (window.gsap) {
      window.gsap.fromTo(img, { scale: 0.9, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.5)' });
      window.gsap.fromTo([name, tagline], { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.08 });
    }
  }

  // Bind click listeners
  host.querySelectorAll('#labBaseGroup .lab-chip-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      host.querySelectorAll('#labBaseGroup .lab-chip-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      selectedBase = btn.getAttribute('data-base');
      computeMatch();
    });
  });

  host.querySelectorAll('#labProfileGroup .lab-chip-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      host.querySelectorAll('#labProfileGroup .lab-chip-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      selectedProfile = btn.getAttribute('data-profile');
      computeMatch();
    });
  });

  host.querySelectorAll('#labMoodGroup .lab-chip-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      host.querySelectorAll('#labMoodGroup .lab-chip-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      selectedMood = btn.getAttribute('data-mood');
      computeMatch();
    });
  });

  computeMatch();
}
