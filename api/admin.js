module.exports = async function handler(req, res) {
  let query;
  try {
    const db = require('./db_helper');
    query = db.query;
  } catch (e) {
    return res.status(500).json({ success: false, message: 'DB load error: ' + e.message });
  }

  let bcrypt;
  try {
    bcrypt = require('bcryptjs');
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Bcrypt load error: ' + e.message });
  }

  const crypto = require('crypto');

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = req.query.action || (req.body && req.body.action);

    switch (action) {
      case 'get_stats':
        const [uRes, mRes, amRes, dRes] = await Promise.all([
          query('SELECT COUNT(*) as total FROM users'),
          query('SELECT COUNT(*) as total FROM medicines'),
          query('SELECT COUNT(*) as total FROM user_medicines WHERE quantity > 0'),
          query('SELECT de.entry_text, de.created_at, u.name FROM diary_entries de JOIN users u ON de.user_id = u.id ORDER BY de.created_at DESC LIMIT 5')
        ]);
        return res.status(200).json({
          success: true,
          stats: {
            total_users: uRes.rows[0].total,
            total_medicines: mRes.rows[0].total,
            assigned_medicines: amRes.rows[0].total,
            recent_diaries: dRes.rows.map(row => ({
              entry_text: row.entry_text,
              created_at: new Date(row.created_at).toLocaleString(),
              name: row.name
            }))
          }
        });

      case 'get_users':
        const usersResult = await query('SELECT id, name, username, role FROM users ORDER BY name');
        return res.status(200).json({ success: true, users: usersResult.rows });

      case 'add_user':
        const { name, username, password, role } = req.body || {};
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        try {
          await query('INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)', [name, username, hash, role]);
          return res.status(201).json({ success: true, message: 'User created' });
        } catch (e) {
          if (e.errno === 1062) return res.status(409).json({ success: false, message: 'Username exists' });
          throw e;
        }

      case 'get_medicines':
        const medsResult = await query('SELECT id, medicine_name FROM medicines ORDER BY medicine_name');
        return res.status(200).json({ success: true, medicines: medsResult.rows });

      case 'add_medicine':
        const { medicine_name } = req.body || {};
        try {
          await query('INSERT INTO medicines (medicine_name) VALUES (?)', [medicine_name]);
          return res.status(201).json({ success: true, message: 'Medicine added' });
        } catch (e) {
          if (e.errno === 1062) return res.status(409).json({ success: false, message: 'Medicine exists' });
          throw e;
        }

      case 'assign_medicine':
        const { user_id, medicine_id, quantity } = req.body || {};
        const check = await query('SELECT id FROM user_medicines WHERE user_id = ? AND medicine_id = ?', [user_id, medicine_id]);
        if (check.rowCount > 0) {
          await query('UPDATE user_medicines SET quantity = quantity + ? WHERE user_id = ? AND medicine_id = ?', [quantity, user_id, medicine_id]);
        } else {
          await query('INSERT INTO user_medicines (user_id, medicine_id, quantity) VALUES (?, ?, ?)', [user_id, medicine_id, quantity]);
        }
        return res.status(200).json({ success: true, message: 'Medicine assigned' });

      case 'get_all_diary':
        const { limit = 50 } = req.query;
        const allDiaryResult = await query('SELECT de.id, de.entry_text, de.created_at, u.name, u.username FROM diary_entries de JOIN users u ON de.user_id = u.id ORDER BY de.created_at DESC LIMIT ?', [parseInt(limit)]);
        return res.status(200).json({ success: true, entries: allDiaryResult.rows.map(row => ({
          ...row, created_at: new Date(row.created_at).toLocaleString()
        })) });

      case 'delete_diary':
        const { entry_id } = req.body || {};
        const delResult = await query('DELETE FROM diary_entries WHERE id = ?', [entry_id]);
        return res.status(delResult.rowCount > 0 ? 200 : 404).json({ success: delResult.rowCount > 0, message: delResult.rowCount > 0 ? 'Deleted' : 'Not found' });

      default:
        return res.status(404).json({ success: false, message: 'Invalid admin action: ' + action });
    }
  } catch (error) {
    console.error('Admin Handler Error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
  }
};
