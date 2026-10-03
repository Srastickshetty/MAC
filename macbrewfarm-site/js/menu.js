// ---------------------------------------------------------------------------
// Mac Brew Farm: Filterable, Searchable Digital Menu
// Real prices, dietary badges, image previews, and responsive tabs
// ---------------------------------------------------------------------------
import { menu } from './data.js';

function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  kids.flat().forEach((kid) => { if (kid != null) el.append(kid); });
  return el;
}

export function initMenu({ animate }) {
  const host = document.getElementById('menuApp');
  if (!host) return;

  let currentTab = 0;
  let searchQuery = '';
  let dietaryFilter = 'all'; // 'all', 'veg', 'non-veg'

  host.innerHTML = `
    <div class="menu-control-bar">
      <div class="menu-search-box">
        <svg class="menu-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input class="menu-search-input" id="menuSearchInput" type="search" placeholder="Search cocktails, pasta, khausuey, cheesecake..." aria-label="Search menu items">
        <button class="menu-search-clear" id="menuSearchClear" type="button" aria-label="Clear search" hidden>&times;</button>
      </div>

      <div class="menu-diet-filter" role="radiogroup" aria-label="Dietary preferences">
        <button class="diet-btn is-active" data-diet="all" type="button">All Items</button>
        <button class="diet-btn" data-diet="veg" type="button"><span class="diet-dot veg"></span>Veg</button>
        <button class="diet-btn" data-diet="non-veg" type="button"><span class="diet-dot non-veg"></span>Non-Veg</button>
      </div>
    </div>

    <div class="menu-tabs-track" role="tablist" aria-label="Menu categories" id="menuTabs">
      ${menu.map((m, i) => `
        <button class="menu-tab-btn ${i === 0 ? 'is-active' : ''}" type="button" role="tab" id="tab-${m.id}" data-index="${i}">
          ${m.label}
        </button>
      `).join('')}
    </div>

    <div class="menu-sheet-panel" id="menuSheetPanel" role="tabpanel" tabindex="0">
      <div class="sheet-header">
        <div class="sheet-title-row">
          <h3 class="display sheet-section-title" id="sheetTitle">${menu[0].title}</h3>
          <span class="sheet-item-count" id="sheetCount"></span>
        </div>
      </div>
      <div class="sheet-content" id="sheetContent"></div>
    </div>
  `;

  const searchInput = host.querySelector('#menuSearchInput');
  const searchClear = host.querySelector('#menuSearchClear');
  const dietBtns = host.querySelectorAll('.diet-btn');
  const tabBtns = host.querySelectorAll('.menu-tab-btn');
  const sheetTitle = host.querySelector('#sheetTitle');
  const sheetCount = host.querySelector('#sheetCount');
  const sheetContent = host.querySelector('#sheetContent');
  const sheetPanel = host.querySelector('#menuSheetPanel');

  function matchesItem(it) {
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = !q || (it.name && it.name.toLowerCase().includes(q));
    const descMatch = !q || (it.desc && it.desc.toLowerCase().includes(q));
    const tagMatch = !q || (it.tag && it.tag.toLowerCase().includes(q));
    const textMatches = nameMatch || descMatch || tagMatch;

    if (!textMatches) return false;
    if (dietaryFilter === 'all') return true;
    if (dietaryFilter === 'veg' && it.diet === 'veg') return true;
    if (dietaryFilter === 'non-veg' && (it.diet === 'non-veg' || it.diet === 'veg-nonveg')) return true;
    return false;
  }

  function renderDishRow(it, columns) {
    const li = h('div', { class: 'menu-dish-item' + (it.img ? ' has-photo' : '') });

    // Dish Media if available
    if (it.img) {
      const thumb = h('div', { class: 'dish-item-photo' },
        h('img', { src: it.img, alt: it.name, width: '70', height: '70', loading: 'lazy' })
      );
      li.append(thumb);
    }

    const info = h('div', { class: 'dish-item-info' });
    const titleRow = h('div', { class: 'dish-item-head' });

    // Diet mark
    const dietMark = h('span', { class: 'dish-diet-mark ' + (it.diet === 'veg' ? 'veg' : 'non-veg'), title: it.diet || 'Special' });
    const nameSpan = h('span', { class: 'dish-item-name', text: it.name });

    titleRow.append(dietMark, nameSpan);

    // Price
    if (it.prices) {
      const priceGroup = h('div', { class: 'dish-prices-row' });
      it.prices.forEach((p, idx) => {
        const colLabel = columns ? columns[idx] : '';
        priceGroup.append(h('span', { class: 'dish-multi-price' },
          h('span', { class: 'p-val', text: '₹' + p }),
          h('span', { class: 'p-col', text: colLabel })
        ));
      });
      titleRow.append(h('span', { class: 'dish-leader' }), priceGroup);
    } else if (it.price != null) {
      titleRow.append(h('span', { class: 'dish-leader' }), h('span', { class: 'dish-single-price', text: '₹' + it.price }));
    }

    info.append(titleRow);

    if (it.desc) {
      info.append(h('p', { class: 'dish-item-desc', text: it.desc }));
    }

    li.append(info);
    return li;
  }

  function renderActiveMenu() {
    const currentMenuData = menu[currentTab];
    sheetTitle.textContent = searchQuery ? `Search Results for "${searchQuery}"` : currentMenuData.title;

    sheetContent.innerHTML = '';
    let totalFound = 0;

    // If searching across all or viewing single category
    const sectionsToSearch = searchQuery ? menu : [currentMenuData];

    sectionsToSearch.forEach((section) => {
      const matches = [];

      if (section.groups) {
        section.groups.forEach((g) => {
          const groupMatches = g.items.filter(matchesItem);
          if (groupMatches.length > 0) {
            matches.push({ label: g.label, items: groupMatches, columns: section.columns });
          }
        });
      } else if (section.items) {
        const directMatches = section.items.filter(matchesItem);
        if (directMatches.length > 0) {
          matches.push({ label: searchQuery ? section.label : '', items: directMatches, columns: section.columns });
        }
      }

      if (matches.length > 0) {
        matches.forEach((group) => {
          if (group.label) {
            const groupHead = h('h4', { class: 'dish-group-header', text: group.label });
            sheetContent.append(groupHead);
          }
          const groupList = h('div', { class: 'dish-group-list' });
          group.items.forEach((item) => {
            totalFound++;
            groupList.append(renderDishRow(item, group.columns));
          });
          sheetContent.append(groupList);
        });
      }
    });

    if (totalFound === 0) {
      sheetContent.innerHTML = `
        <div class="menu-empty-state">
          <p>No dishes or drinks match your filter.</p>
          <button class="btn btn-small" id="resetMenuFilterBtn" type="button">Reset Filters</button>
        </div>
      `;
      const resetBtn = sheetContent.querySelector('#resetMenuFilterBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          searchQuery = '';
          searchInput.value = '';
          searchClear.hidden = true;
          dietaryFilter = 'all';
          dietBtns.forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-diet') === 'all'));
          renderActiveMenu();
        });
      }
    }

    sheetCount.textContent = `${totalFound} item${totalFound === 1 ? '' : 's'}`;

    if (currentMenuData.theme) {
      sheetPanel.style.setProperty('--panel-band', currentMenuData.theme.band);
    }
  }

  // Event handlers
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    searchClear.hidden = !searchQuery;
    renderActiveMenu();
  });

  searchClear.addEventListener('click', () => {
    searchQuery = '';
    searchInput.value = '';
    searchClear.hidden = true;
    renderActiveMenu();
  });

  dietBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dietBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      dietaryFilter = btn.getAttribute('data-diet');
      renderActiveMenu();
    });
  });

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentTab = parseInt(btn.getAttribute('data-index'), 10);
      searchQuery = '';
      searchInput.value = '';
      searchClear.hidden = true;
      renderActiveMenu();
    });
  });

  renderActiveMenu();
}
