const { clean, TEACHER_PIN, KEY } = require('../lib/config');
const store = require('../lib/store');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { pin, list } = req.body;
    if (clean(pin) !== TEACHER_PIN) return res.status(403).json({ error: 'Wrong PIN.' });
    const cleaned = (list || []).filter(q => KEY[q]);
    await store.setNotCounted(cleaned);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
