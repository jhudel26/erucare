const { createClient } = require('@vercel/postgres');

// Create a singleton client to be reused across function calls
let client;

function getClient() {
  if (!client) {
    client = createClient();
  }
  return client;
}

module.exports = {
  getClient,
  // Helper to run a query using the PostgreSQL client
  query: async (text, params = []) => {
    const client = getClient();
    await client.connect();

    try {
      const result = await client.query(text, params);
      return { rows: result.rows, rowCount: result.rowCount };
    } finally {
      // Don't close the client as it's reused across function calls
    }
  },
  // Helper for getting a fresh client (for transactions)
  getFreshClient: async () => {
    const freshClient = createClient();
    await freshClient.connect();
    return freshClient;
  }
};
