// ---------------------------------------------------------------------------
// Mac Brew Farm: Venue Zones & Vibe Explorer
// Find your preferred atmosphere: high-energy bar vs romantic water cascade.
// ---------------------------------------------------------------------------

export function initVenueZones() {
  const host = document.getElementById('venueZonesApp');
  if (!host) return;

  const zones = [
    {
      id: 'island-bar',
      name: 'The Emerald Island Bar',
      subtitle: 'Electric Beats & Front-Row Mixology',
      tag: 'High Energy',
      desc: 'Leaf-sculpted pillars, illuminated amber shelves, and our master bartenders shaking fresh craft infusions. Perfect for date nights, high spirits, and catching the DJ set.',
      vibe: { energy: '95%', intimacy: '60%', music: 'Upbeat DJ Sets' },
      img: 'media/img/space-bar.webp',
      seating: 'High-top Bar Stools & Cocktail Tables',
    },
    {
      id: 'fountain-steppes',
      name: 'The Fountain Steppes & Pond',
      subtitle: 'Gentle Water Cascade & Starry Canopies',
      tag: 'Romantic & Serene',
      desc: 'Dine beside the stepped stone waterfall and tranquil reflecting pond. The soothing murmur of running water creates an intimate sanctuary away from city life.',
      vibe: { energy: '50%', intimacy: '95%', music: 'Acoustic & Garden Breeze' },
      img: 'media/img/space-fountain.webp',
      seating: 'Pond-side Dining & Low Wood Tables',
    },
    {
      id: 'lantern-canopy',
      name: 'The Woven Lantern Canopy',
      subtitle: 'Golden Honeycomb Glow & Communal Feasts',
      tag: 'Communal & Warm',
      desc: 'Handcrafted cane lanterns casting golden honeycombs on large solid wood feast tables. Ideal for family feasts, birthdays, and celebrating with large friend circles.',
      vibe: { energy: '80%', intimacy: '75%', music: 'Chill Lounge Grooves' },
      img: 'media/img/space-lamps.webp',
      seating: 'Banquettes & 8-12 Person Feast Tables',
    },
    {
      id: 'curved-pavilion',
      name: 'The Curved Pavilion Lounge',
      subtitle: 'Under Open-Air Garden Canopies',
      tag: 'Breezy & Relaxed',
      desc: 'Sweeping architectural curves framing the tropical Bengaluru garden foliage. Enjoy fresh craft beers and Burmese khausuey under the evening breeze.',
      vibe: { energy: '70%', intimacy: '80%', music: 'Indie & Ambient Soul' },
      img: 'media/img/space-building.webp',
      seating: 'Garden Cabanas & Plush Sofas',
    },
  ];

  let activeIdx = 0;

  host.innerHTML = `
    <div class="zones-container">
      <div class="zones-header">
        <span class="zones-pill">Vibe Check</span>
        <h2 class="display zones-title">Choose Your Atmosphere</h2>
        <p class="lede zones-lede">Whether you want high-voltage island bar energy or romantic whispers beside the stepped fountain, find your ideal table zone.</p>
        
        <div class="zones-tab-pills" role="tablist">
          ${zones.map((z, i) => `
            <button class="zones-pill-btn ${i === 0 ? 'is-active' : ''}" data-index="${i}" type="button" role="tab">
              ${z.name}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="zones-showcase-card" id="zoneShowcaseCard">
        <div class="zone-visual">
          <img class="zone-img" id="zoneImg" src="${zones[0].img}" alt="${zones[0].name}" width="800" height="600">
          <div class="zone-tag-badge" id="zoneTag">${zones[0].tag}</div>
        </div>

        <div class="zone-details">
          <span class="zone-sub" id="zoneSubtitle">${zones[0].subtitle}</span>
          <h3 class="display zone-name" id="zoneName">${zones[0].name}</h3>
          <p class="zone-desc" id="zoneDesc">${zones[0].desc}</p>

          <div class="zone-vibe-metrics">
            <div class="vibe-metric">
              <span class="vibe-lbl">Vibe Energy</span>
              <div class="vibe-bar"><div class="vibe-fill" id="vibeEnergy" style="width: ${zones[0].vibe.energy}"></div></div>
            </div>
            <div class="vibe-metric">
              <span class="vibe-lbl">Intimacy</span>
              <div class="vibe-bar"><div class="vibe-fill" id="vibeIntimacy" style="width: ${zones[0].vibe.intimacy}"></div></div>
            </div>
          </div>

          <div class="zone-footer-meta">
            <span class="zone-music-note">🎵 <b id="zoneMusic">${zones[0].vibe.music}</b></span>
            <span class="zone-seating-note">🪑 <b id="zoneSeating">${zones[0].seating}</b></span>
          </div>

          <a class="btn btn-solid zone-book-btn" id="zoneBookBtn" href="#" target="_blank" rel="noopener">
            Reserve This Table Zone
          </a>
        </div>
      </div>
    </div>
  `;

  const img = host.querySelector('#zoneImg');
  const tag = host.querySelector('#zoneTag');
  const sub = host.querySelector('#zoneSubtitle');
  const name = host.querySelector('#zoneName');
  const desc = host.querySelector('#zoneDesc');
  const energyFill = host.querySelector('#vibeEnergy');
  const intimacyFill = host.querySelector('#vibeIntimacy');
  const music = host.querySelector('#zoneMusic');
  const seating = host.querySelector('#zoneSeating');
  const bookBtn = host.querySelector('#zoneBookBtn');
  const tabBtns = host.querySelectorAll('.zones-pill-btn');

  function renderZone(i) {
    activeIdx = i;
    const z = zones[i];

    tabBtns.forEach((b, k) => b.classList.toggle('is-active', k === i));

    img.src = z.img;
    img.alt = z.name;
    tag.textContent = z.tag;
    sub.textContent = z.subtitle;
    name.textContent = z.name;
    desc.textContent = z.desc;
    energyFill.style.width = z.vibe.energy;
    intimacyFill.style.width = z.vibe.intimacy;
    music.textContent = z.vibe.music;
    seating.textContent = z.seating;

    const waText = encodeURIComponent(`Hi Mac Brew Farm! I would like to reserve a table at "${z.name}" (${z.tag}) for tonight.`);
    bookBtn.href = `https://wa.me/919845012345?text=${waText}`;

    if (window.gsap) {
      window.gsap.fromTo(img, { opacity: 0.3, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
      window.gsap.fromTo([name, desc], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 });
    }
  }

  tabBtns.forEach((b) => {
    b.addEventListener('click', () => {
      const idx = parseInt(b.getAttribute('data-index'), 10);
      renderZone(idx);
    });
  });

  renderZone(0);
}
