import { pool } from '../Config/connectPool.js';

export async function submitFeedback({ user_id, rating, comment }) {
  const { rows } = await pool.query(
    'INSERT INTO feedback (user_id, rating, comment) VALUES ($1,$2,$3) RETURNING *',
    [user_id, rating, comment]
  );
  return rows[0];
}

export async function getApprovedFeedback() {
  const { rows } = await pool.query(
    `SELECT f.*, u.name FROM feedback f
     JOIN users u ON u.id = f.user_id
     WHERE f.status = 'approved'
     ORDER BY f.created_at DESC`
  );
  return rows;
}

export async function getMyFeedback(user_id) {
  const { rows } = await pool.query(
    'SELECT * FROM feedback WHERE user_id = $1 ORDER BY created_at DESC',
    [user_id]
  );
  return rows;
}

export async function getAllFeedback() {
  const { rows } = await pool.query(
    `SELECT f.*, u.name FROM feedback f
     JOIN users u ON u.id = f.user_id
     ORDER BY f.created_at DESC`
  );
  return rows;
}

export async function moderateFeedback(id, status, moderated_by) {
  const { rows } = await pool.query(
    'UPDATE feedback SET status = $1, moderated_by = $2 WHERE id = $3 RETURNING *',
    [status, moderated_by, id]
  );
  return rows[0];
}
