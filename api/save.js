const { clean, studentKey } = require('../lib/config');
const store = require('../lib/store');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { name, cls, answers, auto } = req.body;
    if (!clean(name)) return res.status(400).json({ error: 'Please choose your name first.' });
    const key = studentKey(name, cls);
    const savedAt = new Date().toISOString();
    await store.saveProgress(key, { name: clean(name), cls: clean(cls), answers: answers || {}, savedAt });
    res.json({ savedAt });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
