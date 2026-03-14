const { createPool } = require('@vercel/postgres');

// Create a singleton pool to be reused across function calls
let pool;

function getPool() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

module.exports = {
  getPool,
  // Helper to run a query using the pooled connection
  query: async (text, params) => {
    const client = getPool();
    return await client.query(text, params);
  },
  // Helper for transactions or complex operations where we need a dedicated client
  getClient: async () => {
    const client = getPool();
    await client.connect();
    return client;
  }
};
