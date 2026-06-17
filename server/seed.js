import bcrypt from 'bcryptjs';
import { pool } from './Config/connectPool.js';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  const hash = await bcrypt.hash('123456', 10);

  await pool.query(`
    INSERT INTO users (name, email, password_hash, role) VALUES
    ('Admin User',   'admin@clinic.com', $1, 'admin'),
    ('Doctor Sara',  'sara@clinic.com',  $1, 'doctor'),
    ('Patient Omar', 'omar@clinic.com',  $1, 'patient')
    ON CONFLICT (email) DO NOTHING;
  `, [hash]);

  const { rows: users } = await pool.query('SELECT * FROM users');
  console.log('Users inserted:', users.map(u => `${u.name} (${u.role})`));

  const doctorUser = users.find(u => u.email === 'sara@clinic.com');
  await pool.query(`
    INSERT INTO doctors (user_id, specialty, license_number, bio)
    VALUES ($1, 'Cardiology', 'LIC-001', 'Experienced cardiologist with 10 years of practice.')
    ON CONFLICT (license_number) DO NOTHING;
  `, [doctorUser.id]);

  const patient = users.find(u => u.email === 'omar@clinic.com');
  await pool.query(`
    INSERT INTO feedback (user_id, rating, comment, status) VALUES
    ($1, 5, 'Great clinic, very professional staff!', 'approved'),
    ($1, 4, 'Clean environment and helpful doctors.', 'approved'),
    ($1, 5, 'Highly recommend to everyone.', 'approved');
  `, [patient.id]);

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
