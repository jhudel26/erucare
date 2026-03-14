const { query } = require('./db_helper');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Consistent hashing with login.js (SHA256)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    try {
      await query(
        'INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4)',
        [name, username, hashedPassword, role]
      );
      return res.status(201).json({ success: true, message: 'User created successfully' });
    } catch (dbError) {
      if (dbError.code === '23505') {
        return res.status(409).json({ success: false, message: 'Username already exists' });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error adding user:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
