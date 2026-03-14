module.exports = async function handler(req, res) {
  // Move dependencies inside to catch loading errors
  let query;
  try {
    const db = require('./db_helper');
    query = db.query;
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to load database helper: ' + e.message });
  }

  const crypto = require('crypto');
  let bcrypt;
  try {
    bcrypt = require('bcryptjs');
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to load bcryptjs: ' + e.message });
  }

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Determine action
    const action = req.query.action || (req.body && req.body.action);

    if (action === 'login') {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
      }

      const result = await query('SELECT id, name, username, password, role FROM users WHERE username = ?', [username]);

      if (!result || !result.rows || result.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      const user = result.rows[0];
      let isMatch = false;

      // Check Bcrypt (PHP format)
      if (user.password && user.password.startsWith('$2')) {
        isMatch = bcrypt.compareSync(password, user.password);
      }
      
      // Fallback to SHA256
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

    } else if (action === 'logout') {
      return res.status(200).json({ success: true, message: 'Logout successful' });
    }

    return res.status(404).json({ success: false, message: 'Invalid auth action: ' + action });

  } catch (error) {
    console.error('Auth Handler Error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
  }
};
