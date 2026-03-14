const { getClient, query } = require('./db_helper');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const client = await getClient();
  try {
    const { user_medicine_id, user_id } = req.body;

    if (!user_medicine_id || !user_id) {
      return res.status(400).json({ success: false, message: 'User medicine ID and User ID are required' });
    }

    await client.query('BEGIN');

    const checkResult = await client.query(`
      SELECT um.quantity, m.medicine_name, um.medicine_id
      FROM user_medicines um 
      JOIN medicines m ON um.medicine_id = m.id 
      WHERE um.id = $1 AND um.user_id = $2
    `, [user_medicine_id, user_id]);

    if (checkResult.rowCount === 0) {
      throw new Error('Medicine not found');
    }

    const medicineData = checkResult.rows[0];

    if (medicineData.quantity <= 0) {
      throw new Error('No medicine remaining');
    }

    await client.query(
      'UPDATE user_medicines SET quantity = quantity - 1 WHERE id = $1 AND user_id = $2',
      [user_medicine_id, user_id]
    );

    await client.query(
      'INSERT INTO medicine_logs (user_id, medicine_id, taken_at) VALUES ($1, $2, NOW())',
      [user_id, medicineData.medicine_id]
    );

    const diaryText = `Took ${medicineData.medicine_name}`;
    await client.query(
      'INSERT INTO diary_entries (user_id, entry_text, created_at) VALUES ($1, $2, NOW())',
      [user_id, diaryText]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Medicine taken successfully',
      diary_entry: diaryText
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error taking medicine:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  } finally {
    await client.end();
  }
};
