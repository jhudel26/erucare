const { query } = require('./db_helper');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { user_id, limit = 20 } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const result = await query(`
      SELECT de.id, de.entry_text, de.created_at, u.name 
      FROM diary_entries de 
      JOIN users u ON de.user_id = u.id 
      WHERE de.user_id = $1 
      ORDER BY de.created_at DESC 
      LIMIT $2
    `, [user_id, parseInt(limit)]);

    const entries = result.rows.map(row => {
      const createdAt = new Date(row.created_at);
      return {
        id: row.id,
        entry_text: row.entry_text,
        date: createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        name: row.name
      };
    });

    return res.status(200).json({
      success: true,
      entries: entries
    });

  } catch (error) {
    console.error('Error loading diary entries:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};
