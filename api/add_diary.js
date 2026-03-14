const { query } = require('./db_helper');

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
    const { user_id, entry_text } = req.body;

    if (!user_id || !entry_text) {
      return res.status(400).json({ success: false, message: 'User ID and entry text are required' });
    }

    await query(
      'INSERT INTO diary_entries (user_id, entry_text, created_at) VALUES ($1, $2, NOW())',
      [user_id, entry_text]
    );

    return res.status(201).json({
      success: true,
      message: 'Diary entry added successfully'
    });

  } catch (error) {
    console.error('Error adding diary entry:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};
