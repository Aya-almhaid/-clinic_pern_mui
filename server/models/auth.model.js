import { pool } from '../Config/connectPool.js';

export async function findUserByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
}

export async function createUser({ name, email, password_hash, phone }) {
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password_hash, phone) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role',
    [name, email, password_hash, phone]
  );
  return rows[0];
}
