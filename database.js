const fs = require('fs');
const path = require('path');
const ADMIN_EMAIL = 'samperet@gmail.com';

// ─── Postgres (production) ────────────────────────────────────────────────────

let pool = null;

if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      lesson_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      response_text TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, lesson_id, question_id)
    );
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      lesson_id TEXT NOT NULL,
      completed_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, lesson_id)
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
  `)
    .then(() => pool.query('UPDATE users SET is_admin = TRUE WHERE LOWER(email) = LOWER($1)', [ADMIN_EMAIL]))
    .catch(err => console.error('DB init error:', err));
}

// ─── JSON fallback (local dev) ────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
let local = { users: [], responses: {}, progress: {} };

if (!pool) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  try { local = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch {}
  if (!Array.isArray(local.users)) local.users = [];
  let changed = false;
  local.users = local.users.map(user => {
    const normalized = {
      ...user,
      isAdmin: user.email?.toLowerCase() === ADMIN_EMAIL || !!user.isAdmin,
    };
    if (normalized.isAdmin !== user.isAdmin) changed = true;
    return normalized;
  });
  if (changed) saveLocal();
}

function saveLocal() {
  fs.writeFileSync(DB_FILE, JSON.stringify(local, null, 2));
}

function normalizeUser(row) {
  if (!row) return null;
  return {
    ...row,
    passwordHash: row.password_hash ?? row.passwordHash,
    isAdmin: row.is_admin ?? row.isAdmin ?? false,
    createdAt: row.created_at ?? row.createdAt ?? null,
  };
}

// ─── Users ────────────────────────────────────────────────────────────────────

async function findUserByEmail(email) {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return normalizeUser(rows[0]);
  }
  return normalizeUser(local.users.find(u => u.email === email) || null);
}

async function findUserById(id) {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return normalizeUser(rows[0]);
  }
  return normalizeUser(local.users.find(u => String(u.id) === String(id)) || null);
}

async function createUser(name, email, passwordHash) {
  const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
  if (pool) {
    try {
      const { rows } = await pool.query(
        'INSERT INTO users (name, email, password_hash, is_admin) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, passwordHash, isAdmin]
      );
      return normalizeUser(rows[0]);
    } catch (err) {
      if (err.code === '23505') throw Object.assign(new Error('Email already registered'), { code: 'DUPLICATE' });
      throw err;
    }
  }
  if (local.users.find(u => u.email === email)) {
    throw Object.assign(new Error('Email already registered'), { code: 'DUPLICATE' });
  }
  const user = { id: Date.now(), name, email, passwordHash, isAdmin, createdAt: new Date().toISOString() };
  local.users.push(user);
  saveLocal();
  return normalizeUser(user);
}

async function listUsers() {
  if (pool) {
    const { rows } = await pool.query(`
      SELECT id, name, email, is_admin, created_at
      FROM users
      ORDER BY LOWER(name), LOWER(email)
    `);
    return rows.map(normalizeUser);
  }
  return [...local.users]
    .map(normalizeUser)
    .sort((a, b) => `${a.name} ${a.email}`.localeCompare(`${b.name} ${b.email}`));
}

async function setUserPassword(userId, passwordHash) {
  if (pool) {
    const { rowCount } = await pool.query(
      'UPDATE users SET password_hash = $2 WHERE id = $1',
      [userId, passwordHash]
    );
    return rowCount > 0;
  }
  const user = local.users.find(u => String(u.id) === String(userId));
  if (!user) return false;
  user.passwordHash = passwordHash;
  saveLocal();
  return true;
}

// ─── Responses ────────────────────────────────────────────────────────────────

async function getResponses(userId, lessonId) {
  if (pool) {
    const { rows } = await pool.query(
      'SELECT question_id, response_text FROM responses WHERE user_id = $1 AND lesson_id = $2',
      [userId, lessonId]
    );
    const out = {};
    rows.forEach(r => { out[r.question_id] = r.response_text; });
    return out;
  }
  return local.responses[userId]?.[lessonId] || {};
}

async function setResponse(userId, lessonId, questionId, text) {
  if (pool) {
    await pool.query(`
      INSERT INTO responses (user_id, lesson_id, question_id, response_text, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, lesson_id, question_id)
      DO UPDATE SET response_text = $4, updated_at = NOW()
    `, [userId, lessonId, questionId, text]);
    return;
  }
  if (!local.responses[userId]) local.responses[userId] = {};
  if (!local.responses[userId][lessonId]) local.responses[userId][lessonId] = {};
  local.responses[userId][lessonId][questionId] = text;
  saveLocal();
}

// ─── Progress ─────────────────────────────────────────────────────────────────

async function getProgress(userId) {
  if (pool) {
    const { rows } = await pool.query(
      'SELECT lesson_id FROM lesson_progress WHERE user_id = $1',
      [userId]
    );
    return rows.map(r => r.lesson_id);
  }
  return Object.keys(local.progress[userId] || {});
}

async function markComplete(userId, lessonId) {
  if (pool) {
    await pool.query(`
      INSERT INTO lesson_progress (user_id, lesson_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, lesson_id) DO NOTHING
    `, [userId, lessonId]);
    return;
  }
  if (!local.progress[userId]) local.progress[userId] = {};
  local.progress[userId][lessonId] = new Date().toISOString();
  saveLocal();
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  listUsers,
  setUserPassword,
  getResponses,
  setResponse,
  getProgress,
  markComplete,
};
