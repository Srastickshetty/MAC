// ---------------------------------------------------------------------------
// Mac Brew Farm: Luxury Table Reservation Modal
// Interactive date, time slot, zone selection, party size, and WhatsApp concierge
// ---------------------------------------------------------------------------
import { site } from './data.js';

let modalEl = null;
let currentZone = 'Curved Water Pavilion & Pond';
let currentDate = 'Tonight';
let currentTime = '5:30 PM (Sunset Golden Hour)';
let currentPartySize = 2;

export function openReservationModal(options = {}) {
  if (!modalEl) initReservationModal();
  if (options.zone) {
    selectZone(options.zone);
  }
  if (options.date) {
    selectDate(options.date);
  }

  modalEl.classList.add('is-open');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  // Focus name field after entrance
  setTimeout(() => {
    const nameInput = modalEl.querySelector('#resName');
    if (nameInput) nameInput.focus();
  }, 200);
}

export function closeReservationModal() {
  if (!modalEl) return;
  modalEl.classList.remove('is-open');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function selectZone(zoneName) {
  currentZone = zoneName;
  if (!modalEl) return;
  const cards = modalEl.querySelectorAll('.res-zone-card');
  cards.forEach((card) => {
    const radio = card.querySelector('input[type="radio"]');
    if (radio && (radio.value.toLowerCase().includes(zoneName.toLowerCase()) || zoneName.toLowerCase().includes(radio.value.toLowerCase()))) {
      radio.checked = true;
      card.classList.add('is-selected');
    } else {
      card.classList.remove('is-selected');
    }
  });
}

function selectDate(dateVal) {
  currentDate = dateVal;
  if (!modalEl) return;
  const pills = modalEl.querySelectorAll('#resDatePills .res-pill-opt');
  pills.forEach((p) => {
    p.classList.toggle('is-active', p.getAttribute('data-val') === dateVal);
  });
}

function initReservationModal() {
  modalEl = document.createElement('div');
  modalEl.className = 'res-modal-overlay';
  modalEl.id = 'reservationModal';
  modalEl.setAttribute('aria-hidden', 'true');
  modalEl.setAttribute('role', 'dialog');
  modalEl.setAttribute('aria-modal', 'true');
  modalEl.setAttribute('aria-labelledby', 'resModalTitle');

  modalEl.innerHTML = `
    <div class="res-modal-backdrop" id="resBackdrop"></div>
    <div class="res-modal-container" data-lenis-prevent>
      <button class="res-close-btn" id="resCloseBtn" type="button" aria-label="Close reservation modal">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <div class="res-modal-header">
        <span class="res-badge-pill">Table Concierge</span>
        <h2 class="display res-modal-title" id="resModalTitle">Reserve Your Experience</h2>
        <p class="res-modal-subtitle">Curate your table, timing, and preferred atmosphere under our open canopies.</p>
      </div>

      <form class="res-form" id="resForm">
        <!-- 1. Select Date -->
        <div class="res-field-group">
          <label class="res-label">1. Select Date</label>
          <div class="res-pill-options" id="resDatePills">
            <button type="button" class="res-pill-opt is-active" data-val="Tonight">Tonight</button>
            <button type="button" class="res-pill-opt" data-val="Tomorrow">Tomorrow</button>
            <button type="button" class="res-pill-opt" data-val="This Friday">This Friday</button>
            <button type="button" class="res-pill-opt" data-val="This Saturday">This Saturday</button>
            <button type="button" class="res-pill-opt" data-val="This Sunday">This Sunday</button>
            <button type="button" class="res-pill-opt" data-val="custom">Pick Other Date</button>
          </div>
          <input type="date" class="res-input res-custom-date" id="resCustomDate" style="display:none;" />
        </div>

        <!-- 2. Preferred Time Slot -->
        <div class="res-field-group">
          <label class="res-label">2. Preferred Time Slot</label>
          <div class="res-pill-options" id="resTimePills">
            <button type="button" class="res-pill-opt" data-val="1:00 PM (Lunch & Brews)">1:00 PM (Lunch)</button>
            <button type="button" class="res-pill-opt" data-val="2:30 PM (Afternoon Pours)">2:30 PM</button>
            <button type="button" class="res-pill-opt is-active" data-val="5:30 PM (Sunset Golden Hour)">5:30 PM (Golden Hour)</button>
            <button type="button" class="res-pill-opt" data-val="7:30 PM (Twilight Dinner)">7:30 PM</button>
            <button type="button" class="res-pill-opt" data-val="8:30 PM (Dinner & Live Beats)">8:30 PM (Live Beats)</button>
            <button type="button" class="res-pill-opt" data-val="10:00 PM (Late Night Pours)">10:00 PM</button>
          </div>
        </div>

        <!-- 3. Atmosphere & Zone Preference -->
        <div class="res-field-group">
          <label class="res-label">3. Atmosphere & Zone Preference</label>
          <div class="res-zone-cards" id="resZoneCards">
            <label class="res-zone-card is-selected">
              <input type="radio" name="resZone" value="Curved Water Pavilion & Pond" checked />
              <div class="res-zone-thumb">
                <img src="media/img/space-building.webp" alt="Pavilion" width="120" height="80" loading="lazy">
              </div>
              <div class="res-zone-info">
                <strong>Water Pavilion & Pond</strong>
                <span>Scenic, romantic & stepped fountains</span>
              </div>
            </label>
            <label class="res-zone-card">
              <input type="radio" name="resZone" value="Emerald Island Bar" />
              <div class="res-zone-thumb">
                <img src="media/img/space-bar.webp" alt="Island Bar" width="120" height="80" loading="lazy">
              </div>
              <div class="res-zone-info">
                <strong>Emerald Island Bar</strong>
                <span>High-energy craft mixology & fresh taps</span>
              </div>
            </label>
            <label class="res-zone-card">
              <input type="radio" name="resZone" value="Upper Canopy Terrace" />
              <div class="res-zone-thumb">
                <img src="media/img/space-lamps.webp" alt="Terrace" width="120" height="80" loading="lazy">
              </div>
              <div class="res-zone-info">
                <strong>Upper Canopy Terrace</strong>
                <span>Intimate cane pendants & evening breeze</span>
              </div>
            </label>
            <label class="res-zone-card">
              <input type="radio" name="resZone" value="Open Garden Lawn Deck" />
              <div class="res-zone-thumb">
                <img src="media/img/outdoor-night.webp" alt="Lawn" width="120" height="80" loading="lazy">
              </div>
              <div class="res-zone-info">
                <strong>Garden Lawn Deck</strong>
                <span>Lush greenery, communal feasts & groups</span>
              </div>
            </label>
          </div>
        </div>

        <!-- 4. Party Size & Occasion -->
        <div class="res-row-2col">
          <div class="res-field-group">
            <label class="res-label">4. Party Size</label>
            <div class="res-counter-box">
              <button type="button" class="res-counter-btn" id="resGuestMinus" aria-label="Decrease party size">−</button>
              <span class="res-counter-num" id="resGuestNum">2 Guests</span>
              <button type="button" class="res-counter-btn" id="resGuestPlus" aria-label="Increase party size">+</button>
            </div>
          </div>
          <div class="res-field-group">
            <label class="res-label" for="resOccasion">Occasion / Vibe</label>
            <select class="res-select" id="resOccasion">
              <option value="Casual Drinks & Food">Casual Drinks & Dining</option>
              <option value="Birthday Celebration">Birthday Celebration</option>
              <option value="Anniversary / Date">Date / Romantic Evening</option>
              <option value="Corporate / Team Outing">Corporate / Team Gathering</option>
              <option value="Live Music Night">Live Music Night</option>
            </select>
          </div>
        </div>

        <!-- 5. Guest Details -->
        <div class="res-row-2col">
          <div class="res-field-group">
            <label class="res-label" for="resName">Your Name *</label>
            <input type="text" class="res-input" id="resName" placeholder="e.g. Rahul Sharma" required />
          </div>
          <div class="res-field-group">
            <label class="res-label" for="resPhone">WhatsApp / Mobile *</label>
            <input type="tel" class="res-input" id="resPhone" placeholder="e.g. +91 98450 12345" required />
          </div>
        </div>

        <!-- 6. Special Requests -->
        <div class="res-field-group">
          <label class="res-label" for="resNotes">Special Requests (Optional)</label>
          <input type="text" class="res-input" id="resNotes" placeholder="e.g. Poolside table, vegetarian preferences, pet-friendly zone" />
        </div>

        <!-- Reservation T&C & House Rules Notice -->
        <div class="res-terms-notice">
          <div class="res-terms-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span>Reservation Terms & House Rules (T&C)</span>
          </div>
          <ul class="res-terms-list">
            <li>Tables held for <strong>15 minutes</strong> past booking time before release to waiting walk-in patrons.</li>
            <li>Standard seating duration during peak weekend evenings: <strong>2 hours 30 mins</strong>.</li>
            <li>Strictly no outside food or beverages (excise law). Right of Admission Reserved (ROAR).</li>
            <li>By reserving, you agree to our <button type="button" class="res-tc-inline-link tc-modal-trigger">Complete Terms & Conditions</button>.</li>
          </ul>
        </div>

        <div class="res-actions">
          <button class="btn btn-solid res-submit-btn" id="resSubmitBtn" type="submit">
            <span>Confirm on WhatsApp Concierge</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
          <p class="res-footnote">Instant confirmation • No cancellation fee • Open daily 12 PM – 1 AM</p>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalEl);

  // Close handlers
  modalEl.querySelector('#resCloseBtn').addEventListener('click', closeReservationModal);
  modalEl.querySelector('#resBackdrop').addEventListener('click', closeReservationModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl.classList.contains('is-open')) {
      closeReservationModal();
    }
  });

  // Date selection
  const datePills = modalEl.querySelectorAll('#resDatePills .res-pill-opt');
  const customDateInput = modalEl.querySelector('#resCustomDate');
  datePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      datePills.forEach((p) => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      const val = pill.getAttribute('data-val');
      if (val === 'custom') {
        customDateInput.style.display = 'block';
        customDateInput.focus();
        currentDate = customDateInput.value || 'Custom Date';
      } else {
        customDateInput.style.display = 'none';
        currentDate = val;
      }
    });
  });

  customDateInput.addEventListener('change', () => {
    if (customDateInput.value) {
      currentDate = new Date(customDateInput.value).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }
  });

  // Time slot selection
  const timePills = modalEl.querySelectorAll('#resTimePills .res-pill-opt');
  timePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      timePills.forEach((p) => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      currentTime = pill.getAttribute('data-val');
    });
  });

  // Zone selection
  const zoneCards = modalEl.querySelectorAll('.res-zone-card');
  zoneCards.forEach((card) => {
    card.addEventListener('click', () => {
      zoneCards.forEach((c) => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      const input = card.querySelector('input');
      if (input) {
        input.checked = true;
        currentZone = input.value;
      }
    });
  });

  // Party size counter
  const guestNum = modalEl.querySelector('#resGuestNum');
  const minusBtn = modalEl.querySelector('#resGuestMinus');
  const plusBtn = modalEl.querySelector('#resGuestPlus');

  minusBtn.addEventListener('click', () => {
    if (currentPartySize > 1) {
      currentPartySize--;
      guestNum.textContent = `${currentPartySize} ${currentPartySize === 1 ? 'Guest' : 'Guests'}`;
    }
  });

  plusBtn.addEventListener('click', () => {
    if (currentPartySize < 24) {
      currentPartySize++;
      guestNum.textContent = `${currentPartySize} Guests`;
    }
  });

  // Form submission
  const form = modalEl.querySelector('#resForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = modalEl.querySelector('#resName').value.trim();
    const phone = modalEl.querySelector('#resPhone').value.trim();
    const occasion = modalEl.querySelector('#resOccasion').value;
    const notes = modalEl.querySelector('#resNotes').value.trim();

    if (!name || !phone) {
      alert('Please provide your name and contact number so we can confirm your table.');
      return;
    }

    // Format WhatsApp Message
    const msg = [
      `*TABLE RESERVATION INQUIRY*`,
      `----------------------------`,
      `*Venue:* Mac Brew Farm, Bengaluru`,
      `*Guest Name:* ${name}`,
      `*Contact:* ${phone}`,
      `*Date:* ${currentDate}`,
      `*Time Slot:* ${currentTime}`,
      `*Party Size:* ${currentPartySize} Guests`,
      `*Preferred Zone:* ${currentZone}`,
      `*Occasion:* ${occasion}`,
      notes ? `*Special Requests:* ${notes}` : null,
      `----------------------------`,
      `Please confirm table availability. Thank you!`,
    ].filter(Boolean).join('\n');

    const waNum = site.whatsapp || '919845012345';
    const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;

    // Open WhatsApp
    window.open(waUrl, '_blank', 'noopener');
    closeReservationModal();
  });
}

// Global initialization helper
export function initReservation() {
  initReservationModal();

  // Attach click listener to all reserve buttons on the page
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-reservation], .btn-reserve-trigger, #navReserveBtn, #drawerReserveBtn, #zoneBookBtn');
    if (trigger) {
      e.preventDefault();
      const zone = trigger.getAttribute('data-zone') || null;
      const date = trigger.getAttribute('data-date') || null;
      openReservationModal({ zone, date });
    }
  });
}
