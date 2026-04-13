(() => {
  const questions = [
    {
      id: 'positioning_clarity',
      dimension: 'positioning',
      type: 'slider',
      text: 'How clearly defined is your brand positioning in one sentence?',
      lowLabel: 'Diffuse',
      highLabel: 'Precise',
    },
    {
      id: 'audience_definition',
      dimension: 'audience',
      type: 'slider',
      text: 'How clearly defined is your core target audience?',
      lowLabel: 'Vague segments',
      highLabel: 'Narrow and explicit',
    },
    {
      id: 'offer_expansion',
      dimension: 'coherence',
      type: 'radio',
      text: 'How often do new offers extend beyond your original positioning?',
      options: [
        { label: 'Rarely — growth still fits the original strategic lens.', value: 5 },
        { label: 'Sometimes — a few expansions feel adjacent but not fully coherent.', value: 3 },
        { label: 'Frequently — new offers are driven more by opportunities than strategy.', value: 1 },
      ],
    },
    {
      id: 'messaging_consistency',
      dimension: 'messaging',
      type: 'slider',
      text: 'How consistent is your messaging across channels?',
      lowLabel: 'Inconsistent',
      highLabel: 'Tight and unified',
    },
    {
      id: 'decision_validation',
      dimension: 'decisions',
      type: 'radio',
      text: 'Do strategic decisions get validated against brand positioning?',
      options: [
        { label: 'Yes — consistently, with a clear decision filter.', value: 5 },
        { label: 'Sometimes — it happens, but not with discipline.', value: 3 },
        { label: 'Rarely — decisions are mostly reactive or channel-led.', value: 1 },
      ],
    },
    {
      id: 'value_proposition_alignment',
      dimension: 'positioning',
      type: 'slider',
      text: 'How well does your current value proposition match what you actually deliver?',
      lowLabel: 'Mismatch',
      highLabel: 'Aligned',
    },
    {
      id: 'audience_tradeoff',
      dimension: 'audience',
      type: 'radio',
      text: 'When opportunities arise outside your ideal audience, what usually happens?',
      options: [
        { label: 'We decline or adapt selectively to protect strategic focus.', value: 5 },
        { label: 'We test a portion of them if revenue pressure is high.', value: 3 },
        { label: 'We pursue most of them, even if fit is weak.', value: 1 },
      ],
    },
    {
      id: 'offer_architecture',
      dimension: 'coherence',
      type: 'slider',
      text: 'How coherent is your offer architecture as a portfolio?',
      lowLabel: 'Patchwork',
      highLabel: 'Strategic system',
    },
    {
      id: 'team_alignment',
      dimension: 'decisions',
      type: 'slider',
      text: 'How aligned are leadership and delivery teams on what the brand stands for?',
      lowLabel: 'Different interpretations',
      highLabel: 'Shared strategic understanding',
    },
  ];

  const dimensionLabels = {
    positioning: 'positioning clarity',
    audience: 'audience focus',
    coherence: 'offer coherence',
    messaging: 'messaging consistency',
    decisions: 'decision-making alignment',
  };

  const diagnosisMap = [
    {
      min: 80,
      max: 100,
      status: 'Stable',
      diagnosis:
        'Your brand foundation appears strategically stable. Decisions are mostly reinforcing the same market position over time.',
    },
    {
      min: 60,
      max: 79,
      status: 'Early Drift',
      diagnosis:
        'Your brand shows early signs of drift. Individual decisions are beginning to pull in different directions.',
    },
    {
      min: 40,
      max: 59,
      status: 'Fragmented',
      diagnosis:
        'Your brand is fragmented. Positioning, messaging, and execution are no longer moving as one strategic system.',
    },
    {
      min: 0,
      max: 39,
      status: 'Critical Drift',
      diagnosis:
        'Your brand is in critical drift. Strategic intent has likely been overtaken by short-term, disconnected decisions.',
    },
  ];

  const observationsByDimension = {
    positioning: [
      'Your external promise and internal decision logic appear out of sync.',
      'Positioning language is present, but not consistently translated into operational choices.',
    ],
    audience: [
      'Audience boundaries appear porous, creating mixed signals in how the brand is experienced.',
      'Growth choices may be diluting focus rather than compounding strategic relevance.',
    ],
    coherence: [
      'Offer design suggests expansion beyond the original strategic center of gravity.',
      'The portfolio appears to be accumulating complexity faster than coherence.',
    ],
    messaging: [
      'Messaging varies by channel in ways that weaken strategic memory in the market.',
      'Narrative consistency appears dependent on platform context rather than brand logic.',
    ],
    decisions: [
      'There is no reliable validation layer ensuring major moves reinforce positioning.',
      'Decision velocity may be outpacing strategic alignment discipline.',
    ],
  };

  const state = {
    index: 0,
    answers: {},
  };

  const questionView = document.getElementById('questionView');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  function getCurrentQuestion() {
    return questions[state.index];
  }

  function progressPct() {
    return Math.round(((state.index + 1) / questions.length) * 100);
  }

  function updateProgress() {
    const pct = progressPct();
    progressFill.style.width = `${pct}%`;
    progressText.textContent = `Question ${state.index + 1} of ${questions.length} · ${pct}%`;
  }

  function renderQuestion() {
    const q = getCurrentQuestion();
    const value = state.answers[q.id] || 3;

    const base = `
      <article class="question-block">
        <p class="question-label">${q.text}</p>
        <p class="hint">Rate from 1 (low alignment) to 5 (high alignment).</p>
      `;

    if (q.type === 'slider') {
      questionView.innerHTML = `${base}
        <div class="slider-wrap">
          <input id="sliderInput" type="range" min="1" max="5" step="1" value="${value}" />
          <div class="slider-row">
            <span>${q.lowLabel}</span>
            <span>${q.highLabel}</span>
          </div>
          <p class="slider-value">Current score: <strong id="sliderValue">${value}</strong>/5</p>
        </div>
      </article>`;

      const slider = document.getElementById('sliderInput');
      const sliderValue = document.getElementById('sliderValue');
      slider.addEventListener('input', () => {
        sliderValue.textContent = slider.value;
        state.answers[q.id] = Number(slider.value);
      });
      state.answers[q.id] = Number(slider.value);
    } else {
      const options = q.options
        .map(
          (option, idx) => `
            <label class="option">
              <input
                type="radio"
                name="questionOption"
                value="${option.value}"
                ${state.answers[q.id] === option.value || (!state.answers[q.id] && idx === 0) ? 'checked' : ''}
              />
              <span>${option.label}</span>
            </label>
          `,
        )
        .join('');

      questionView.innerHTML = `${base}<div class="options">${options}</div></article>`;

      const checked = document.querySelector('input[name="questionOption"]:checked');
      state.answers[q.id] = Number(checked.value);

      document.querySelectorAll('input[name="questionOption"]').forEach((input) => {
        input.addEventListener('change', () => {
          state.answers[q.id] = Number(input.value);
        });
      });
    }

    backBtn.disabled = state.index === 0;
    nextBtn.textContent = state.index === questions.length - 1 ? 'See Results' : 'Next';
    updateProgress();
  }

  function normalizeScore(rawScore) {
    const min = questions.length * 1;
    const max = questions.length * 5;
    return Math.round(((rawScore - min) / (max - min)) * 100);
  }

  function pickDiagnosis(score) {
    return diagnosisMap.find((item) => score >= item.min && score <= item.max) || diagnosisMap[3];
  }

  function dimensionAverages() {
    const buckets = {};

    questions.forEach((q) => {
      const v = state.answers[q.id] || 1;
      if (!buckets[q.dimension]) buckets[q.dimension] = [];
      buckets[q.dimension].push(v);
    });

    return Object.entries(buckets).map(([dimension, vals]) => ({
      dimension,
      average: vals.reduce((a, b) => a + b, 0) / vals.length,
    }));
  }

  function buildObservations() {
    const weakest = dimensionAverages()
      .sort((a, b) => a.average - b.average)
      .slice(0, 3);

    return weakest.map((item) => {
      const set = observationsByDimension[item.dimension];
      return set[item.average < 2.8 ? 0 : 1].replace(
        'strategic memory',
        `strategic memory around ${dimensionLabels[item.dimension]}`,
      );
    });
  }

  function animateScore(target, el) {
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 28));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = `Your Brand Drift Score: ${current}`;
    }, 24);
  }

  function renderResult() {
    const rawScore = questions.reduce((sum, q) => sum + (state.answers[q.id] || 1), 0);
    const score = normalizeScore(rawScore);
    const diagnosis = pickDiagnosis(score);
    const observations = buildObservations();

    questionView.innerHTML = `
      <section class="result">
        <p class="kicker">Diagnostic Result</p>
        <h2 class="score" id="scoreLine">Your Brand Drift Score: 0</h2>
        <p class="status">Status: ${diagnosis.status}</p>
        <p>${diagnosis.diagnosis}</p>

        <section>
          <h3>Key Observations</h3>
          <ol class="obs-list">
            ${observations.map((item) => `<li>${item}</li>`).join('')}
          </ol>
        </section>

        <p class="insight">Brand doesn't break in one decision. It drifts through hundreds of small ones.</p>
      </section>
    `;

    const scoreLine = document.getElementById('scoreLine');
    animateScore(score, scoreLine);

    progressFill.style.width = '100%';
    progressText.textContent = 'Complete · Strategic snapshot ready';

    backBtn.style.display = 'none';
    nextBtn.textContent = 'Restart';
    nextBtn.onclick = () => {
      state.index = 0;
      state.answers = {};
      backBtn.style.display = '';
      nextBtn.onclick = handleNext;
      renderQuestion();
    };
  }

  function handleNext() {
    if (state.index < questions.length - 1) {
      state.index += 1;
      renderQuestion();
    } else {
      renderResult();
    }
  }

  function handleBack() {
    if (state.index > 0) {
      state.index -= 1;
      renderQuestion();
    }
  }

  backBtn.addEventListener('click', handleBack);
  nextBtn.addEventListener('click', handleNext);

  renderQuestion();
})();
