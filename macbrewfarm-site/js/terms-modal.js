// ---------------------------------------------------------------------------
// Mac Brew Farm: Comprehensive Terms & Conditions / House Rules Modal
// Robust customer disclaimers, excise compliance, billing, allergens & liabilities
// ---------------------------------------------------------------------------
let tcModalEl = null;

export function openTermsModal() {
  if (!tcModalEl) initTermsModal();
  tcModalEl.classList.add('is-open');
  tcModalEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  // Focus close button
  setTimeout(() => {
    const closeBtn = tcModalEl.querySelector('#tcCloseBtn');
    if (closeBtn) closeBtn.focus();
  }, 100);
}

export function closeTermsModal() {
  if (!tcModalEl) return;
  tcModalEl.classList.remove('is-open');
  tcModalEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function initTermsModal() {
  if (tcModalEl) return;
  tcModalEl = document.createElement('div');
  tcModalEl.className = 'tc-modal-overlay';
  tcModalEl.id = 'tcModal';
  tcModalEl.setAttribute('aria-hidden', 'true');
  tcModalEl.setAttribute('role', 'dialog');
  tcModalEl.setAttribute('aria-modal', 'true');
  tcModalEl.setAttribute('aria-labelledby', 'tcModalTitle');

  tcModalEl.innerHTML = `
    <div class="tc-modal-backdrop" id="tcBackdrop"></div>
    <div class="tc-modal-container" data-lenis-prevent>
      <button class="tc-close-btn" id="tcCloseBtn" type="button" aria-label="Close Terms & Conditions">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <div class="tc-modal-header">
        <span class="tc-pill-badge">Legal & House Policies</span>
        <h2 class="display tc-modal-title" id="tcModalTitle">Terms & Conditions & House Rules</h2>
        <p class="tc-modal-subtitle">Operating guidelines, excise compliance, diner safety, and liability terms for Mac Brew Farm, Bengaluru.</p>
        <span class="tc-date-tag">Last Updated: October 2026 • Governing Law: Bengaluru, Karnataka</span>
      </div>

      <div class="tc-modal-body">
        <!-- Section 1 -->
        <article class="tc-rule-block">
          <div class="tc-rule-header">
            <span class="tc-rule-num">01</span>
            <h3>Legal Drinking Age & Mandatory ID Proof (Karnataka Excise Act)</h3>
          </div>
          <div class="tc-rule-content">
            <p>In strict accordance with the <strong>Karnataka Excise Act, 1965</strong> and statutory excise guidelines, alcoholic beverages (including craft beers, draught beers, spirits, wines, and signature cocktails) are served exclusively to patrons who have attained <strong>21 years of age</strong> or older.</p>
            <ul>
              <li>Venue security and floor supervisors reserve the absolute right to request valid government-issued photographic age proof (Aadhaar Card, Passport, Indian Driving License, or Voter ID) prior to entry or service.</li>
              <li>Alcohol service will be denied immediately without exception to any individual unable to produce valid physical or digital government identification.</li>
              <li>We strictly uphold the principles of Responsible Beverage Service. Management reserves the unreserved right to refuse alcoholic beverage service to visibly intoxicated patrons to ensure community safety.</li>
              <li><strong>Do Not Drink & Drive:</strong> Valet assistance and ride-hailing support are readily available. We encourage designated drivers.</li>
            </ul>
          </div>
        </article>

        <!-- Section 2 -->
        <article class="tc-rule-block">
          <div class="tc-rule-header">
            <span class="tc-rule-num">02</span>
            <h3>Right of Admission Reserved (ROAR) & Patron Conduct</h3>
          </div>
          <div class="tc-rule-content">
            <p>Mac Brew Farm is an open-air culinary and craft brewery sanctuary. <strong>Right of Admission is strictly reserved by management at all times.</strong></p>
            <ul>
              <li>We maintain a strict zero-tolerance policy against physical, verbal, sexual, or discriminatory harassment of any guest or staff member.</li>
              <li>Disorderly, abusive, or rowdy behavior, trespassing into kitchen or staff service areas, or property vandalism will result in immediate removal from the premises by security personnel without refund or recourse, and referral to law enforcement.</li>
              <li>Possession, consumption, or trafficking of narcotics, illegal drugs, psychotropic substances, fireworks, or weapons of any kind is strictly prohibited and will be reported to the police authorities immediately.</li>
            </ul>
          </div>
        </article>

        <!-- Section 3 -->
        <article class="tc-rule-block">
          <div class="tc-rule-header">
            <span class="tc-rule-num">03</span>
            <h3>Billing, Government Taxes & Discretionary Service Charge</h3>
          </div>
          <div class="tc-rule-content">
            <p>All prices listed on our print and digital menus are in <strong>Indian Rupees (₹)</strong>.</p>
            <ul>
              <li><strong>Goods and Services Tax (GST):</strong> Applicable GST (5%) is levied on all food items and non-alcoholic beverages in accordance with central and state taxation laws.</li>
              <li><strong>State Excise VAT:</strong> State Excise duties and Value Added Tax (VAT) are charged separately on alcoholic beverages as mandated by the Government of Karnataka.</li>
              <li><strong>Discretionary Service Charge:</strong> A voluntary service charge of <strong>10%</strong> is added to the final bill. This charge is distributed among our floor, kitchen, and bar teams as recognition of hospitality excellence. <em>This charge is strictly voluntary and will be cheerfully removed upon guest request before the bill is settled.</em></li>
              <li><strong>Bill Verification:</strong> Guests are requested to review and verify their itemized bills prior to making payment. Any discrepancies or questions must be raised with the floor manager before vacating the table. Adjustments cannot be made after departure.</li>
            </ul>
          </div>
        </article>

        <!-- Section 4 -->
        <article class="tc-rule-block">
          <div class="tc-rule-header">
            <span class="tc-rule-num">04</span>
            <h3>Food Allergens, Cross-Contamination & Dietary Notice</h3>
          </div>
          <div class="tc-rule-content">
            <p>Our kitchen operates live woks, charcoal grills, wood-fired ovens, and preparation stations where common allergens are routinely present.</p>
            <ul>
              <li>Allergens handled on-site include <strong>tree nuts, peanuts, wheat/gluten, milk/dairy, eggs, shellfish, fish, sesame, and soy</strong>.</li>
              <li>While our kitchen adheres to rigorous hygiene and sanitation standards, airborne particles and mutual cooking equipment mean we <strong>cannot guarantee a 100% allergen-free environment</strong>.</li>
              <li>Guests with acute or life-threatening food allergies dine entirely at their own risk and are required to alert their server and table captain prior to ordering.</li>
            </ul>
          </div>
        </article>

        <!-- Section 5 -->
        <article class="tc-rule-block">
          <div class="tc-rule-header">
            <span class="tc-rule-num">05</span>
            <h3>Table Reservations, 15-Minute Grace Period & Seating Time</h3>
          </div>
          <div class="tc-rule-content">
            <ul>
              <li><strong>15-Minute Holding Period:</strong> Confirmed table reservations are held for exactly <strong>15 minutes</strong> past the scheduled booking time. If the party has not arrived or contacted our host within 15 minutes, the reservation is automatically canceled and the table reassigned to waiting walk-in patrons.</li>
              <li><strong>Peak Hours Seating Limit:</strong> During peak weekend dining periods (Friday evenings, Saturdays, Sundays, and public holidays), table occupancy is standardized to <strong>2 hours and 30 minutes</strong> to ensure fair access for all guests.</li>
              <li><strong>Zone Allocation:</strong> While we endeavor to honor zone preferences (Curved Water Pavilion, Island Bar, Canopy Terrace, Lawn), table placement is subject to real-time venue flow and operational circumstances.</li>
            </ul>
          </div>
        </article>

        <!-- Section 6 -->
        <article class="tc-rule-block">
          <div class="tc-rule-header">
            <span class="tc-rule-num">06</span>
            <h3>Valet Parking & Vehicle Liability Disclaimer</h3>
          </div>
          <div class="tc-rule-content">
            <p>Valet parking is extended as a complimentary hospitality convenience to our patrons.</p>
            <ul>
              <li>All vehicles are driven, handled, and parked <strong>strictly at the sole risk of the vehicle owner</strong>.</li>
              <li>Mac Brew Farm, its directors, employees, and third-party valet contractors disclaim all liability for any vehicular damage, scratches, dents, mechanical failures, tire punctures, fire, theft, or natural hazards.</li>
              <li><strong>Valuables Inside Vehicles:</strong> Guests must not leave cash, jewelry, laptops, electronic devices, or valuable personal belongings in their vehicles. Management accepts zero responsibility for any items left in parked cars.</li>
            </ul>
          </div>
        </article>

        <!-- Section 7 -->
        <article class="tc-rule-block">
          <div class="tc-rule-header">
            <span class="tc-rule-num">07</span>
            <h3>Personal Belongings & Lost Property</h3>
          </div>
          <div class="tc-rule-content">
            <ul>
              <li>Guests are solely responsible for safeguarding their personal items, bags, mobile phones, and coats throughout their visit.</li>
              <li>Mac Brew Farm is not liable for misplaced, forgotten, or stolen belongings in any dining or garden zone.</li>
              <li>Found articles will be logged in our security registry and retained for 30 calendar days. Claimants must produce valid proof of ownership and identification.</li>
            </ul>
          </div>
        </article>

        <!-- Section 8 -->
        <article class="tc-rule-block">
          <div class="tc-rule-header">
            <span class="tc-rule-num">08</span>
            <h3>Pet-Friendly Garden Policy & Owner Responsibilities</h3>
          </div>
          <div class="tc-rule-content">
            <ul>
              <li>Well-mannered, vaccinated pets are welcome in designated <strong>outdoor garden lawn sections only</strong>.</li>
              <li>Pets must remain on a secure leash and closely attended by an adult owner at all times.</li>
              <li>Pet owners are fully responsible for their animal's demeanor, sanitary waste cleanup, and any injury or property damage caused to other guests, staff, or venue fixtures.</li>
              <li>Excessively barking or aggressive pets must be removed from the venue immediately upon manager request.</li>
            </ul>
          </div>
        </article>

        <!-- Section 9 -->
        <article class="tc-rule-block">
          <div class="tc-rule-header">
            <span class="tc-rule-num">09</span>
            <h3>Prohibition of Outside Food & Beverages</h3>
          </div>
          <div class="tc-rule-content">
            <ul>
              <li>In strict compliance with Karnataka State Excise, Food Safety and Standards Authority of India (FSSAI), and local licensing regulations, <strong>no outside food, snacks, soft drinks, or alcoholic beverages</strong> may be brought onto the premises.</li>
              <li>The only exception is sealed, commercially packaged infant/baby food.</li>
              <li>Celebration cakes brought from outside are subject to a nominal plating/service fee and must have a valid commercial bakery receipt for hygiene compliance.</li>
            </ul>
          </div>
        </article>

        <!-- Section 10 -->
        <article class="tc-rule-block">
          <div class="tc-rule-header">
            <span class="tc-rule-num">10</span>
            <h3>Photography, Videography, Drones & Venue Security</h3>
          </div>
          <div class="tc-rule-content">
            <ul>
              <li>Casual mobile phone photography and video for personal social media use is enthusiastically welcomed. Please respect the privacy of other diners in your frame.</li>
              <li>Professional photo sessions, DSLR setups, tripod lighting, commercial filming, and drone flights are strictly prohibited without prior written consent from Mac Brew Farm brand management.</li>
              <li><strong>24/7 Security CCTV:</strong> The entire property is under continuous high-definition closed-circuit television (CCTV) surveillance for guest safety, crime prevention, and regulatory compliance. Footage is confidential and handled in accordance with privacy laws.</li>
            </ul>
          </div>
        </article>

        <!-- Section 11 -->
        <article class="tc-rule-block">
          <div class="tc-rule-header">
            <span class="tc-rule-num">11</span>
            <h3>Force Majeure & Open-Air Weather Relocation</h3>
          </div>
          <div class="tc-rule-content">
            <ul>
              <li>Mac Brew Farm is an expansive open-air garden brewery. In the event of unexpected rain, high winds, or natural elements, our staff will make every reasonable effort to seat guests in covered pavilion sections based on immediate availability.</li>
              <li>Weather-related disruptions do not constitute grounds for bill cancellations, chargebacks, or compensation for orders already placed or prepared by the kitchen and bar.</li>
            </ul>
          </div>
        </article>

        <!-- Section 12 -->
        <article class="tc-rule-block">
          <div class="tc-rule-header">
            <span class="tc-rule-num">12</span>
            <h3>Jurisdiction & Dispute Resolution</h3>
          </div>
          <div class="tc-rule-content">
            <p>These terms and any legal claims, disputes, or issues arising out of your visit to Mac Brew Farm shall be governed by and construed in accordance with the substantive laws of the <strong>Republic of India</strong>. The courts located in <strong>Bengaluru, Karnataka</strong> shall have sole and exclusive jurisdiction over any proceeding.</p>
          </div>
        </article>
      </div>

      <div class="tc-modal-footer">
        <button class="btn btn-solid" id="tcUnderstoodBtn" type="button">I Have Read & Understand House Rules</button>
        <p class="tc-footer-note">For legal or management inquiries: <a href="mailto:hello@macbrewfarm.com">hello@macbrewfarm.com</a> • WhatsApp: +91 98450 12345</p>
      </div>
    </div>
  `;

  document.body.appendChild(tcModalEl);

  // Close handlers
  tcModalEl.querySelector('#tcCloseBtn').addEventListener('click', closeTermsModal);
  tcModalEl.querySelector('#tcBackdrop').addEventListener('click', closeTermsModal);
  tcModalEl.querySelector('#tcUnderstoodBtn').addEventListener('click', closeTermsModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && tcModalEl.classList.contains('is-open')) {
      closeTermsModal();
    }
  });
}

// Global initialization
export function initTermsModalHandler() {
  initTermsModal();

  // Any button or link with .tc-modal-trigger opens this comprehensive modal
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.tc-modal-trigger, #openTcModalBtn, #footerTcBtn, #openMenuTcBtn, #openCocktailTcBtn, #openResTcBtn');
    if (trigger) {
      e.preventDefault();
      openTermsModal();
    }
  });
}
