const { createClient } = require('@vercel/postgres');

// Create a singleton client to be reused across function calls
let client;

function getClient() {
  if (!client) {
    const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
    if (!connectionString) {
      throw new Error('No PostgreSQL connection string found in environment variables POSTGRES_URL or POSTGRES_URL_NON_POOLING');
    }
    client = createClient({
      connectionString: connectionString
    });
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
    const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
    if (!connectionString) {
      throw new Error('No PostgreSQL connection string found in environment variables POSTGRES_URL or POSTGRES_URL_NON_POOLING');
    }
    const freshClient = createClient({
      connectionString: connectionString
    });
    await freshClient.connect();
    return freshClient;
  }
};
