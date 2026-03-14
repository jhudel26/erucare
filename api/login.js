const { createClient } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('Login request received:', req.body);
    
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    console.log('Connecting to database...');
    
    // Check if POSTGRES_URL is available
    const postgresUrl = process.env.POSTGRES_URL;
    if (!postgresUrl) {
      console.error('POSTGRES_URL not found in environment variables');
      return res.status(500).json({ success: false, message: 'Database configuration error' });
    }
    
    const client = createClient();
    await client.connect();

    console.log('Querying user:', username);

    const result = await client.query(
      'SELECT id, name, username, password, role FROM users WHERE username = $1',
      [username]
    );

    await client.end();

    console.log('Query result:', result.rows.length, 'rows found');

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = result.rows[0];

    // Simple password verification (for demo - use bcrypt in production)
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    console.log('Password verification');
    
    if (user.password !== hash) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    console.log('Login successful');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};
