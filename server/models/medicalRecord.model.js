import { pool } from '../Config/connectPool.js';

export async function createRecord({ appointment_id, patient_id, doctor_id, diagnosis, notes }) {
  const { rows } = await pool.query(
    'INSERT INTO medical_records (appointment_id, patient_id, doctor_id, diagnosis, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [appointment_id, patient_id, doctor_id, diagnosis, notes]
  );
  return rows[0];
}

export async function getRecordById(id) {
  const { rows } = await pool.query('SELECT * FROM medical_records WHERE id = $1', [id]);
  return rows[0];
}

export async function getRecordsForPatient(patient_id) {
  const { rows } = await pool.query(
    'SELECT * FROM medical_records WHERE patient_id = $1 ORDER BY created_at DESC',
    [patient_id]
  );
  return rows;
}

export async function getNotesForRecord(record_id) {
  const { rows } = await pool.query(
    'SELECT * FROM record_notes WHERE record_id = $1 ORDER BY created_at ASC',
    [record_id]
  );
  return rows;
}

export async function addNoteToRecord({ record_id, author_id, note }) {
  const { rows } = await pool.query(
    'INSERT INTO record_notes (record_id, author_id, note) VALUES ($1,$2,$3) RETURNING *',
    [record_id, author_id, note]
  );
  return rows[0];
}
