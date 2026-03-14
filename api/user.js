module.exports = async function handler(req, res) {
  let getClient, query;
  try {
    const db = require('./db_helper');
    getClient = db.getClient;
    query = db.query;
  } catch (e) {
    return res.status(500).json({ success: false, message: 'DB load error: ' + e.message });
  }

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = req.query.action || (req.body && req.body.action);

    switch (action) {
      case 'get_diary':
        const { user_id: uid, limit = 20 } = req.query;
        if (!uid) return res.status(400).json({ success: false, message: 'User ID required' });
        const diaryResult = await query('SELECT de.id, de.entry_text, de.created_at, u.name FROM diary_entries de JOIN users u ON de.user_id = u.id WHERE de.user_id = ? ORDER BY de.created_at DESC LIMIT ?', [uid, parseInt(limit)]);
        return res.status(200).json({ success: true, entries: diaryResult.rows.map(row => {
          const d = new Date(row.created_at);
          return { ...row, date: d.toLocaleDateString(), time: d.toLocaleTimeString() };
        }) });

      case 'add_diary':
        const { user_id: add_uid, entry_text } = req.body || {};
        if (!add_uid || !entry_text) return res.status(400).json({ success: false, message: 'User ID and text required' });
        await query('INSERT INTO diary_entries (user_id, entry_text, created_at) VALUES (?, ?, NOW())', [add_uid, entry_text]);
        return res.status(201).json({ success: true, message: 'Diary entry added' });

      case 'delete_diary':
        const { entry_id, user_id: del_uid } = req.body || {};
        if (!entry_id || !del_uid) return res.status(400).json({ success: false, message: 'Entry ID and User ID required' });
        const delResult = await query('DELETE FROM diary_entries WHERE id = ? AND user_id = ?', [entry_id, del_uid]);
        return res.status(delResult.rowCount > 0 ? 200 : 404).json({ success: delResult.rowCount > 0, message: delResult.rowCount > 0 ? 'Deleted' : 'Not found' });

      case 'get_medicines':
        const { user_id: med_uid } = req.query;
        if (!med_uid) return res.status(400).json({ success: false, message: 'User ID required' });
        const medsResult = await query('SELECT um.id, um.quantity, m.medicine_name FROM user_medicines um JOIN medicines m ON um.medicine_id = m.id WHERE um.user_id = ? AND um.quantity > 0 ORDER BY m.medicine_name', [med_uid]);
        return res.status(200).json({ success: true, medicines: medsResult.rows });

      case 'take_medicine':
        const { user_medicine_id, user_id: take_uid } = req.body || {};
        if (!user_medicine_id || !take_uid) return res.status(400).json({ success: false, message: 'IDs required' });
        const client = await getClient();
        try {
          await client.beginTransaction();
          const [rows] = await client.execute('SELECT um.quantity, m.medicine_name, um.medicine_id FROM user_medicines um JOIN medicines m ON um.medicine_id = m.id WHERE um.id = ? AND um.user_id = ?', [user_medicine_id, take_uid]);
          if (rows.length === 0 || rows[0].quantity <= 0) throw new Error('Invalid medicine or no quantity');
          const med = rows[0];
          await client.execute('UPDATE user_medicines SET quantity = quantity - 1 WHERE id = ?', [user_medicine_id]);
          await client.execute('INSERT INTO medicine_logs (user_id, medicine_id, taken_at) VALUES (?, ?, NOW())', [take_uid, med.medicine_id]);
          await client.execute('INSERT INTO diary_entries (user_id, entry_text, created_at) VALUES (?, ?, NOW())', [take_uid, `Took ${med.medicine_name}`]);
          await client.commit();
          return res.status(200).json({ success: true, message: 'Taken' });
        } catch (e) {
          await client.rollback();
          return res.status(400).json({ success: false, message: e.message });
        } finally {
          client.release();
        }

      case 'get_logs':
        const { user_id: logs_uid, limit: logs_limit = 10 } = req.query;
        if (!logs_uid) return res.status(400).json({ success: false, message: 'User ID required' });
        const logsResult = await query('SELECT ml.taken_at, m.medicine_name FROM medicine_logs ml JOIN medicines m ON ml.medicine_id = m.id WHERE ml.user_id = ? ORDER BY ml.taken_at DESC LIMIT ?', [logs_uid, parseInt(logs_limit)]);
        return res.status(200).json({ success: true, logs: logsResult.rows.map(row => {
          const d = new Date(row.taken_at);
          return { ...row, date: d.toLocaleDateString(), time: d.toLocaleTimeString() };
        }) });

      default:
        return res.status(404).json({ success: false, message: 'Invalid user action: ' + action });
    }
  } catch (error) {
    console.error('User Handler Error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
  }
};
