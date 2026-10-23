const { clean, TEACHER_PIN, QIDS, KEY, DEFAULT_ROSTER, lessonOf, studentKey, markAll, givenText, countAnswered } = require('../lib/config');
const store = require('../lib/store');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { pin } = req.body;
    if (clean(pin) !== TEACHER_PIN) return res.status(403).json({ error: 'Wrong PIN.' });

    // Roster
    const roster = [];
    Object.keys(DEFAULT_ROSTER).forEach(cls => {
      DEFAULT_ROSTER[cls].forEach(name => roster.push({ cls, name }));
    });

    // Submissions — re-mark with current key
    const rawSubs = await store.getSubmissions();
    const subs = rawSubs.map(s => {
      const marks = markAll(s.answers);
      const m = {}, given = {};
      QIDS.forEach(q => {
        m[q] = marks[q].blank ? 'blank' : (marks[q].right ? 'ok' : 'bad');
        if (m[q] === 'bad') given[q] = givenText(q, s.answers[q]);
      });
      return {
        time: s.time, name: s.name, cls: s.cls, attempt: s.attempt,
        taken: s.taken || '', marks: m, given,
        written: ''  // written text is in the answers
      };
    });

    // Progress
    const allProgress = await store.getAllProgress();
    const progress = {};
    Object.keys(allProgress).forEach(k => {
      const p = allProgress[k];
      progress[k] = { savedAt: p.savedAt, answered: countAnswered(p.answers || {}) };
    });

    res.json({
      questions: QIDS.map(q => ({ id: q, lesson: lessonOf(q), n: q.split('-')[1] })),
      notCounted: await store.getNotCounted(),
      roster, submissions: subs, progress,
      generatedAt: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
