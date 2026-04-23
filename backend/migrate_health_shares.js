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

  console.log('Creating health_shares table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS health_shares (
      id INT AUTO_INCREMENT PRIMARY KEY,
      author_id INT NOT NULL,
      content TEXT NOT NULL,
      media_url VARCHAR(255) NULL,
      media_type ENUM('image', 'video', 'audio') NULL,
      likes_count INT DEFAULT 0,
      dislikes_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Creating health_share_votes table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS health_share_votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      share_id INT NOT NULL,
      user_id INT NOT NULL,
      vote_type ENUM('like', 'dislike') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_share_vote (share_id, user_id),
      FOREIGN KEY (share_id) REFERENCES health_shares(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Creating health_share_comments table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS health_share_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      share_id INT NOT NULL,
      author_id INT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (share_id) REFERENCES health_shares(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Migration successful: health moments tables created.');
  await connection.end();
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
