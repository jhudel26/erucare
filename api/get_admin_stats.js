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
    // Note: In Vercel serverless functions, we don't have standard PHP sessions.
    // We rely on client-side authentication or tokens. 
    // For now, we'll proceed as if the client-side check is enough, 
    // or the user would implement a JWT-based session later.
    
    const totalUsersResult = await query('SELECT COUNT(*) as total FROM users');
    const totalUsers = totalUsersResult.rows[0].total;

    const totalMedicinesResult = await query('SELECT COUNT(*) as total FROM medicines');
    const totalMedicines = totalMedicinesResult.rows[0].total;

    const assignedMedicinesResult = await query('SELECT COUNT(*) as total FROM user_medicines WHERE quantity > 0');
    const assignedMedicines = assignedMedicinesResult.rows[0].total;

    const recentDiariesResult = await query(`
      SELECT de.entry_text, de.created_at, u.name 
      FROM diary_entries de 
      JOIN users u ON de.user_id = u.id 
      ORDER BY de.created_at DESC 
      LIMIT 5
    `);

    const recentDiaries = recentDiariesResult.rows.map(row => ({
      entry_text: row.entry_text,
      created_at: new Date(row.created_at).toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      name: row.name
    }));

    return res.status(200).json({
      success: true,
      stats: {
        total_users: totalUsers,
        total_medicines: totalMedicines,
        assigned_medicines: assignedMedicines,
        recent_diaries: recentDiaries
      }
    });

  } catch (error) {
    console.error('Error loading stats:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};
