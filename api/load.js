const { clean, studentKey } = require('../lib/config');
const store = require('../lib/store');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { name, cls } = req.body;
    if (!clean(name)) return res.json(null);
    const key = studentKey(name, cls);
    const data = await store.loadProgress(key);
    if (!data) return res.json(null);
    res.json({ answers: data.answers, savedAt: data.savedAt });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
