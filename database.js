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
      is_facilitator BOOLEAN NOT NULL DEFAULT FALSE,
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
    CREATE TABLE IF NOT EXISTS cohorts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      module_number INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      meeting_day TEXT NOT NULL,
      meeting_time TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'America/New_York',
      sessions JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS sessions JSONB NOT NULL DEFAULT '[]'::jsonb;
    CREATE TABLE IF NOT EXISTS cohort_members (
      id SERIAL PRIMARY KEY,
      cohort_id INTEGER REFERENCES cohorts(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('facilitator', 'participant')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(cohort_id, user_id, role)
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_facilitator BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;
  `)
    .then(() => pool.query('UPDATE users SET is_admin = TRUE WHERE LOWER(email) = LOWER($1)', [ADMIN_EMAIL]))
    .then(() => pool.query(`
      UPDATE users
      SET is_facilitator = TRUE
      WHERE id IN (
        SELECT user_id FROM cohort_members WHERE role = 'facilitator'
      )
    `))
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
  if (!Array.isArray(local.cohorts)) local.cohorts = [];
  if (!Array.isArray(local.cohortMembers)) local.cohortMembers = [];
  let changed = false;
  local.users = local.users.map(user => {
    const isExistingCohortFacilitator = local.cohortMembers.some(member =>
      member.role === 'facilitator' && String(member.userId) === String(user.id)
    );
    const normalized = {
      ...user,
      isAdmin: user.email?.toLowerCase() === ADMIN_EMAIL || !!user.isAdmin,
      isFacilitator: !!user.isFacilitator || isExistingCohortFacilitator,
    };
    if (normalized.isAdmin !== user.isAdmin || normalized.isFacilitator !== user.isFacilitator) changed = true;
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
    isFacilitator: row.is_facilitator ?? row.isFacilitator ?? false,
    avatarUrl: row.avatar_url ?? row.avatarUrl ?? null,
    bio: row.bio ?? null,
    createdAt: row.created_at ?? row.createdAt ?? null,
  };
}

function normalizeCohort(row, members = []) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    moduleNumber: row.module_number ?? row.moduleNumber,
    startDate: row.start_date ?? row.startDate,
    endDate: row.end_date ?? row.endDate,
    meetingDay: row.meeting_day ?? row.meetingDay,
    meetingTime: row.meeting_time ?? row.meetingTime,
    timezone: row.timezone || 'America/New_York',
    sessions: Array.isArray(row.sessions) ? row.sessions : JSON.parse(row.sessions || '[]'),
    createdAt: row.created_at ?? row.createdAt ?? null,
    facilitators: members.filter(m => m.role === 'facilitator').map(m => m.user),
    participants: members.filter(m => m.role === 'participant').map(m => m.user),
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
  const isFacilitator = false;
  if (pool) {
    try {
      const { rows } = await pool.query(
        'INSERT INTO users (name, email, password_hash, is_admin, is_facilitator) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, email, passwordHash, isAdmin, isFacilitator]
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
  const user = { id: Date.now(), name, email, passwordHash, isAdmin, isFacilitator, createdAt: new Date().toISOString() };
  local.users.push(user);
  saveLocal();
  return normalizeUser(user);
}

async function listUsers() {
  if (pool) {
    const { rows } = await pool.query(`
      SELECT id, name, email, is_admin, is_facilitator, created_at
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

async function setUserAdmin(userId, isAdmin = true) {
  if (pool) {
    const { rowCount } = await pool.query(
      'UPDATE users SET is_admin = $2 WHERE id = $1',
      [userId, !!isAdmin]
    );
    return rowCount > 0;
  }
  const user = local.users.find(u => String(u.id) === String(userId));
  if (!user) return false;
  user.isAdmin = !!isAdmin;
  saveLocal();
  return true;
}

async function setUserFacilitator(userId, isFacilitator = true) {
  if (pool) {
    const { rowCount } = await pool.query(
      'UPDATE users SET is_facilitator = $2 WHERE id = $1',
      [userId, !!isFacilitator]
    );
    return rowCount > 0;
  }
  const user = local.users.find(u => String(u.id) === String(userId));
  if (!user) return false;
  user.isFacilitator = !!isFacilitator;
  saveLocal();
  return true;
}

async function updateProfile(userId, { bio, avatarUrl }) {
  if (pool) {
    const sets = [];
    const vals = [userId];
    let i = 2;
    if (bio !== undefined) { sets.push(`bio = $${i++}`); vals.push(bio); }
    if (avatarUrl !== undefined) { sets.push(`avatar_url = $${i++}`); vals.push(avatarUrl); }
    if (!sets.length) return findUserById(userId);
    await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $1`, vals);
    return findUserById(userId);
  }
  const user = local.users.find(u => String(u.id) === String(userId));
  if (!user) return null;
  if (bio !== undefined) user.bio = bio;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  saveLocal();
  return normalizeUser(user);
}

// Returns an array of module numbers the user has fully completed.
// A module is complete when the user has finished every non-companion lesson.
async function getCompletedModules(userId, allLessons) {
  const completed = new Set(await getProgress(userId));
  const mods = [];
  for (const modNum of [1, 2, 3, 4]) {
    const modLessons = allLessons.filter(l => Number(l.moduleNumber) === modNum && !l.isCompanion);
    if (modLessons.length > 0 && modLessons.every(l => completed.has(l.id))) {
      mods.push(modNum);
    }
  }
  return mods;
}

async function deleteUser(userId) {
  if (pool) {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    return rowCount > 0;
  }
  const idx = local.users.findIndex(u => String(u.id) === String(userId));
  if (idx === -1) return false;
  local.users.splice(idx, 1);
  delete (local.responses || {})[String(userId)];
  delete (local.progress  || {})[String(userId)];
  local.cohortMembers = (local.cohortMembers || []).filter(m => String(m.userId) !== String(userId));
  saveLocal();
  return true;
}

// ─── Cohorts ─────────────────────────────────────────────────────────────────

async function getCohortMembers(cohortIds = []) {
  if (cohortIds.length === 0) return {};
  if (pool) {
    const { rows } = await pool.query(`
      SELECT cm.cohort_id, cm.role, u.id, u.name, u.email, u.is_admin, u.is_facilitator, u.avatar_url, u.bio, u.created_at
      FROM cohort_members cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.cohort_id = ANY($1::int[])
      ORDER BY cm.role, LOWER(u.name), LOWER(u.email)
    `, [cohortIds.map(Number)]);
    return rows.reduce((acc, row) => {
      if (!acc[row.cohort_id]) acc[row.cohort_id] = [];
      acc[row.cohort_id].push({ role: row.role, user: normalizeUser(row) });
      return acc;
    }, {});
  }
  return local.cohortMembers.reduce((acc, member) => {
    if (!cohortIds.some(id => String(id) === String(member.cohortId))) return acc;
    const user = normalizeUser(local.users.find(u => String(u.id) === String(member.userId)));
    if (!user) return acc;
    if (!acc[member.cohortId]) acc[member.cohortId] = [];
    acc[member.cohortId].push({ role: member.role, user });
    return acc;
  }, {});
}

async function listCohorts() {
  if (pool) {
    const { rows } = await pool.query(`
      SELECT *
      FROM cohorts
      ORDER BY start_date, module_number, LOWER(name)
    `);
    const members = await getCohortMembers(rows.map(row => row.id));
    return rows.map(row => normalizeCohort(row, members[row.id] || []));
  }
  const cohorts = [...local.cohorts]
    .sort((a, b) => `${a.startDate} ${a.moduleNumber} ${a.name}`.localeCompare(`${b.startDate} ${b.moduleNumber} ${b.name}`));
  const members = await getCohortMembers(cohorts.map(cohort => cohort.id));
  return cohorts.map(cohort => normalizeCohort(cohort, members[cohort.id] || []));
}

async function setCohortMembers(cohortId, facilitatorIds = [], participantIds = []) {
  const roles = [
    ...facilitatorIds.map(userId => ({ userId, role: 'facilitator' })),
    ...participantIds.map(userId => ({ userId, role: 'participant' })),
  ];
  if (pool) {
    await pool.query('DELETE FROM cohort_members WHERE cohort_id = $1', [cohortId]);
    for (const member of roles) {
      await pool.query(`
        INSERT INTO cohort_members (cohort_id, user_id, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (cohort_id, user_id, role) DO NOTHING
      `, [cohortId, member.userId, member.role]);
    }
    return;
  }
  local.cohortMembers = local.cohortMembers.filter(member => String(member.cohortId) !== String(cohortId));
  roles.forEach(member => {
    local.cohortMembers.push({
      id: `${cohortId}:${member.userId}:${member.role}`,
      cohortId,
      userId: member.userId,
      role: member.role,
      createdAt: new Date().toISOString(),
    });
  });
  saveLocal();
}

async function createCohort(data) {
  const sessions = Array.isArray(data.sessions) ? data.sessions : [];
  const cohort = {
    name: data.name,
    moduleNumber: Number(data.moduleNumber),
    startDate: data.startDate,
    endDate: data.endDate,
    meetingDay: data.meetingDay,
    meetingTime: data.meetingTime,
    timezone: data.timezone || 'America/New_York',
    sessions,
  };
  if (pool) {
    const { rows } = await pool.query(`
      INSERT INTO cohorts (name, module_number, start_date, end_date, meeting_day, meeting_time, timezone, sessions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [cohort.name, cohort.moduleNumber, cohort.startDate, cohort.endDate, cohort.meetingDay, cohort.meetingTime, cohort.timezone, JSON.stringify(sessions)]);
    await setCohortMembers(rows[0].id, data.facilitatorIds, data.participantIds);
    return (await listCohorts()).find(item => String(item.id) === String(rows[0].id));
  }
  const created = { ...cohort, id: Date.now(), createdAt: new Date().toISOString() };
  local.cohorts.push(created);
  saveLocal();
  await setCohortMembers(created.id, data.facilitatorIds, data.participantIds);
  return (await listCohorts()).find(item => String(item.id) === String(created.id));
}

async function updateCohort(cohortId, data) {
  const sessions = Array.isArray(data.sessions) ? data.sessions : [];
  if (pool) {
    const { rowCount } = await pool.query(`
      UPDATE cohorts
      SET name = $2, module_number = $3, start_date = $4, end_date = $5,
          meeting_day = $6, meeting_time = $7, timezone = $8, sessions = $9
      WHERE id = $1
    `, [
      cohortId,
      data.name,
      Number(data.moduleNumber),
      data.startDate,
      data.endDate,
      data.meetingDay,
      data.meetingTime,
      data.timezone || 'America/New_York',
      JSON.stringify(sessions),
    ]);
    if (!rowCount) return null;
    await setCohortMembers(cohortId, data.facilitatorIds, data.participantIds);
    return (await listCohorts()).find(item => String(item.id) === String(cohortId)) || null;
  }
  const cohort = local.cohorts.find(item => String(item.id) === String(cohortId));
  if (!cohort) return null;
  Object.assign(cohort, {
    name: data.name,
    moduleNumber: Number(data.moduleNumber),
    startDate: data.startDate,
    endDate: data.endDate,
    meetingDay: data.meetingDay,
    meetingTime: data.meetingTime,
    timezone: data.timezone || 'America/New_York',
    sessions,
  });
  saveLocal();
  await setCohortMembers(cohortId, data.facilitatorIds, data.participantIds);
  return (await listCohorts()).find(item => String(item.id) === String(cohortId)) || null;
}

async function deleteCohort(cohortId) {
  if (pool) {
    await pool.query('DELETE FROM cohort_members WHERE cohort_id = $1', [cohortId]);
    await pool.query('DELETE FROM cohorts WHERE id = $1', [cohortId]);
    return;
  }
  local.cohortMembers = local.cohortMembers.filter(m => String(m.cohortId) !== String(cohortId));
  local.cohorts = local.cohorts.filter(c => String(c.id) !== String(cohortId));
  saveLocal();
}

async function listFacilitatorCohorts(userId) {
  const cohorts = await listCohorts();
  return cohorts.filter(cohort =>
    cohort.facilitators.some(user => String(user.id) === String(userId))
  );
}

async function listParticipantCohorts(userId) {
  const cohorts = await listCohorts();
  return cohorts.filter(cohort =>
    cohort.participants.some(user => String(user.id) === String(userId))
  );
}

// Add a single user to a cohort as a participant. Idempotent — re-joining is a no-op.
async function addCohortParticipant(cohortId, userId) {
  if (pool) {
    await pool.query(`
      INSERT INTO cohort_members (cohort_id, user_id, role)
      VALUES ($1, $2, 'participant')
      ON CONFLICT (cohort_id, user_id, role) DO NOTHING
    `, [cohortId, userId]);
    return (await listCohorts()).find(item => String(item.id) === String(cohortId)) || null;
  }
  const exists = local.cohortMembers.some(member =>
    String(member.cohortId) === String(cohortId) &&
    String(member.userId) === String(userId) &&
    member.role === 'participant'
  );
  if (!exists) {
    local.cohortMembers.push({
      id: `${cohortId}:${userId}:participant`,
      cohortId,
      userId,
      role: 'participant',
      createdAt: new Date().toISOString(),
    });
    saveLocal();
  }
  return (await listCohorts()).find(item => String(item.id) === String(cohortId)) || null;
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

async function getAllResponses(userId) {
  if (pool) {
    const { rows } = await pool.query(
      'SELECT lesson_id, question_id, response_text FROM responses WHERE user_id = $1 ORDER BY updated_at ASC',
      [userId]
    );
    const out = {};
    rows.forEach(r => {
      if (!out[r.lesson_id]) out[r.lesson_id] = {};
      out[r.lesson_id][r.question_id] = r.response_text;
    });
    return out;
  }
  return local.responses[String(userId)] || {};
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
  setUserAdmin,
  setUserFacilitator,
  updateProfile,
  getCompletedModules,
  deleteUser,
  listCohorts,
  createCohort,
  updateCohort,
  deleteCohort,
  listFacilitatorCohorts,
  listParticipantCohorts,
  addCohortParticipant,
  getResponses,
  setResponse,
  getAllResponses,
  getProgress,
  markComplete,
};
