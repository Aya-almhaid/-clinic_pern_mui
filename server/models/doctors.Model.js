import { pool } from '../Config/connectPool.js';

export async function getAllDoctors(specialty) {
  let q = `SELECT d.*, u.name, u.email, u.phone FROM doctors d JOIN users u ON u.id = d.user_id`;
  const params = [];
  if (specialty) {
    params.push(specialty);
    q += ` WHERE d.specialty = $1`;
  }
  const { rows } = await pool.query(q + ' ORDER BY d.id', params);
  return rows;
}

export async function getDoctorById(id) {
  const { rows } = await pool.query(
    `SELECT d.*, u.name, u.email, u.phone FROM doctors d JOIN users u ON u.id = d.user_id WHERE d.id = $1`,
    [id]
  );
  return rows[0];
}

export async function getDoctorByUserId(user_id) {
  const { rows } = await pool.query('SELECT * FROM doctors WHERE user_id = $1', [user_id]);
  return rows[0];
}

export async function createDoctor({ user_id, specialty, license_number, bio }) {
  const { rows } = await pool.query(
    'INSERT INTO doctors (user_id, specialty, license_number, bio) VALUES ($1,$2,$3,$4) RETURNING *',
    [user_id, specialty, license_number, bio]
  );
  return rows[0];
}

export async function updateDoctor(id, { specialty, bio }) {
  const { rows } = await pool.query(
    'UPDATE doctors SET specialty = COALESCE($1, specialty), bio = COALESCE($2, bio) WHERE id = $3 RETURNING *',
    [specialty, bio, id]
  );
  return rows[0];
}
