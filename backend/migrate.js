const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  console.log('Connecting to MySQL for migrations...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'healthcare_db'
  });

  console.log('Migrating comments table...');
  try {
    await connection.query(`ALTER TABLE comments ADD COLUMN parent_id INT NULL`);
    await connection.query(`ALTER TABLE comments ADD FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE`);
    console.log('Added parent_id to comments');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') console.log('parent_id already exists');
    else console.error('Error adding parent_id:', err.message);
  }

  try {
    await connection.query(`ALTER TABLE comments ADD COLUMN likes_count INT DEFAULT 0`);
    console.log('Added likes_count to comments');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') console.log('likes_count already exists');
    else console.error('Error adding likes_count:', err.message);
  }

  try {
    await connection.query(`ALTER TABLE comments ADD COLUMN dislikes_count INT DEFAULT 0`);
    console.log('Added dislikes_count to comments');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') console.log('dislikes_count already exists');
    else console.error('Error adding dislikes_count:', err.message);
  }

  console.log('Creating comment_votes table...');
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS comment_votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        comment_id INT NOT NULL,
        user_id INT NOT NULL,
        vote_type ENUM('like', 'dislike') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_vote (comment_id, user_id),
        FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('comment_votes table created (or already exists)');
  } catch (err) {
    console.error('Error creating comment_votes:', err.message);
  }

  console.log('Migration complete!');
  await connection.end();
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
