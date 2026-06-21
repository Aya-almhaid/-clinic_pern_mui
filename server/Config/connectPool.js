import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
  ssl: process.env.CONNECTION_STRING?.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

export async function connectDB() {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connected');
  } catch (err) {
    console.error('Database connection failed:', err.message || err.code || err);
    if (err.errors) console.error('Underlying errors:', err.errors.map((e) => e.message || e.code || e));
    console.error('CONNECTION_STRING is set:', Boolean(process.env.CONNECTION_STRING));
    process.exit(1);
  }
}
