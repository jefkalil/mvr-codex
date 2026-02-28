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
  const difficultyInput = document.getElementById('difficultyInput');
  const legendEl = document.getElementById('legend');
  const storiesEl = document.getElementById('stories');
  const cluesEl = document.getElementById('clues');
  const clueHeadingEl = document.getElementById('clueHeading');
  const gridsEl = document.getElementById('grids');
  const statusEl = document.getElementById('gameStatus');

  let currentSolution = null;
  let gameEnded = false;

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

  function setStatus(message) {
    statusEl.textContent = message;
  }

  function setCellState(btn, state) {
    btn.dataset.state = String(state);
    btn.textContent = state === 1 ? '❌' : state === 2 ? '●' : '';
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
          if (gameEnded) {
            return;
          }
          const nextState = (Number(btn.dataset.state) + 1) % 3;
          setCellState(btn, nextState);
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

  function buildSolution(seed) {
    const rand = seededRng(seed + 911);
    const artifactOrder = pickN([0, 1, 2], 3, rand);
    const dayOrder = pickN([0, 1, 2], 3, rand);

    const roleToArtifact = artifactOrder;
    const roleToDay = dayOrder;
    const artifactToDay = [0, 0, 0];
    roleToArtifact.forEach((artifactIndex, roleIndex) => {
      artifactToDay[artifactIndex] = roleToDay[roleIndex];
    });

    return {
      roleArtifact: roleToArtifact,
      roleDay: roleToDay,
      artifactDay: artifactToDay,
    };
  }

  function getExpectedState(position) {
    if (!currentSolution) {
      return 0;
    }

    const [tag, rowText, colText] = position.split(':');
    const row = Number(rowText);
    const col = Number(colText);

    if (tag === 'role-artifact') {
      return currentSolution.roleArtifact[row] === col ? 2 : 1;
    }
    if (tag === 'role-day') {
      return currentSolution.roleDay[row] === col ? 2 : 1;
    }

    return currentSolution.artifactDay[row] === col ? 2 : 1;
  }

  function clearGrids() {
    if (gameEnded) {
      setStatus('Game has ended. Generate a new puzzle to play again.');
      return;
    }

    document.querySelectorAll('.cell-btn').forEach((btn) => {
      setCellState(btn, 0);
    });
    setStatus('Grids cleared.');
  }

  function solveAttempt() {
    if (gameEnded) {
      setStatus('Game has ended. Generate a new puzzle to play again.');
      return;
    }

    const cells = [...document.querySelectorAll('.cell-btn')];
    let mismatches = 0;

    cells.forEach((btn) => {
      const expected = getExpectedState(btn.dataset.position);
      if (Number(btn.dataset.state) !== expected) {
        mismatches += 1;
      }
    });

    if (mismatches === 0) {
      setStatus('Correct! Puzzle solved.');
      gameEnded = true;
      return;
    }

    setStatus(`Not solved yet — ${mismatches} cell${mismatches === 1 ? '' : 's'} still incorrect.`);
  }

  function revealSolution() {
    const cells = [...document.querySelectorAll('.cell-btn')];
    cells.forEach((btn) => {
      setCellState(btn, getExpectedState(btn.dataset.position));
    });

    gameEnded = true;
    setStatus('Solution revealed. Game ended. Generate a new puzzle to play again.');
  }

  function generateEasy(seed) {
    const rand = seededRng(seed);
    const settings = difficultyRules[difficulty] || difficultyRules.easy;

    const stories = pickN(storyPool, settings.storyCount, rand);
    storiesEl.innerHTML = stories.map((s) => `<li>${s}</li>`).join('');

    const clues = pickN(clueTemplates, settings.clueCount, rand).map((fn) => fn(groups.role, groups.artifact, groups.day));
    cluesEl.innerHTML = clues.map((c) => `<li>${c}</li>`).join('');

    clueHeadingEl.textContent = `${settings.label} clue set`;
    renderGrids();
    currentSolution = buildSolution(seed);
    gameEnded = false;
    setStatus('Puzzle generated. Fill the grids, then click Solve.');
    document.getElementById('difficultyMarker').textContent = `Difficulty: Easy · Seed ${seed}`;
  }

  function updateGenerateButtonLabel() {
    const settings = difficultyRules[difficultyInput.value] || difficultyRules.easy;
    document.getElementById('generateBtn').textContent = `Generate (${settings.label})`;
  }

  difficultyInput.addEventListener('change', updateGenerateButtonLabel);

  document.getElementById('generateBtn').addEventListener('click', () => {
    const seed = Number(seedInput.value || 0);
    generatePuzzle(seed, difficultyInput.value);
  });

  document.getElementById('clearBtn').addEventListener('click', clearGrids);
  document.getElementById('solveBtn').addEventListener('click', solveAttempt);
  document.getElementById('viewSolutionBtn').addEventListener('click', revealSolution);

  document.getElementById('exportBtn').addEventListener('click', () => window.print());

  renderLegend();
  updateGenerateButtonLabel();
  generatePuzzle(Number(seedInput.value || 2026), difficultyInput.value);
})();
