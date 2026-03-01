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
    showSolution: false,
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

  function evidenceSentence(type, difficulty, actor, clueIndex) {
    if (difficulty === 'medium' && clueIndex === 0) {
      return `If ${actor.label} had approved this model handoff, the coordination log would force a different follow-up check, so this pairing is excluded.`;
    }

    if (difficulty === 'hard') {
      if (type === 'location-clash') {
        return 'The coordination trail links this area to a different issue stream, so this location cannot align with this clash in the as-built evidence.';
      }
      return `${actor.label} cross-checked model ownership against issue history, and the evidence removes this pairing from the viable set.`;
    }

    return `${actor.label} reviewed the BIM evidence chain and ruled out this pairing.`;
  }

  function buildEvidenceClues(p) {
    const clues = [];

    for (let actorIdx = 0; actorIdx < p.cfg.size; actorIdx += 1) {
      for (let locationIdx = 0; locationIdx < p.cfg.size; locationIdx += 1) {
        if (p.maps.actorToLocation[actorIdx] === locationIdx) continue;
        clues.push({
          type: 'actor-location',
          left: p.actors[actorIdx],
          right: p.locations[locationIdx],
          actor: p.actors[actorIdx],
        });
      }
    }

    for (let actorIdx = 0; actorIdx < p.cfg.size; actorIdx += 1) {
      for (let clashIdx = 0; clashIdx < p.cfg.size; clashIdx += 1) {
        if (p.maps.actorToClash[actorIdx] === clashIdx) continue;
        clues.push({
          type: 'actor-clash',
          left: p.actors[actorIdx],
          right: p.clashes[clashIdx],
          actor: p.actors[actorIdx],
        });
      }
    }

    if (p.cfg.size >= 5) {
      for (let locationIdx = 0; locationIdx < p.cfg.size; locationIdx += 1) {
        for (let clashIdx = 0; clashIdx < p.cfg.size; clashIdx += 1) {
          if (p.maps.locationToClash[locationIdx] === clashIdx) continue;
          clues.push({
            type: 'location-clash',
            left: p.locations[locationIdx],
            right: p.clashes[clashIdx],
            actor: p.actors[(locationIdx + clashIdx) % p.cfg.size],
          });
        }
      }
    }

    return clues;
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

    const clueHtml = buildEvidenceClues(p).map((clue, index) => {
      const text = evidenceSentence(clue.type, state.difficulty, clue.actor, index);
      return `
        <li class="evidence-clue">
          <p class="reasoning">${text}</p>
          <div class="elimination">${icon(clue.left)} <span>×</span> ${icon(clue.right)}</div>
        </li>
      `;
    });

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
      <div class="slot" data-slot="actor">${icon(p.actors[p.marker.actor])}</div>
      <span>@</span>
      <div class="slot" data-slot="location">${icon(p.locations[p.marker.location])}</div>
      <span>↔</span>
      <div class="slot" data-slot="clash">${icon(p.clashes[p.marker.clash], 'with-marker')}</div>
      <span class="marker">🦺</span>
    `;
  }

  function updateHeader() {
    const chip = document.getElementById('difficultyChip');
    const p = state.puzzle;
    if (!chip || !p) return;
    chip.textContent = `${p.cfg.label} · ${p.cfg.size}×${p.cfg.size}×${p.cfg.size} · Seed ${p.seed}`;
  }

  function applySolutionVisibility() {
    document.body.classList.toggle('show-solution', state.showSolution);
  }

  function selectedDifficulty() {
    const selected = document.querySelector('input[name="difficulty"]:checked');
    return selected && DIFFICULTY[selected.value] ? selected.value : 'easy';
  }

  function generate(difficultyKey) {
    const seedInput = document.getElementById('seedInput');
    const seed = Number(seedInput ? seedInput.value : 0) || 0;
    state.seed = seed;
    state.difficulty = DIFFICULTY[difficultyKey] ? difficultyKey : 'easy';
    state.puzzle = buildPuzzle(seed, state.difficulty);

    renderLegend();
    renderScenarioAndClues();
    renderGrids();
    renderVerdictBoard();
    updateHeader();

    if (state.showSolution) {
      revealSolution();
    }
  }

  function clearBoard() {
    document.querySelectorAll('.cell-btn').forEach((btn) => setCell(btn, 0));
  }

  function revealSolution() {
    document.querySelectorAll('.cell-btn').forEach((btn) => {
      const tag = btn.dataset.tag;
      const row = Number(btn.dataset.row);
      const col = Number(btn.dataset.col);
      setCell(btn, expectedCellState(tag, row, col));
    });
  }

  function bindEvents() {
    const generateBtn = document.getElementById('generateBtn');
    const clear = document.getElementById('clearBtn');
    const solutionToggle = document.getElementById('showSolutionToggle');
    const printBtn = document.getElementById('exportBtn');
    const difficultyOptions = document.querySelectorAll('input[name="difficulty"]');

    difficultyOptions.forEach((option) => {
      option.addEventListener('change', () => {
        state.difficulty = selectedDifficulty();
        generate(state.difficulty);
      });
    });

    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        generate(selectedDifficulty());
      });
    }

    if (clear) {
      clear.addEventListener('click', () => {
        clearBoard();
      });
    }

    if (solutionToggle) {
      solutionToggle.addEventListener('change', () => {
        state.showSolution = solutionToggle.checked;
        applySolutionVisibility();
        if (state.showSolution) {
          revealSolution();
        }
      });
    }

    if (printBtn) printBtn.addEventListener('click', () => window.print());
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    state.difficulty = selectedDifficulty();
    generate(state.difficulty);
    applySolutionVisibility();
  });
})();
