const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool(config.db);

// Verify initial pool connection
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log(`[Database] MySQL pool connected successfully to '${config.db.database}' at ${config.db.host}:${config.db.port}`);
    conn.release();
  } catch (err) {
    console.error('[Database] Failed to connect to MySQL database:', err.message);
  }
})();

module.exports = pool;
