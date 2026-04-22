const selectors = {
  minInput: document.getElementById('minInput'),
  maxInput: document.getElementById('maxInput'),
  attemptsInput: document.getElementById('attemptsInput'),
  guessInput: document.getElementById('guessInput'),
  submitGuessBtn: document.getElementById('submitGuessBtn'),
  newGameBtn: document.getElementById('newGameBtn'),
  resetConfigBtn: document.getElementById('resetConfigBtn'),
  currentGuess: document.getElementById('currentGuess'),
  remainingAttempts: document.getElementById('remainingAttempts'),
  streakCount: document.getElementById('streakCount'),
  precisionValue: document.getElementById('precisionValue'),
  historyList: document.getElementById('historyList'),
  feedbackText: document.getElementById('feedbackText'),
  difficultyCards: document.querySelectorAll('.diff-card'),
  difficultyBadge: document.getElementById('difficultyBadge'),
  themeToggle: document.getElementById('themeToggle'),
  scoreText: document.getElementById('scoreText'),
  systemStatus: document.getElementById('systemStatus'),
};

const configDefaults = {
  mode: 'medium',
  min: 1,
  max: 100,
  attempts: 10,
};

const modes = {
  easy: { label: 'Fácil', min: 1, max: 50, attempts: 999 },
  medium: { label: 'Medio', min: 1, max: 100, attempts: 10 },
  hard: { label: 'Difícil', min: 1, max: 500, attempts: 5 },
};

const state = {
  mode: configDefaults.mode,
  min: configDefaults.min,
  max: configDefaults.max,
  maxAttempts: configDefaults.attempts,
  secretNumber: null,
  attemptCount: 0,
  history: [],
  record: 0,
  gamesWon: 0,
  theme: 'dark',
};

function loadStoredState() {
  const saved = localStorage.getItem('adivinaNumeroState');
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    state.record = parsed.record || 0;
    state.gamesWon = parsed.gamesWon || 0;
    state.theme = parsed.theme || state.theme;
    state.mode = parsed.mode || state.mode;
    state.min = parsed.min || state.min;
    state.max = parsed.max || state.max;
    state.maxAttempts = parsed.maxAttempts || state.maxAttempts;
  } catch (error) {
    console.warn('No se pudieron cargar los datos de localStorage.', error);
  }
}

function storeState() {
  localStorage.setItem(
    'adivinaNumeroState',
    JSON.stringify({
      record: state.record,
      gamesWon: state.gamesWon,
      theme: state.theme,
      mode: state.mode,
      min: state.min,
      max: state.max,
      maxAttempts: state.maxAttempts,
    })
  );
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateTheme() {
  document.body.classList.toggle('light', state.theme === 'light');
  selectors.themeToggle.textContent = state.theme === 'dark' ? 'Claro' : 'Oscuro';
}

function updateDifficultyUI() {
  selectors.difficultyCards.forEach((card) => {
    card.classList.toggle('active', card.dataset.mode === state.mode);
  });
  selectors.difficultyBadge.textContent = modes[state.mode].label;
}

function updateScoreText() {
  selectors.scoreText.textContent = `Puntaje personal: ${state.record}`;
}

function updateGameUI() {
  selectors.remainingAttempts.textContent = Math.max(state.maxAttempts - state.attemptCount, 0);
  selectors.streakCount.textContent = state.gamesWon.toString().padStart(2, '0');
  const precision = state.attemptCount === 0 ? 0 : Math.max(0, 100 - Math.floor((state.attemptCount / state.maxAttempts) * 100));
  selectors.precisionValue.textContent = `${precision}%`;
  selectors.currentGuess.textContent = state.history.length > 0 ? String(state.history[state.history.length - 1].guess).padStart(2, '0') : '00';
  selectors.historyCount.textContent = `${state.history.length} intento${state.history.length === 1 ? '' : 's'}`;
}

function setStatus(message, tone = 'normal') {
  selectors.systemStatus.textContent = message;
  selectors.systemStatus.style.color =
    tone === 'success' ? 'var(--success)' : tone === 'danger' ? 'var(--danger)' : 'var(--accent)';
}

function resetHistory() {
  selectors.historyList.innerHTML = '';
}

function renderHistoryItem(entry) {
  const li = document.createElement('li');
  li.className = `history-item ${entry.outcome}`;
  li.innerHTML = `
    <span class="history-item__badge">${entry.outcome === 'success' ? 'Correcto' : entry.outcome === 'higher' ? 'Más alto' : 'Más bajo'}</span>
    <div>
      <span>Intento ${entry.index}</span>
      <strong>${entry.guess}</strong>
    </div>
    <span>${entry.message}</span>
  `;
  selectors.historyList.prepend(li);
}

function setConfigValues() {
  selectors.minInput.value = state.min;
  selectors.maxInput.value = state.max;
  selectors.attemptsInput.value = state.maxAttempts;
}

function applyMode(modeKey) {
  const mode = modes[modeKey];
  state.mode = modeKey;
  state.min = mode.min;
  state.max = mode.max;
  state.maxAttempts = mode.attempts;
  setConfigValues();
  updateDifficultyUI();
}

function validateSettings(min, max, attempts) {
  if (!Number.isInteger(min) || !Number.isInteger(max) || !Number.isInteger(attempts)) {
    return 'Los valores deben ser enteros válidos.';
  }
  if (min < 1 || max <= min) {
    return 'Define un rango válido: mínimo 1 y máximo mayor que mínimo.';
  }
  if (attempts < 1) {
    return 'La cantidad de intentos debe ser al menos 1.';
  }
  if (max - min + 1 < attempts && state.mode !== 'easy') {
    return 'Asegura un rango compatible con los intentos.';
  }
  return null;
}

function applySettingsFromInputs() {
  const min = parseInt(selectors.minInput.value, 10);
  const max = parseInt(selectors.maxInput.value, 10);
  let attempts = parseInt(selectors.attemptsInput.value, 10);
  const invalidMessage = validateSettings(min, max, attempts);
  if (invalidMessage) {
    selectors.feedbackText.textContent = invalidMessage;
    selectors.feedbackText.style.color = 'var(--danger)';
    return false;
  }
  state.min = min;
  state.max = max;
  state.maxAttempts = attempts;
  selectors.feedbackText.textContent = 'Configuración lista. Ejecuta un intento.';
  selectors.feedbackText.style.color = 'var(--text)';
  return true;
}

function startGame() {
  state.attemptCount = 0;
  state.history = [];
  state.secretNumber = randomInt(state.min, state.max);
  resetHistory();
  selectors.guessInput.value = '';
  selectors.guessInput.disabled = false;
  selectors.submitGuessBtn.disabled = false;
  selectors.feedbackText.textContent = `Juego iniciado: adivina entre ${state.min} y ${state.max}.`;
  selectors.feedbackText.style.color = 'var(--text)';
  setStatus('Protocolo inicializado. Esperando comando del operador.');
  updateGameUI();
  storeState();
}

function finishGame(success) {
  selectors.guessInput.disabled = true;
  selectors.submitGuessBtn.disabled = true;
  if (success) {
    state.gamesWon += 1;
    const score = Math.max(state.maxAttempts - state.attemptCount + 1, 1);
    state.record = Math.max(state.record, score);
    selectors.feedbackText.textContent = `¡Victoria! Adivinaste con ${state.attemptCount} intento${state.attemptCount === 1 ? '' : 's'}.`; 
    selectors.feedbackText.style.color = 'var(--success)';
    setStatus('Misión completada. Número detectado con éxito.', 'success');
  } else {
    selectors.feedbackText.textContent = `Juego terminado. El número era ${state.secretNumber}.`; 
    selectors.feedbackText.style.color = 'var(--danger)';
    setStatus('Protocolo fallido. Más entrenamiento requerido.', 'danger');
  }
  updateScoreText();
  updateGameUI();
  storeState();
}

function handleGuessSubmission() {
  const guess = parseInt(selectors.guessInput.value, 10);
  if (Number.isNaN(guess)) {
    selectors.feedbackText.textContent = 'Ingresa un número válido.';
    selectors.feedbackText.style.color = 'var(--danger)';
    return;
  }
  if (guess < state.min || guess > state.max) {
    selectors.feedbackText.textContent = `El número debe estar entre ${state.min} y ${state.max}.`;
    selectors.feedbackText.style.color = 'var(--danger)';
    return;
  }

  state.attemptCount += 1;
  const remaining = state.maxAttempts - state.attemptCount;
  const entry = {
    index: state.attemptCount,
    guess,
    outcome: 'higher',
    message: 'Prueba más alto',
  };

  if (guess === state.secretNumber) {
    entry.outcome = 'success';
    entry.message = 'Número exacto';
    state.history.push(entry);
    renderHistoryItem(entry);
    finishGame(true);
    return;
  }

  if (guess > state.secretNumber) {
    entry.outcome = 'lower';
    entry.message = 'El secreto es menor';
  } else {
    entry.outcome = 'higher';
    entry.message = 'El secreto es mayor';
  }

  state.history.push(entry);
  renderHistoryItem(entry);

  if (remaining <= 0) {
    finishGame(false);
  } else {
    selectors.feedbackText.textContent = entry.message;
    selectors.feedbackText.style.color = entry.outcome === 'higher' ? 'var(--accent)' : 'var(--danger)';
    setStatus(`Intento ${state.attemptCount}. Quedan ${remaining} intentos.`);
    updateGameUI();
  }
}

function initializeEventListeners() {
  selectors.submitGuessBtn.addEventListener('click', () => {
    if (state.secretNumber === null) startGame();
    handleGuessSubmission();
  });

  selectors.guessInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      selectors.submitGuessBtn.click();
    }
  });

  selectors.newGameBtn.addEventListener('click', () => {
    if (applySettingsFromInputs()) {
      startGame();
    }
  });

  selectors.resetConfigBtn.addEventListener('click', () => {
    applyMode(configDefaults.mode);
    state.theme = state.theme || 'dark';
    setStatus('Configuración restaurada a valores predeterminados.');
    storeState();
  });

  selectors.difficultyCards.forEach((card) => {
    card.addEventListener('click', () => {
      applyMode(card.dataset.mode);
      setStatus(`Modo ${modes[card.dataset.mode].label} activado.`);
      storeState();
    });
  });

  selectors.themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    updateTheme();
    storeState();
  });

  selectors.minInput.addEventListener('change', applySettingsFromInputs);
  selectors.maxInput.addEventListener('change', applySettingsFromInputs);
  selectors.attemptsInput.addEventListener('change', applySettingsFromInputs);
}

function initializeApp() {
  loadStoredState();
  updateTheme();
  applyMode(state.mode);
  setConfigValues();
  updateScoreText();
  updateGameUI();
  initializeEventListeners();
  setStatus('Preparado para iniciar una nueva partida.');
}

initializeApp();
