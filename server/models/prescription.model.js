import { pool } from '../Config/connectPool.js';

export async function createPrescription({ record_id, medication, dosage, instructions, duration }) {
  const { rows } = await pool.query(
    'INSERT INTO prescriptions (record_id, medication, dosage, instructions, duration) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [record_id, medication, dosage, instructions, duration]
  );
  return rows[0];
}

export async function getPrescriptionsByRecordId(record_id) {
  const { rows } = await pool.query(
    'SELECT * FROM prescriptions WHERE record_id = $1',
    [record_id]
  );
  return rows;
}

export async function getPrescriptionsForPatient(patient_id) {
  const { rows } = await pool.query(
    `SELECT p.* FROM prescriptions p
     JOIN medical_records r ON r.id = p.record_id
     WHERE r.patient_id = $1
     ORDER BY p.created_at DESC`,
    [patient_id]
  );
  return rows;
}

export async function getPrescriptionsForDoctor(user_id) {
  const { rows } = await pool.query(
    `SELECT p.*, u.name AS patient_name FROM prescriptions p
     JOIN medical_records r ON r.id = p.record_id
     JOIN doctors d ON d.id = r.doctor_id
     JOIN users u ON u.id = r.patient_id
     WHERE d.user_id = $1
     ORDER BY p.created_at DESC`,
    [user_id]
  );
  return rows;
}
