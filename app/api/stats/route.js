import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  const result = await query(
    'SELECT COUNT(*) AS played, COUNT(*) FILTER (WHERE won) AS wins, ROUND(AVG(attempts)::numeric, 2) AS average_attempts, MAX(score) AS max_score FROM game_sessions'
  );
  const row = result.rows[0] || { played: 0, wins: 0, average_attempts: 0, max_score: 0 };

  return NextResponse.json({
    played: Number(row.played),
    wins: Number(row.wins),
    averageAttempts: Number(row.average_attempts),
    maxScore: Number(row.max_score),
  });
}
