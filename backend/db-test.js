const mysql = require('mysql2/promise');
require('dotenv').config();

async function testApprove() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'healthcare_db'
  });

  try {
    // 1. Create a fake community and fake members
    const [c] = await connection.query(`INSERT INTO communities (name, is_private) VALUES ('fake_priv_1', 1)`);
    const commId = c.insertId;

    const [u1] = await connection.query(`INSERT INTO users (username, password_hash) VALUES ('fake_user_1', 'abc')`);
    const userId = u1.insertId;

    // 2. Insert pending request
    await connection.query(`INSERT INTO community_members (community_id, user_id, role, status) VALUES (?, ?, 'member', 'pending')`, [commId, userId]);

    // 3. Try approving using the EXACT logic from server.js
    console.log('Running exact server.js approval logic...');
    
    await connection.query(`UPDATE community_members SET status = 'approved' WHERE community_id = ? AND user_id = ?`, [commId, userId]);
    const [comms] = await connection.query(`SELECT name FROM communities WHERE id = ?`, [commId]);
    await connection.query(
      `INSERT INTO notifications (user_id, type, content, related_id) VALUES (?, 'request_approved', ?, ?)`,
      [userId, `Your request to join ${comms[0].name} was approved!`, commId]
    );

    console.log('Approve logic executed successfully.');

    // 4. Cleanup
    await connection.query(`DELETE FROM communities WHERE id = ?`, [commId]);
    await connection.query(`DELETE FROM users WHERE id = ?`, [userId]);
  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    await connection.end();
  }
}
testApprove();
