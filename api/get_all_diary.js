const { query } = require('./db_helper');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const { limit = 50 } = req.query;

    const result = await query(`
      SELECT de.id, de.entry_text, de.created_at, u.name, u.username 
      FROM diary_entries de 
      JOIN users u ON de.user_id = u.id 
      ORDER BY de.created_at DESC 
      LIMIT $1
    `, [parseInt(limit)]);

    const entries = result.rows.map(row => ({
      id: row.id,
      entry_text: row.entry_text,
      created_at: new Date(row.created_at).toLocaleString('en-US', {
        month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
      }),
      name: row.name,
      username: row.username
    }));

    return res.status(200).json({ success: true, entries });
  } catch (error) {
    console.error('Error loading all diaries:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
