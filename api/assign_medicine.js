const { query } = require('./db_helper');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const { user_id, medicine_id, quantity } = req.body;

    if (!user_id || !medicine_id || !quantity) {
      return res.status(400).json({ success: false, message: 'User ID, Medicine ID, and Quantity are required' });
    }

    const checkResult = await query(
      'SELECT id FROM user_medicines WHERE user_id = $1 AND medicine_id = $2',
      [user_id, medicine_id]
    );

    if (checkResult.rowCount > 0) {
      await query(
        'UPDATE user_medicines SET quantity = quantity + $1 WHERE user_id = $2 AND medicine_id = $3',
        [quantity, user_id, medicine_id]
      );
    } else {
      await query(
        'INSERT INTO user_medicines (user_id, medicine_id, quantity) VALUES ($1, $2, $3)',
        [user_id, medicine_id, quantity]
      );
    }

    return res.status(200).json({ success: true, message: 'Medicine assigned successfully' });
  } catch (error) {
    console.error('Error assigning medicine:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
