const { clean, TEACHER_PIN } = require('../lib/config');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { pin } = req.body;
  if (clean(pin) !== TEACHER_PIN) return res.status(403).json({ error: 'Wrong PIN.' });
  res.json({ ok: true });
};
