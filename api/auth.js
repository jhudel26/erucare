const { query } = require('./db_helper');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Determine action from the query parameter (preferred for rewrites)
    const action = req.query.action || (req.body && req.body.action);

    if (action === 'login') {
      return await handleLogin(req, res);
    } else if (action === 'logout') {
      return await handleLogout(req, res);
    }

    return res.status(404).json({ 
      success: false, 
      message: 'Invalid auth action: ' + action,
      debug: { method: req.method, query: req.query }
    });
  } catch (error) {
    console.error('Global auth handler error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

async function handleLogin(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const result = await query(
    'SELECT id, name, username, password, role FROM users WHERE username = ?',
    [username]
  );

  if (!result || !result.rows || result.rows.length === 0) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  const user = result.rows[0];
  
  // Try Bcrypt first (Original PHP format: $2y$...)
  let isMatch = false;
  if (user.password && user.password.startsWith('$2')) {
    try {
      isMatch = bcrypt.compareSync(password, user.password);
    } catch (e) {
      console.error('Bcrypt compare error:', e);
    }
  }
  
  // Fallback to SHA256 (Migration format) if Bcrypt didn't match
  if (!isMatch) {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    isMatch = (user.password === hash);
  }
  
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    user: { id: user.id, name: user.name, username: user.username, role: user.role }
  });
}

async function handleLogout(req, res) {
  return res.status(200).json({ success: true, message: 'Logout successful' });
}
