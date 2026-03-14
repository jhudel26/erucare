const { query } = require('./db_helper');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const result = await query('SELECT id, medicine_name FROM medicines ORDER BY medicine_name');
    return res.status(200).json({ success: true, medicines: result.rows });
  } catch (error) {
    console.error('Error loading medicines:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
