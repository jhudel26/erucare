const { query } = require('./db_helper');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Determine action from the path or query
  const action = req.query.action || req.body.action;

  if (action === 'login') {
    return handleLogin(req, res);
  } else if (action === 'logout') {
    return handleLogout(req, res);
  }

  return res.status(404).json({ success: false, message: 'Invalid auth action' });
};

async function handleLogin(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const result = await query(
      'SELECT id, name, username, password, role FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (user.password !== hash) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, name: user.name, username: user.username, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
}

async function handleLogout(req, res) {
  return res.status(200).json({ success: true, message: 'Logout successful' });
}
