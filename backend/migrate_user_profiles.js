const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  console.log('Connecting to MySQL...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'healthcare_db'
  });

  console.log('Altering users table to add profile fields...');
  try {
    await connection.query(`ALTER TABLE users ADD COLUMN birthdate DATE NULL`);
    console.log('Added birthdate');
  } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }
  
  try {
    await connection.query(`ALTER TABLE users ADD COLUMN description TEXT NULL`);
    console.log('Added description');
  } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }

  try {
    await connection.query(`ALTER TABLE users ADD COLUMN gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL`);
    console.log('Added gender');
  } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }

  try {
    await connection.query(`ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) NULL`);
    console.log('Added profile_picture');
  } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }

  console.log('Migration successful: user profile fields added.');
  await connection.end();
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
