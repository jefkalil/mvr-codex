(function () {
  const ICONS = {
    architect: './assets/icons/architect.svg',
    engineer: './assets/icons/engineer.svg',
    contractor: './assets/icons/contractor.svg',
    survey: './assets/icons/survey.svg',
    site: './assets/icons/site.svg',
    permit: './assets/icons/permit.svg',
    monday: './assets/icons/monday.svg',
    wednesday: './assets/icons/wednesday.svg',
    friday: './assets/icons/friday.svg',
  };

  const groups = {
    role: [
      { key: 'architect', short: 'Architect', desc: 'Design intent coordinator.' },
      { key: 'engineer', short: 'Engineer', desc: 'System performance reviewer.' },
      { key: 'contractor', short: 'Contractor', desc: 'Execution and sequencing lead.' },
    ],
    artifact: [
      { key: 'survey', short: 'Survey', desc: 'Observed baseline capture set.' },
      { key: 'site', short: 'Site Plan', desc: 'Location and context package.' },
      { key: 'permit', short: 'Permit Set', desc: 'Approval-oriented documentation.' },
    ],
    day: [
      { key: 'monday', short: 'Monday', desc: 'First review checkpoint.' },
      { key: 'wednesday', short: 'Wednesday', desc: 'Mid-cycle validation point.' },
      { key: 'friday', short: 'Friday', desc: 'Final closeout milestone.' },
    ],
  };

  const storyPool = [
    'A shared model was aligned with field notes after one team flagged a mismatch.',
    'A schedule update moved one package later to absorb a coordination issue.',
    'One discipline completed review earlier because their source data was stable.',
    'A re-check was triggered when an assumption in the model diverged from reality.',
    'The final package passed after all parties agreed on one consistent baseline.',
    'A handoff was delayed until an icon-marked package was validated by another role.',
  ];

  const clueTemplates = [
    (r, a, d) => `${r[0].short} did not deliver on ${d[2].short}.`,
    (r, a, d) => `${a[1].short} was reviewed on ${d[1].short}.`,
    (r, a, d) => `${r[2].short} handled the ${a[2].short}.`,
    (r, a, d) => `${a[0].short} was completed before ${a[2].short}.`,
    (r, a, d) => `${r[1].short} worked after ${r[0].short}.`,
    (r, a, d) => `${d[0].short} was paired with neither ${a[2].short} nor ${r[1].short}.`,
  ];

  const seedInput = document.getElementById('seedInput');
  const legendEl = document.getElementById('legend');
  const storiesEl = document.getElementById('stories');
  const cluesEl = document.getElementById('clues');
  const gridsEl = document.getElementById('grids');

  function seededRng(seed) {
    let state = (seed >>> 0) || 1;
    return function next() {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function pickN(arr, n, rand) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
  }

  function renderLegend() {
    const items = [...groups.role, ...groups.artifact, ...groups.day];
    legendEl.innerHTML = items
      .map(
        (item) => `
        <article class="legend-item">
          <img src="${ICONS[item.key]}" alt="${item.short} icon" />
          <div>
            <h4>${item.short}</h4>
            <p>${item.desc}</p>
          </div>
        </article>
      `
      )
      .join('');
  }

  function makeGrid(left, top, tag) {
    const table = document.createElement('table');
    table.className = 'logic-grid';
    table.setAttribute('aria-label', `${tag} deduction grid`);

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    const empty = document.createElement('th');
    empty.textContent = '';
    hr.appendChild(empty);

    top.forEach((item) => {
      const th = document.createElement('th');
      th.className = 'icon-header';
      th.innerHTML = `<img src="${ICONS[item.key]}" alt="${item.short}" />`;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    left.forEach((lItem, rowIndex) => {
      const tr = document.createElement('tr');
      const rowLabel = document.createElement('th');
      rowLabel.className = 'icon-header';
      rowLabel.innerHTML = `<img src="${ICONS[lItem.key]}" alt="${lItem.short}" />`;
      tr.appendChild(rowLabel);

      top.forEach((tItem, colIndex) => {
        const td = document.createElement('td');
        const btn = document.createElement('button');
        btn.className = 'cell-btn';
        btn.type = 'button';
        btn.dataset.state = '0';
        btn.dataset.pair = `${lItem.key}-${tItem.key}`;
        btn.dataset.position = `${tag}:${rowIndex}:${colIndex}`;
        btn.textContent = '';
        btn.addEventListener('click', () => {
          const nextState = (Number(btn.dataset.state) + 1) % 3;
          btn.dataset.state = String(nextState);
          btn.textContent = nextState === 1 ? '❌' : nextState === 2 ? '●' : '';
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
    gridsEl.innerHTML = '';
    gridsEl.appendChild(makeGrid(groups.role, groups.artifact, 'role-artifact'));
    gridsEl.appendChild(makeGrid(groups.role, groups.day, 'role-day'));
    gridsEl.appendChild(makeGrid(groups.artifact, groups.day, 'artifact-day'));
  }

  function generateEasy(seed) {
    const rand = seededRng(seed);
    const stories = pickN(storyPool, 4, rand);
    storiesEl.innerHTML = stories.map((s) => `<li>${s}</li>`).join('');

    const clues = pickN(clueTemplates, 4, rand).map((fn) => fn(groups.role, groups.artifact, groups.day));
    cluesEl.innerHTML = clues.map((c) => `<li>${c}</li>`).join('');

    renderGrids();
    document.getElementById('difficultyMarker').textContent = `Difficulty: Easy · Seed ${seed}`;
  }

  document.getElementById('generateBtn').addEventListener('click', () => {
    const seed = Number(seedInput.value || 0);
    generateEasy(seed);
  });

  document.getElementById('clearBtn').addEventListener('click', () => {
    document.querySelectorAll('.cell-btn').forEach((btn) => {
      btn.dataset.state = '0';
      btn.textContent = '';
    });
  });

  document.getElementById('exportBtn').addEventListener('click', () => window.print());

  renderLegend();
  generateEasy(Number(seedInput.value || 2026));
})();
