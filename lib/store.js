/**
 * Storage layer — uses Vercel KV (Upstash Redis) when KV_REST_API_URL is set,
 * otherwise falls back to an in-memory Map (data is lost on cold starts).
 *
 * To enable persistent storage:
 *   1. Go to your Vercel project → Storage → Create → KV (Upstash)
 *   2. Connect it to the project — the env vars are set automatically
 *   3. Redeploy
 */

let kv = null;

async function getKV() {
  if (kv) return kv;
  if (process.env.KV_REST_API_URL) {
    const { kv: kvStore } = require('@vercel/kv');
    kv = kvStore;
    return kv;
  }
  return null;
}

// ---------- In-memory fallback ----------
const mem = {
  progress: new Map(),   // key → { name, cls, answers, savedAt }
  submissions: [],       // [ { time, name, cls, attempt, answers, startedAt, sid } ]
  notCounted: [],        // [ qid, ... ]
  sidCache: new Map()    // sid → result JSON
};

// ---------- Progress ----------

async function saveProgress(key, data) {
  const db = await getKV();
  if (db) {
    await db.set('p:' + key, JSON.stringify(data), { ex: 86400 });
  } else {
    mem.progress.set(key, data);
  }
}

async function loadProgress(key) {
  const db = await getKV();
  if (db) {
    const raw = await db.get('p:' + key);
    if (!raw) return null;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  }
  return mem.progress.get(key) || null;
}

async function deleteProgress(key) {
  const db = await getKV();
  if (db) {
    await db.del('p:' + key);
  } else {
    mem.progress.delete(key);
  }
}

async function getAllProgress() {
  const db = await getKV();
  const result = {};
  if (db) {
    let cursor = '0';
    do {
      const [next, keys] = await db.scan(cursor, { match: 'p:*', count: 100 });
      cursor = String(next);
      for (const k of keys) {
        const raw = await db.get(k);
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (data) result[k.slice(2)] = data;
      }
    } while (cursor !== '0');
  } else {
    for (const [k, v] of mem.progress) result[k] = v;
  }
  return result;
}

// ---------- Submissions ----------

async function addSubmission(sub) {
  const db = await getKV();
  if (db) {
    // Store submissions as a list in a single key
    const raw = await db.get('submissions');
    const list = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    list.push(sub);
    await db.set('submissions', JSON.stringify(list));
  } else {
    mem.submissions.push(sub);
  }
}

async function getSubmissions() {
  const db = await getKV();
  if (db) {
    const raw = await db.get('submissions');
    if (!raw) return [];
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  }
  return mem.submissions;
}

// ---------- SID cache (deduplication) ----------

async function getSid(sid) {
  const db = await getKV();
  if (db) {
    const raw = await db.get('sid:' + sid);
    if (!raw) return null;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  }
  return mem.sidCache.get(sid) || null;
}

async function setSid(sid, data) {
  const db = await getKV();
  if (db) {
    await db.set('sid:' + sid, JSON.stringify(data), { ex: 86400 });
  } else {
    mem.sidCache.set(sid, data);
  }
}

// ---------- Not-counted list ----------

async function getNotCounted() {
  const db = await getKV();
  if (db) {
    const raw = await db.get('notCounted');
    if (!raw) return [];
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  }
  return mem.notCounted;
}

async function setNotCounted(list) {
  const db = await getKV();
  if (db) {
    await db.set('notCounted', JSON.stringify(list));
  } else {
    mem.notCounted = list;
  }
}

module.exports = {
  saveProgress, loadProgress, deleteProgress, getAllProgress,
  addSubmission, getSubmissions,
  getSid, setSid,
  getNotCounted, setNotCounted
};
