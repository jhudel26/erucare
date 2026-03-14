const { createClient } = require('@vercel/postgres');

async function getClient() {
  const client = createClient();
  await client.connect();
  return client;
}

module.exports = {
  getClient,
  // Helper to run a query and close the connection
  query: async (text, params) => {
    const client = await getClient();
    try {
      return await client.query(text, params);
    } finally {
      await client.end();
    }
  }
};
