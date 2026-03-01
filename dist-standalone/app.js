(() => {
  const ICON_PATH = './assets/icons/';

  const CATEGORIES = {
    actors: [
      { id: 'architect', label: 'Architect', icon: `${ICON_PATH}architect.svg` },
      { id: 'engineer', label: 'Engineer', icon: `${ICON_PATH}engineer.svg` },
      { id: 'contractor', label: 'Contractor', icon: `${ICON_PATH}contractor.svg` },
      { id: 'surveyor', label: 'Surveyor', icon: `${ICON_PATH}survey.svg` },
      { id: 'inspector', label: 'Inspector', icon: `${ICON_PATH}permit.svg` },
    ],
    locations: [
      { id: 'site', label: 'Site', icon: `${ICON_PATH}site.svg` },
      { id: 'permit-office', label: 'Permit Office', icon: `${ICON_PATH}permit.svg` },
      { id: 'draft-room', label: 'Draft Room', icon: `${ICON_PATH}architect.svg` },
      { id: 'coordination-hub', label: 'Coordination Hub', icon: `${ICON_PATH}engineer.svg` },
      { id: 'field-gate', label: 'Field Gate', icon: `${ICON_PATH}contractor.svg` },
    ],
    clashes: [
      { id: 'survey-gap', label: 'Survey Gap', icon: `${ICON_PATH}survey.svg` },
      { id: 'design-drift', label: 'Design Drift', icon: `${ICON_PATH}architect.svg` },
      { id: 'system-overlap', label: 'System Overlap', icon: `${ICON_PATH}engineer.svg` },
      { id: 'sequence-jam', label: 'Sequence Jam', icon: `${ICON_PATH}contractor.svg` },
      { id: 'permit-block', label: 'Permit Block', icon: `${ICON_PATH}permit.svg` },
    ],
  };

  const DIFFICULTY = {
    easy: { size: 3, label: 'Easy' },
    medium: { size: 4, label: 'Medium' },
    hard: { size: 5, label: 'Hard' },
  };

  const state = {
    puzzle: null,
    difficulty: 'easy',
    seed: 2026,
  };

  function rngFactory(seed) {
    let s = (seed >>> 0) || 1;
    return () => {
      s = (1664525 * s + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function shuffle(list, rnd) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rnd() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function icon(item, extraClass = '') {
    return `<img class="icon ${extraClass}" src="${item.icon}" alt="" aria-hidden="true" />`;
  }

  function buildPuzzle(seed, difficultyKey) {
    const cfg = DIFFICULTY[difficultyKey];
    const rnd = rngFactory(seed);
    const size = cfg.size;

    const actors = shuffle(CATEGORIES.actors, rnd).slice(0, size);
    const locations = shuffle(CATEGORIES.locations, rnd).slice(0, size);
    const clashes = shuffle(CATEGORIES.clashes, rnd).slice(0, size);

    const actorToLocation = shuffle([...Array(size).keys()], rnd);
    const actorToClash = shuffle([...Array(size).keys()], rnd);
    const locationToClash = Array(size).fill(0);

    actorToLocation.forEach((locIdx, actorIdx) => {
      locationToClash[locIdx] = actorToClash[actorIdx];
    });

    const markerClashIndex = Math.floor(rnd() * size);
    const markerLocationIndex = locationToClash.findIndex((val) => val === markerClashIndex);
    const markerActorIndex = actorToLocation.findIndex((val) => val === markerLocationIndex);

    return {
      cfg,
      seed,
      actors,
      locations,
      clashes,
      maps: { actorToLocation, actorToClash, locationToClash },
      marker: { actor: markerActorIndex, location: markerLocationIndex, clash: markerClashIndex },
    };
  }

  function expectedCellState(tag, row, col) {
    const p = state.puzzle;
    if (!p) return 0;
    if (tag === 'actor-location') return p.maps.actorToLocation[row] === col ? 2 : 1;
    if (tag === 'actor-clash') return p.maps.actorToClash[row] === col ? 2 : 1;
    return p.maps.locationToClash[row] === col ? 2 : 1;
  }

  function renderLegend() {
    const legend = document.getElementById('legend');
    const p = state.puzzle;
    if (!legend || !p) return;

    const section = (title, items) => `
      <section>
        <h4>${title}</h4>
        <ul class="legend-list">
          ${items
            .map(
              (item) => `<li>${icon(item)} <span>${item.label}</span></li>`
            )
            .join('')}
        </ul>
      </section>
    `;

    legend.innerHTML =
      section('Actors', p.actors) + section('Locations', p.locations) + section('Clashes', p.clashes);
  }

  function markerClashIcon() {
    const p = state.puzzle;
    if (!p) return '';
    return icon(p.clashes[p.marker.clash], 'with-marker') + '<span class="marker">🦺</span>';
  }

  function renderScenarioAndClues() {
    const p = state.puzzle;
    if (!p) return;

    const scenarioText = document.getElementById('scenarioText');
    const clueTitle = document.getElementById('clueTitle');
    const cluesList = document.getElementById('cluesList');
    const markerRuleText = document.getElementById('markerRuleText');

    clueTitle.textContent = `${p.cfg.label} clues · ${p.cfg.size} items per category`;
    scenarioText.textContent = `A single true chain links one Actor, one Location, and one Clash. Use icon-only evidence to resolve the final verdict.`;

    const clueHtml = [];
    for (let i = 0; i < p.cfg.size; i += 1) {
      clueHtml.push(
        `<li>${icon(p.actors[i])} ↔ ${icon(p.locations[p.maps.actorToLocation[i]])}</li>`
      );
      clueHtml.push(
        `<li>${icon(p.actors[i])} ↔ ${icon(p.clashes[p.maps.actorToClash[i]])}</li>`
      );
    }

    clueHtml.push(`<li>${markerClashIcon()} = final reality marker</li>`);
    cluesList.innerHTML = clueHtml.join('');

    markerRuleText.textContent = '🦺 marker rule: exactly one clash carries 🦺; the verdict must include the actor and location paired to that clash.';
  }

  function setCell(btn, stateNum) {
    btn.dataset.state = String(stateNum);
    btn.textContent = stateNum === 1 ? '❌' : stateNum === 2 ? '●' : '';
  }

  function createGrid(leftItems, topItems, tag) {
    const table = document.createElement('table');
    table.className = 'logic-grid';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th'));
    topItems.forEach((item) => {
      const th = document.createElement('th');
      th.className = 'icon-header';
      th.innerHTML = icon(item);
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    leftItems.forEach((leftItem, row) => {
      const tr = document.createElement('tr');
      const rowHeader = document.createElement('th');
      rowHeader.className = 'icon-header';
      rowHeader.innerHTML = icon(leftItem);
      tr.appendChild(rowHeader);

      topItems.forEach((_, col) => {
        const td = document.createElement('td');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cell-btn';
        btn.dataset.tag = tag;
        btn.dataset.row = String(row);
        btn.dataset.col = String(col);
        btn.dataset.state = '0';
        btn.addEventListener('click', () => {
          const nextState = (Number(btn.dataset.state) + 1) % 3;
          setCell(btn, nextState);
        });
        td.appendChild(btn);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    return table;
  }

  function renderGrids() {
    const grids = document.getElementById('grids');
    const p = state.puzzle;
    if (!grids || !p) return;
    grids.innerHTML = '';
    grids.appendChild(createGrid(p.actors, p.locations, 'actor-location'));
    grids.appendChild(createGrid(p.actors, p.clashes, 'actor-clash'));
    grids.appendChild(createGrid(p.locations, p.clashes, 'location-clash'));
  }

  function renderVerdictBoard() {
    const container = document.getElementById('verdictBoard');
    const p = state.puzzle;
    if (!container || !p) return;

    container.innerHTML = `
      <div class="slot" data-slot="actor"></div>
      <span>@</span>
      <div class="slot" data-slot="location"></div>
      <span>↔</span>
      <div class="slot" data-slot="clash"></div>
      <span class="marker">🦺</span>
    `;
  }

  function updateHeader() {
    const chip = document.getElementById('difficultyChip');
    const p = state.puzzle;
    if (!chip || !p) return;
    chip.textContent = `${p.cfg.label} · ${p.cfg.size}×${p.cfg.size}×${p.cfg.size} · Seed ${p.seed}`;
  }

  function generate(difficultyKey) {
    const seedInput = document.getElementById('seedInput');
    const seed = Number(seedInput ? seedInput.value : 0) || 0;
    state.seed = seed;
    state.difficulty = difficultyKey;
    state.puzzle = buildPuzzle(seed, difficultyKey);

    renderLegend();
    renderScenarioAndClues();
    renderGrids();
    renderVerdictBoard();
    updateHeader();
  }

  function clearBoard() {
    document.querySelectorAll('.cell-btn').forEach((btn) => setCell(btn, 0));
    document.querySelectorAll('#verdictBoard .slot').forEach((slot) => {
      slot.innerHTML = '';
    });
  }

  function revealSolution() {
    document.querySelectorAll('.cell-btn').forEach((btn) => {
      const tag = btn.dataset.tag;
      const row = Number(btn.dataset.row);
      const col = Number(btn.dataset.col);
      setCell(btn, expectedCellState(tag, row, col));
    });

    const p = state.puzzle;
    if (!p) return;
    const actorSlot = document.querySelector('.slot[data-slot="actor"]');
    const locationSlot = document.querySelector('.slot[data-slot="location"]');
    const clashSlot = document.querySelector('.slot[data-slot="clash"]');

    if (actorSlot) actorSlot.innerHTML = icon(p.actors[p.marker.actor]);
    if (locationSlot) locationSlot.innerHTML = icon(p.locations[p.marker.location]);
    if (clashSlot) clashSlot.innerHTML = icon(p.clashes[p.marker.clash], 'with-marker');
  }

  function bindEvents() {
    const easy = document.getElementById('generateEasyBtn');
    const medium = document.getElementById('generateMediumBtn');
    const hard = document.getElementById('generateHardBtn');
    const clear = document.getElementById('clearBtn');
    const reveal = document.getElementById('revealBtn');
    const printBtn = document.getElementById('exportBtn');

    if (easy) easy.addEventListener('click', () => generate('easy'));
    if (medium) medium.addEventListener('click', () => generate('medium'));
    if (hard) hard.addEventListener('click', () => generate('hard'));
    if (clear) clear.addEventListener('click', clearBoard);
    if (reveal) reveal.addEventListener('click', revealSolution);
    if (printBtn) printBtn.addEventListener('click', () => window.print());
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    generate('easy');
  });
})();
