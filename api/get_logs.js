const { query } = require('./db_helper');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const { user_id, limit = 10 } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const result = await query(`
      SELECT ml.taken_at, m.medicine_name 
      FROM medicine_logs ml 
      JOIN medicines m ON ml.medicine_id = m.id 
      WHERE ml.user_id = $1 
      ORDER BY ml.taken_at DESC 
      LIMIT $2
    `, [user_id, parseInt(limit)]);

    const logs = result.rows.map(row => {
      const takenAt = new Date(row.taken_at);
      return {
        medicine_name: row.medicine_name,
        date: takenAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: takenAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      };
    });

    return res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error('Error loading medicine logs:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
