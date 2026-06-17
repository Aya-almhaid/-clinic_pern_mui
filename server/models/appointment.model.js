import { pool } from '../Config/connectPool.js';

export async function createAppointment({ patient_id, doctor_id, scheduled_at, reason }) {
  const { rows } = await pool.query(
    'INSERT INTO appointments (patient_id, doctor_id, scheduled_at, reason) VALUES ($1,$2,$3,$4) RETURNING *',
    [patient_id, doctor_id, scheduled_at, reason]
  );
  return rows[0];
}

export async function getAppointmentsForUser(user_id, role) {
  const base = `
    SELECT a.*,
           p.name  AS patient_name,
           u.name  AS doctor_name,
           d.specialty
    FROM appointments a
    JOIN users    p ON p.id = a.patient_id
    JOIN doctors  d ON d.id = a.doctor_id
    JOIN users    u ON u.id = d.user_id
  `;
  if (role === 'admin') {
    const { rows } = await pool.query(base + ' ORDER BY a.scheduled_at DESC');
    return rows;
  }
  if (role === 'doctor') {
    const { rows } = await pool.query(
      base + ' WHERE d.user_id = $1 ORDER BY a.scheduled_at DESC',
      [user_id]
    );
    return rows;
  }
  const { rows } = await pool.query(
    base + ' WHERE a.patient_id = $1 ORDER BY a.scheduled_at DESC',
    [user_id]
  );
  return rows;
}

export async function getAppointmentById(id) {
  const { rows } = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
  return rows[0];
}

export async function updateAppointmentStatus(id, status) {
  const { rows } = await pool.query(
    'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return rows[0];
}

export async function rescheduleAppointment(id, scheduled_at) {
  const { rows } = await pool.query(
    'UPDATE appointments SET scheduled_at = $1 WHERE id = $2 RETURNING *',
    [scheduled_at, id]
  );
  return rows[0];
}
