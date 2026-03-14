const { query } = require('./db_helper');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Testing database connection...');
    
    // Attempt a simple query
    const result = await query('SELECT 1 as connection_test', []);
    
    return res.status(200).json({
      success: true,
      message: 'Database connection successful',
      data: result.rows[0],
      environment: {
        host: process.env.DB_HOST ? 'Configured (Env)' : 'Default (AlwaysData)',
        database: process.env.DB_NAME ? 'Configured (Env)' : 'Default (AlwaysData)',
        user: process.env.DB_USER ? 'Configured (Env)' : 'Default (AlwaysData)'
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      code: error.code,
      errno: error.errno,
      details: 'Check if your database host allows external connections and your credentials are correct in Vercel environment variables.'
    });
  }
};
