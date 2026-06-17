import { pool } from './Config/connectPool.js';
import dotenv from 'dotenv';
dotenv.config();

const { rows } = await pool.query(`
  SELECT a.id, a.patient_id, a.doctor_id, a.status,
         p.name AS patient_name,
         u.name AS doctor_name,
         d.specialty
  FROM appointments a
  JOIN users   p ON p.id = a.patient_id
  JOIN doctors d ON d.id = a.doctor_id
  JOIN users   u ON u.id = d.user_id
  ORDER BY a.id
`);

console.log(JSON.stringify(rows, null, 2));
process.exit(0);
