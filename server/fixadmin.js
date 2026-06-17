import { pool } from './Config/connectPool.js';
import dotenv from 'dotenv';
dotenv.config();

async function fix() {
  const all = await pool.query("SELECT id, name, email, role FROM users ORDER BY id");
  console.log('ALL users in DB:');
  all.rows.forEach(u => console.log(` id=${u.id} | ${u.name} | ${u.email} | role=${u.role}`));

  const result = await pool.query("UPDATE users SET role = 'admin' WHERE email = 'admin@clinic.com'");
  console.log('\nUpdated rows:', result.rowCount);

  process.exit(0);
}

fix().catch(err => { console.error(err); process.exit(1); });
