const { getClient, query } = require('./db_helper');

module.exports = async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = req.query.action || (req.body && req.body.action);

    switch (action) {
      case 'get_diary': return await handleGetDiary(req, res);
      case 'add_diary': return await handleAddDiary(req, res);
      case 'delete_diary': return await handleDeleteDiary(req, res);
      case 'get_medicines': return await handleGetMedicines(req, res);
      case 'take_medicine': return await handleTakeMedicine(req, res);
      case 'get_logs': return await handleGetLogs(req, res);
      default: return res.status(404).json({ success: false, message: 'Invalid user action: ' + action });
    }
  } catch (error) {
    console.error('Global user handler error:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

async function handleGetDiary(req, res) {
  const { user_id, limit = 20 } = req.query;
  if (!user_id) return res.status(400).json({ success: false, message: 'User ID required' });
  const result = await query('SELECT de.id, de.entry_text, de.created_at, u.name FROM diary_entries de JOIN users u ON de.user_id = u.id WHERE de.user_id = ? ORDER BY de.created_at DESC LIMIT ?', [user_id, parseInt(limit)]);
  return res.status(200).json({ success: true, entries: result.rows.map(row => {
    const d = new Date(row.created_at);
    return { ...row, date: d.toLocaleDateString(), time: d.toLocaleTimeString() };
  }) });
}

async function handleAddDiary(req, res) {
  const { user_id, entry_text } = req.body || {};
  if (!user_id || !entry_text) return res.status(400).json({ success: false, message: 'User ID and text required' });
  await query('INSERT INTO diary_entries (user_id, entry_text, created_at) VALUES (?, ?, NOW())', [user_id, entry_text]);
  return res.status(201).json({ success: true, message: 'Diary entry added' });
}

async function handleDeleteDiary(req, res) {
  const { entry_id, user_id } = req.body || {};
  if (!entry_id || !user_id) return res.status(400).json({ success: false, message: 'Entry ID and User ID required' });
  const result = await query('DELETE FROM diary_entries WHERE id = ? AND user_id = ?', [entry_id, user_id]);
  return res.status(result.rowCount > 0 ? 200 : 404).json({ success: result.rowCount > 0, message: result.rowCount > 0 ? 'Deleted' : 'Not found' });
}

async function handleGetMedicines(req, res) {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ success: false, message: 'User ID required' });
  const result = await query('SELECT um.id, um.quantity, m.medicine_name FROM user_medicines um JOIN medicines m ON um.medicine_id = m.id WHERE um.user_id = ? AND um.quantity > 0 ORDER BY m.medicine_name', [user_id]);
  return res.status(200).json({ success: true, medicines: result.rows });
}

async function handleTakeMedicine(req, res) {
  const { user_medicine_id, user_id } = req.body || {};
  if (!user_medicine_id || !user_id) return res.status(400).json({ success: false, message: 'IDs required' });
  
  const client = await getClient();
  try {
    await client.beginTransaction();
    const [rows] = await client.execute('SELECT um.quantity, m.medicine_name, um.medicine_id FROM user_medicines um JOIN medicines m ON um.medicine_id = m.id WHERE um.id = ? AND um.user_id = ?', [user_medicine_id, user_id]);
    if (rows.length === 0 || rows[0].quantity <= 0) throw new Error('Invalid medicine or no quantity');
    const med = rows[0];
    await client.execute('UPDATE user_medicines SET quantity = quantity - 1 WHERE id = ?', [user_medicine_id]);
    await client.execute('INSERT INTO medicine_logs (user_id, medicine_id, taken_at) VALUES (?, ?, NOW())', [user_id, med.medicine_id]);
    await client.execute('INSERT INTO diary_entries (user_id, entry_text, created_at) VALUES (?, ?, NOW())', [user_id, `Took ${med.medicine_name}`]);
    await client.commit();
    return res.status(200).json({ success: true, message: 'Taken' });
  } catch (e) {
    await client.rollback();
    return res.status(400).json({ success: false, message: e.message });
  } finally {
    client.release();
  }
}

async function handleGetLogs(req, res) {
  const { user_id, limit = 10 } = req.query;
  if (!user_id) return res.status(400).json({ success: false, message: 'User ID required' });
  const result = await query('SELECT ml.taken_at, m.medicine_name FROM medicine_logs ml JOIN medicines m ON ml.medicine_id = m.id WHERE ml.user_id = ? ORDER BY ml.taken_at DESC LIMIT ?', [user_id, parseInt(limit)]);
  return res.status(200).json({ success: true, logs: result.rows.map(row => {
    const d = new Date(row.taken_at);
    return { ...row, date: d.toLocaleDateString(), time: d.toLocaleTimeString() };
  }) });
}
