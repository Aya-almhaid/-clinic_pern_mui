import bcrypt from 'bcryptjs';
import { pool } from './Config/connectPool.js';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  console.log('Seeding database…');

  // ── 1. Clear existing demo data (order matters due to FK constraints) ──
  await pool.query(`
    DELETE FROM record_notes;
    DELETE FROM prescriptions;
    DELETE FROM medical_records;
    DELETE FROM feedback;
    DELETE FROM appointments;
    DELETE FROM doctors;
    DELETE FROM users WHERE email IN (
      'admin@clinic.com','dr.sarah@clinic.com','dr.omar@clinic.com',
      'john@clinic.com','sara@clinic.com'
    );
  `);

  // ── 2. Users ──
  const adminHash   = await bcrypt.hash('Admin123',   10);
  const doctorHash  = await bcrypt.hash('Doctor123',  10);
  const patientHash = await bcrypt.hash('Patient123', 10);

  const { rows: users } = await pool.query(`
    INSERT INTO users (name, email, password_hash, role, phone) VALUES
      ('Admin User',      'admin@clinic.com',    $1, 'admin',   '+1-555-000-0001'),
      ('Dr. Sarah Ahmed', 'dr.sarah@clinic.com', $2, 'doctor',  '+1-555-000-0002'),
      ('Dr. Omar Hassan', 'dr.omar@clinic.com',  $2, 'doctor',  '+1-555-000-0003'),
      ('John Smith',      'john@clinic.com',     $3, 'patient', '+1-555-000-0004'),
      ('Sara Ali',        'sara@clinic.com',     $3, 'patient', '+1-555-000-0005')
    RETURNING id, name, email, role;
  `, [adminHash, doctorHash, patientHash]);

  console.log('Users:', users.map(u => `${u.name} (${u.role})`).join(', '));

  const uByEmail = Object.fromEntries(users.map(u => [u.email, u]));

  // ── 3. Doctor profiles ──
  const { rows: doctors } = await pool.query(`
    INSERT INTO doctors (user_id, specialty, license_number, bio) VALUES
      ($1, 'Cardiology',  'LIC-SARAH-001', 'Board-certified cardiologist with 12 years of experience in interventional cardiology.'),
      ($2, 'Neurology',   'LIC-OMAR-001',  'Neurologist specializing in headache disorders and multiple sclerosis.')
    RETURNING id, user_id, specialty;
  `, [uByEmail['dr.sarah@clinic.com'].id, uByEmail['dr.omar@clinic.com'].id]);

  console.log('Doctors:', doctors.map(d => `#${d.id} (${d.specialty})`).join(', '));

  const sarahDoc = doctors.find(d => d.user_id === uByEmail['dr.sarah@clinic.com'].id);
  const omarDoc  = doctors.find(d => d.user_id === uByEmail['dr.omar@clinic.com'].id);
  const johnId   = uByEmail['john@clinic.com'].id;
  const saraId   = uByEmail['sara@clinic.com'].id;

  // ── 4. Appointments ──
  const { rows: appts } = await pool.query(`
    INSERT INTO appointments (patient_id, doctor_id, scheduled_at, status, reason) VALUES
      ($1, $3, NOW() + INTERVAL '3 days',  'pending',   'Chest pain and shortness of breath'),
      ($1, $3, NOW() + INTERVAL '7 days',  'pending',   'Follow-up after ECG results'),
      ($1, $4, NOW() - INTERVAL '5 days',  'completed', 'Recurring migraines evaluation'),
      ($2, $3, NOW() - INTERVAL '10 days', 'completed', 'Annual heart checkup'),
      ($2, $3, NOW() - INTERVAL '2 days',  'cancelled', 'Routine blood pressure review')
    RETURNING id, patient_id, doctor_id, status;
  `, [johnId, saraId, sarahDoc.id, omarDoc.id]);

  console.log('Appointments:', appts.map(a => `#${a.id} (${a.status})`).join(', '));

  const completedJohnOmar = appts.find(a => a.patient_id === johnId  && a.doctor_id === omarDoc.id  && a.status === 'completed');
  const completedSaraSarah = appts.find(a => a.patient_id === saraId && a.doctor_id === sarahDoc.id && a.status === 'completed');

  // ── 5. Medical records ──
  const { rows: records } = await pool.query(`
    INSERT INTO medical_records (appointment_id, patient_id, doctor_id, diagnosis, notes) VALUES
      ($1, $3, $5, 'Migraine with aura', 'Patient reports throbbing unilateral headaches 3-4 times/month. Recommended preventive therapy.'),
      ($2, $4, $6, 'Stage 1 hypertension', 'Blood pressure 142/92. Prescribed lifestyle changes and medication. Follow-up in 4 weeks.')
    RETURNING id, patient_id, doctor_id;
  `, [
    completedJohnOmar.id,  completedSaraSarah.id,
    johnId, saraId,
    omarDoc.id, sarahDoc.id
  ]);

  console.log('Medical records:', records.map(r => `#${r.id}`).join(', '));

  const johnRecord = records.find(r => r.patient_id === johnId);
  const saraRecord = records.find(r => r.patient_id === saraId);

  // ── 6. Prescriptions ──
  await pool.query(`
    INSERT INTO prescriptions (record_id, medication, dosage, instructions, duration) VALUES
      ($1, 'Sumatriptan',   '50mg',  'Take at onset of migraine. Do not exceed 2 doses in 24 hours.', '3 months'),
      ($1, 'Propranolol',   '40mg',  'Take once daily in the morning. Do not stop suddenly.',         '3 months'),
      ($2, 'Amlodipine',    '5mg',   'Take once daily. Monitor blood pressure weekly.',               '4 weeks'),
      ($2, 'Hydrochlorothiazide', '12.5mg', 'Take in the morning with food.',                         '4 weeks');
  `, [johnRecord.id, saraRecord.id]);

  console.log('Prescriptions seeded.');

  // ── 7. Follow-up note ──
  await pool.query(`
    INSERT INTO record_notes (record_id, author_id, note) VALUES
      ($1, $2, 'Patient called to report improvement. Sumatriptan effective. Continue current plan.');
  `, [johnRecord.id, uByEmail['dr.omar@clinic.com'].id]);

  console.log('Record notes seeded.');

  // ── 8. Feedback ──
  await pool.query(`
    INSERT INTO feedback (user_id, rating, comment, status, moderated_by) VALUES
      ($1, 5, 'Dr. Sarah was incredibly thorough and caring. Best cardiology visit I have had!',       'approved', $3),
      ($2, 5, 'Dr. Omar explained everything clearly. I finally understand my condition. Thank you!', 'approved', $3),
      ($1, 4, 'Waiting time was a bit long but the staff were friendly and professional.',             'pending',  NULL);
  `, [saraId, johnId, uByEmail['admin@clinic.com'].id]);

  console.log('Feedback seeded.');

  console.log('\n✓ Seed complete! Demo accounts:');
  console.log('  admin@clinic.com     / Admin123   (Admin)');
  console.log('  dr.sarah@clinic.com  / Doctor123  (Dr. Sarah Ahmed — Cardiology)');
  console.log('  dr.omar@clinic.com   / Doctor123  (Dr. Omar Hassan — Neurology)');
  console.log('  john@clinic.com      / Patient123 (John Smith)');
  console.log('  sara@clinic.com      / Patient123 (Sara Ali)');

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
