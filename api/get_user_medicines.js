const { query } = require('./db_helper');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const result = await query(`
      SELECT um.id, um.quantity, m.medicine_name 
      FROM user_medicines um 
      JOIN medicines m ON um.medicine_id = m.id 
      WHERE um.user_id = $1 AND um.quantity > 0 
      ORDER BY m.medicine_name
    `, [user_id]);

    return res.status(200).json({ success: true, medicines: result.rows });
  } catch (error) {
    console.error('Error loading user medicines:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
