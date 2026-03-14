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
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const client = createClient();
    await client.connect();

    const result = await client.query(
      'SELECT id, name, username, password, role FROM users WHERE username = $1',
      [username]
    );

    await client.end();

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = result.rows[0];

    // Simple password verification (for demo - use bcrypt in production)
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (user.password !== hash) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

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
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
