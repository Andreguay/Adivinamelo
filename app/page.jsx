'use client';

import { useEffect, useMemo, useState } from 'react';

const modes = {
  easy: { label: 'Fácil', min: 1, max: 50, attempts: 999 },
  medium: { label: 'Medio', min: 1, max: 100, attempts: 10 },
  hard: { label: 'Difícil', min: 1, max: 500, attempts: 5 },
};

const defaultConfig = {
  mode: 'medium',
  min: 1,
  max: 100,
  attempts: 10,
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function HomePage() {
  const [mode, setMode] = useState(defaultConfig.mode);
  const [min, setMin] = useState(defaultConfig.min);
  const [max, setMax] = useState(defaultConfig.max);
  const [attempts, setAttempts] = useState(defaultConfig.attempts);
  const [theme, setTheme] = useState('dark');
  const [secret, setSecret] = useState(null);
  const [guess, setGuess] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState('Introduce un número para empezar');
  const [status, setStatus] = useState('Preparado para iniciar nueva partida.');
  const [record, setRecord] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [globalStats, setGlobalStats] = useState({ played: 0, wins: 0, averageAttempts: 0, maxScore: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const remainingAttempts = attempts - attemptCount;
  const precision = attemptCount === 0 ? 0 : Math.max(0, 100 - Math.floor((attemptCount / attempts) * 100));
  const currentGuess = history.length > 0 ? String(history[history.length - 1].guess).padStart(2, '0') : '00';
  const historyLabel = `${history.length} intento${history.length === 1 ? '' : 's'}`;

  const difficultyData = useMemo(() => modes[mode], [mode]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('adivinaNumeroState') : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMode(parsed.mode ?? defaultConfig.mode);
        setMin(parsed.min ?? defaultConfig.min);
        setMax(parsed.max ?? defaultConfig.max);
        setAttempts(parsed.attempts ?? defaultConfig.attempts);
        setTheme(parsed.theme ?? 'dark');
        setRecord(parsed.record ?? 0);
        setGamesWon(parsed.gamesWon ?? 0);
      } catch (error) {
        console.warn('No se pudo leer el estado guardado:', error);
      }
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'adivinaNumeroState',
        JSON.stringify({ mode, min, max, attempts, theme, record, gamesWon })
      );
    }
  }, [mode, min, max, attempts, theme, record, gamesWon]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setGlobalStats(data);
      } catch (error) {
        console.error('Error al cargar estadísticas globales:', error);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  function applyMode(selectedMode) {
    const preset = modes[selectedMode];
    setMode(selectedMode);
    setMin(preset.min);
    setMax(preset.max);
    setAttempts(preset.attempts);
    setFeedback(`Modo ${preset.label} activado.`);
    setStatus(`Modo ${preset.label} cargado.`);
  }

  function validateConfig(currentMin, currentMax, currentAttempts) {
    if (!Number.isInteger(currentMin) || !Number.isInteger(currentMax) || !Number.isInteger(currentAttempts)) {
      return 'Los valores deben ser enteros válidos.';
    }
    if (currentMin < 1 || currentMax <= currentMin) {
      return 'Define un rango válido: mínimo 1 y máximo mayor que mínimo.';
    }
    if (currentAttempts < 1) return 'La cantidad de intentos debe ser al menos 1.';
    if (currentMax - currentMin + 1 < currentAttempts && mode !== 'easy') {
      return 'Asegura un rango compatible con los intentos.';
    }
    return null;
  }

  function resetConfig() {
    applyMode(defaultConfig.mode);
    setFeedback('Configuración restaurada.');
    setStatus('Configuración reiniciada a valores predeterminados.');
  }

  function startGame() {
    const validationMessage = validateConfig(min, max, attempts);
    if (validationMessage) {
      setFeedback(validationMessage);
      setStatus('Error en la configuración. Ajusta los valores.');
      return;
    }

    setSecret(randomInt(min, max));
    setAttemptCount(0);
    setHistory([]);
    setGuess('');
    setFeedback(`Juego iniciado: adivina entre ${min} y ${max}.`);
    setStatus('Protocolo inicializado. Esperando comando del operador.');
  }

  async function storeResult(result) {
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
    } catch (error) {
      console.error('Error al guardar el resultado en PostgreSQL:', error);
    }
  }

  function finishGame(success) {
    if (success) {
      setGamesWon((prev) => prev + 1);
      const score = Math.max(attempts - attemptCount + 1, 1);
      setRecord((prevRecord) => Math.max(prevRecord, score));
      setFeedback(`¡Victoria! Adivinaste en ${attemptCount} intento${attemptCount === 1 ? '' : 's'}.`);
      setStatus('Misión completada. Número detectado con éxito.');
      storeResult({ won: true, attempts: attemptCount, maxAttempts: attempts, min, max, score });
    } else {
      setFeedback(`Juego terminado. El número era ${secret}.`);
      setStatus('Protocolo fallido. Más entrenamiento requerido.');
      storeResult({ won: false, attempts: attemptCount, maxAttempts: attempts, min, max, score: 0 });
    }
    setSecret(null);
  }

  function handleGuess() {
    if (secret === null) {
      startGame();
      return;
    }

    const numericGuess = Number(guess);
    if (!Number.isInteger(numericGuess)) {
      setFeedback('Ingresa un número válido.');
      setStatus('Valor de intento inválido.');
      return;
    }
    if (numericGuess < min || numericGuess > max) {
      setFeedback(`El número debe estar entre ${min} y ${max}.`);
      setStatus('Intento fuera de rango.');
      return;
    }

    const nextAttempt = attemptCount + 1;
    const entry = {
      index: nextAttempt,
      guess: numericGuess,
      outcome: 'higher',
      message: 'Prueba más alto',
    };

    if (numericGuess === secret) {
      entry.outcome = 'success';
      entry.message = 'Número exacto';
      setHistory((list) => [entry, ...list]);
      setAttemptCount(nextAttempt);
      finishGame(true);
      return;
    }

    if (numericGuess > secret) {
      entry.outcome = 'lower';
      entry.message = 'El secreto es menor';
    }

    setHistory((list) => [entry, ...list]);
    setAttemptCount(nextAttempt);

    if (nextAttempt >= attempts) {
      finishGame(false);
      return;
    }

    setFeedback(entry.message);
    setStatus(`Intento ${nextAttempt}. Quedan ${attempts - nextAttempt} intentos.`);
  }

  return (
    <div className="app shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__logo">KN</div>
          <div>
            <span className="brand__title">Kinetic Neon</span>
            <span className="brand__subtitle">Operador_01</span>
          </div>
        </div>
        <nav className="menu">
          <button className="menu__item menu__item--active" type="button">Jugar</button>
          <button className="menu__item" type="button">Historial</button>
          <button className="menu__item" type="button">Logros</button>
          <button className="menu__item" type="button">Soporte</button>
        </nav>
        <div className="theme-toggle">
          <span>Modo</span>
          <button type="button" className="theme-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Claro' : 'Oscuro'}
          </button>
        </div>
        <button type="button" className="primary-btn" onClick={startGame}>
          Nueva partida
        </button>
      </aside>

      <main className="main-panel">
        <header className="header-bar">
          <div>
            <h1>Número Misterioso</h1>
            <p>Configura los parámetros y pon a prueba tu intuición.</p>
          </div>
          <div className="status-card">Estado: {status}</div>
        </header>

        <section className="content-grid">
          <section className="panel panel--settings">
            <div className="panel__header">
              <span>AJUSTES DE DIFICULTAD</span>
              <span className="badge">{difficultyData.label}</span>
            </div>
            <div className="difficulty-cards">
              {Object.entries(modes).map(([key, item]) => (
                <button
                  type="button"
                  key={key}
                  className={`diff-card ${key === mode ? 'active' : ''} diff-card--${key}`}
                  onClick={() => applyMode(key)}
                >
                  <span>{item.label}</span>
                  <small>{`${item.min}-${item.max} · ${item.attempts === 999 ? 'Intentos ilimitados' : `${item.attempts} intentos`}`}</small>
                </button>
              ))}
            </div>
            <div className="settings-grid">
              <label>
                Límite mínimo
                <input
                  type="number"
                  min="1"
                  value={min}
                  onChange={(event) => setMin(Number(event.target.value))}
                />
              </label>
              <label>
                Límite máximo
                <input
                  type="number"
                  min="2"
                  value={max}
                  onChange={(event) => setMax(Number(event.target.value))}
                />
              </label>
              <label>
                Máximo de intentos
                <input
                  type="number"
                  min="1"
                  value={attempts}
                  onChange={(event) => setAttempts(Number(event.target.value))}
                />
              </label>
            </div>
            <div className="settings-actions">
              <span className="info-text">Puntaje personal: {record}</span>
              <button type="button" className="secondary-btn" onClick={resetConfig}>
                Reiniciar configuración
              </button>
            </div>
          </section>

          <section className="panel panel--game">
            <div className="panel__header panel__header--alt">
              <span>Secuencia Éter Activa</span>
              <span className="hint">{feedback}</span>
            </div>
            <div className="game-card">
              <div className="display-number">{currentGuess}</div>
              <div className="input-row">
                <input
                  type="number"
                  placeholder="Tu intento"
                  aria-label="Tu intento"
                  value={guess}
                  onChange={(event) => setGuess(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleGuess();
                    }
                  }}
                />
                <button type="button" className="primary-btn" onClick={handleGuess}>
                  Ejecutar intento
                </button>
              </div>
            </div>
            <div className="stats-grid">
              <div className="metric">
                <span>Vidas restantes</span>
                <strong>{remainingAttempts}</strong>
              </div>
              <div className="metric">
                <span>Racha actual</span>
                <strong>{String(gamesWon).padStart(2, '0')}</strong>
              </div>
              <div className="metric">
                <span>Precisión</span>
                <strong>{precision}%</strong>
              </div>
            </div>
          </section>

          <aside className="panel panel--history">
            <div className="panel__header">
              <span>Historial de eventos</span>
              <span>{historyLabel}</span>
            </div>
            <ul className="history-list">
              {history.map((entry) => (
                <li key={entry.index} className={`history-item ${entry.outcome}`}>
                  <span className="history-item__badge">
                    {entry.outcome === 'success' ? 'Correcto' : entry.outcome === 'higher' ? 'Más alto' : 'Más bajo'}
                  </span>
                  <div>
                    <span>Intento {entry.index}</span>
                    <strong>{entry.guess}</strong>
                  </div>
                  <span>{entry.message}</span>
                </li>
              ))}
              {history.length === 0 && <li className="history-item empty">Aún no hay eventos registrados.</li>}
            </ul>
          </aside>
        </section>
      </main>
    </div>
  );
}
