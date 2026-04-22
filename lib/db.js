import pkg from 'pg';
const { Pool } = pkg;

const pool = global.pgPool || new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool;
}

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}
