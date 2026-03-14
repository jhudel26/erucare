const mysql = require('mysql2/promise');

// Create a singleton pool to be reused across function calls
let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'mysql-erucare.alwaysdata.net',
      user: process.env.DB_USER || 'erucare',
      password: process.env.DB_PASSWORD || 'Mickeyandmouse152526.',
      database: process.env.DB_NAME || 'erucare_tracker',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

module.exports = {
  getPool,
  // Helper to run a query using the pooled connection (MySQL uses ? as placeholder)
  query: async (text, params) => {
    // Convert PostgreSQL $1, $2 style to MySQL ? style if needed
    // In our case, we'll manually fix the queries in the API handlers
    const pool = getPool();
    const [rows, fields] = await pool.execute(text, params);
    return { rows, rowCount: rows.length };
  },
  // Helper for transactions
  getClient: async () => {
    const pool = getPool();
    return await pool.getConnection();
  }
};
