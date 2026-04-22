import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function POST(request) {
  const payload = await request.json();
  const { won, attempts, maxAttempts, min, max, score } = payload;

  if (typeof won !== 'boolean' || typeof attempts !== 'number' || typeof maxAttempts !== 'number') {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  await query(
    'INSERT INTO game_sessions (won, attempts, max_attempts, min_value, max_value, score) VALUES ($1, $2, $3, $4, $5, $6)',
    [won, attempts, maxAttempts, min, max, score]
  );

  return NextResponse.json({ success: true });
}
