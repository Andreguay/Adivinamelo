import fs from 'fs/promises';
import path from 'path';

const sessionsFile = path.join(process.cwd(), 'db', 'sessions.json');

// Ensure the db directory exists
async function ensureDbDir() {
  const dbDir = path.join(process.cwd(), 'db');
  try {
    await fs.access(dbDir);
  } catch {
    await fs.mkdir(dbDir, { recursive: true });
  }
}

// Read sessions from file
async function readSessions() {
  await ensureDbDir();
  try {
    const data = await fs.readFile(sessionsFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write sessions to file
async function writeSessions(sessions) {
  await ensureDbDir();
  await fs.writeFile(sessionsFile, JSON.stringify(sessions, null, 2));
}

// Insert a new session
export async function insertSession(session) {
  const sessions = await readSessions();
  sessions.push({ ...session, played_at: new Date().toISOString() });
  await writeSessions(sessions);
}

// Get stats
export async function getStats() {
  const sessions = await readSessions();
  if (sessions.length === 0) {
    return { played: 0, wins: 0, averageAttempts: 0, maxScore: 0 };
  }
  const played = sessions.length;
  const wins = sessions.filter(s => s.won).length;
  const totalAttempts = sessions.reduce((sum, s) => sum + s.attempts, 0);
  const averageAttempts = totalAttempts / played;
  const maxScore = Math.max(...sessions.map(s => s.score));
  return {
    played,
    wins,
    averageAttempts: Math.round(averageAttempts * 100) / 100,
    maxScore
  };
}
