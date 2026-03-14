const { query } = require('./db_helper');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const { entry_id, user_id } = req.body;

    if (!entry_id || !user_id) {
      return res.status(400).json({ success: false, message: 'Entry ID and User ID are required' });
    }

    const result = await query(
      'DELETE FROM diary_entries WHERE id = $1 AND user_id = $2',
      [entry_id, user_id]
    );

    if (result.rowCount > 0) {
      return res.status(200).json({ success: true, message: 'Diary entry deleted successfully' });
    } else {
      return res.status(404).json({ success: false, message: 'Diary entry not found' });
    }
  } catch (error) {
    console.error('Error deleting diary entry:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
