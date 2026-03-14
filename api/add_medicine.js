const { query } = require('./db_helper');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const { medicine_name } = req.body;

    if (!medicine_name) {
      return res.status(400).json({ success: false, message: 'Medicine name is required' });
    }

    try {
      await query('INSERT INTO medicines (medicine_name) VALUES ($1)', [medicine_name]);
      return res.status(201).json({ success: true, message: 'Medicine added successfully' });
    } catch (dbError) {
      if (dbError.code === '23505') { // Postgres unique constraint violation
        return res.status(409).json({ success: false, message: 'Medicine already exists' });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error adding medicine:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
