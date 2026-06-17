import bcrypt from 'bcryptjs';
import { pool } from './Config/connectPool.js';
import dotenv from 'dotenv';
dotenv.config();

async function addDoctor() {
  const hash = await bcrypt.hash('123456', 10);

  // Insert user
  const { rows } = await pool.query(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES ('Aya', 'aya@clinic.com', $1, 'doctor')
    ON CONFLICT (email) DO NOTHING
    RETURNING id, name, email, role;
  `, [hash]);

  if (rows.length === 0) {
    console.log('User aya@clinic.com already exists — skipping.');
    process.exit(0);
  }

  const user = rows[0];
  console.log('User created:', user);

  // Insert doctor profile
  await pool.query(`
    INSERT INTO doctors (user_id, specialty, license_number, bio)
    VALUES ($1, 'Neurology', 'LIC-AYA-001', 'Specialist in neurology and nervous system disorders.')
    ON CONFLICT (license_number) DO NOTHING;
  `, [user.id]);

  console.log('Doctor profile created for Aya (Neurology).');
  console.log('Login: aya@clinic.com / 123456');
  process.exit(0);
}

addDoctor().catch(err => { console.error(err); process.exit(1); });
