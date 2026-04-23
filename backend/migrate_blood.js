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

  console.log('Creating blood_requests table...');
  
  await connection.query(`
    CREATE TABLE IF NOT EXISTS blood_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      patient_name VARCHAR(255) NOT NULL,
      blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
      units_required INT NOT NULL,
      location VARCHAR(255) NOT NULL,
      urgency ENUM('low', 'medium', 'high', 'critical') DEFAULT 'high',
      status ENUM('pending', 'fulfilled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Migration successful: blood_requests table created or already exists.');
  await connection.end();
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
