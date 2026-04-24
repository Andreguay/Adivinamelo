import { NextResponse } from 'next/server';
import { insertSession } from '../../../lib/db';

export async function POST(request) {
  const payload = await request.json();
  const { won, attempts, maxAttempts, min, max, score } = payload;

  if (typeof won !== 'boolean' || typeof attempts !== 'number' || typeof maxAttempts !== 'number') {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  await insertSession({ won, attempts, maxAttempts, min, max, score });

  return NextResponse.json({ success: true });
}
