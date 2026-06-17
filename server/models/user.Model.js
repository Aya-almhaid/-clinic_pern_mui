import { pool } from '../Config/connectPool.js';

export async function getAllUsers() {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, phone, created_at FROM users ORDER BY id'
  );
  return rows;
}

export async function getUserById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0];
}

export async function updateUserById(id, { name, phone, email }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET name  = COALESCE($1, name),
         phone = COALESCE($2, phone),
         email = COALESCE($3, email)
     WHERE id = $4
     RETURNING id, name, email, role, phone`,
    [name, phone, email, id]
  );
  return rows[0];
}

export async function updateUserPassword(id, newHash) {
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, id]);
}

export async function getUserWithHash(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
}

export async function deleteUserById(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

export async function updateUserRole(id, role) {
  await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
}
