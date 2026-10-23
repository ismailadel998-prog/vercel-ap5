const { clean, studentKey, markAll, QIDS, DISPLAY, displayFromKey, mmss, givenText, writtenText } = require('../lib/config');
const store = require('../lib/store');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { name, cls, answers, startedAt, sid } = req.body;
    if (!clean(name)) return res.status(400).json({ error: 'Please choose your name before submitting.' });
    const now = new Date();

    // Deduplicate by sid
    if (sid) {
      const prev = await store.getSid(sid);
      if (prev) return res.json(prev);
    }

    const marks = markAll(answers);
    const off = await store.getNotCounted();
    const results = {};
    let score = 0, total = 0;
    QIDS.forEach(q => {
      const counted = off.indexOf(q) < 0;
      if (counted) { total++; if (marks[q].right) score++; }
      results[q] = counted
        ? { counted: true, right: marks[q].right, blank: marks[q].blank, parts: marks[q].parts, display: DISPLAY[q] || null }
        : { counted: false };
    });
    // Reveal correct answers for counted questions students got wrong
    QIDS.forEach(q => {
      if (results[q].counted && !results[q].right && !DISPLAY[q]) results[q].display = displayFromKey(q);
    });

    let taken = '';
    if (startedAt) {
      const sec = (now - new Date(startedAt)) / 1000;
      if (sec > 0 && sec < 6 * 3600) taken = mmss(sec);
    }

    // Count attempt and finish position
    const subs = await store.getSubmissions();
    const key = studentKey(name, cls);
    let attempt = 1, finishPosition = null;
    const finishedBefore = {};
    subs.forEach(s => {
      const k = studentKey(s.name, s.cls);
      if (k === key) attempt++;
      else if (clean(s.cls).toLowerCase() === clean(cls).toLowerCase()) finishedBefore[k] = true;
    });
    if (attempt === 1) finishPosition = Object.keys(finishedBefore).length + 1;

    await store.addSubmission({
      time: now.toISOString(), name: clean(name), cls: clean(cls),
      attempt, answers: answers || {}, taken, sid
    });

    const out = { score, total, attempt, finishPosition, results, submittedAt: now.toISOString() };

    if (sid) await store.setSid(sid, out);
    await store.deleteProgress(key);

    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
