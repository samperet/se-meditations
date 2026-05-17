const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const db = require('./database');
const lessons = require('./lessons');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'se-mod2-meditations-2026';
const AUDIO_BASE = path.join(__dirname, '..');
// In production, set AUDIO_BASE_URL to your Cloudflare R2 public URL
const AUDIO_CDN = process.env.AUDIO_BASE_URL || null;

// ─── Avatar uploads ─────────────────────────────────────────────────────────
// We store avatars as base64 data URLs in the users.avatar_url column rather
// than as files on disk. This keeps things working on Vercel's read-only
// serverless filesystem (only /tmp is writable, and even then files don't
// persist across cold starts and aren't served by Express static).
// The client resizes images to ~512px before upload, so each row stays small
// (~50-150 KB).
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB hard cap
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Auth middleware ─────────────────────────────────────────────────────────

async function authMiddleware(req, res, next) {
  const tok = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : req.query.t;
  if (!tok) return res.status(401).json({ error: 'Unauthorized' });
  let decoded;
  try { decoded = jwt.verify(tok, JWT_SECRET); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }

  try {
    const dbUser = await db.findUserById(decoded.id);
    if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });
    req.user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      isAdmin: !!dbUser.isAdmin,
      isFacilitator: !!dbUser.isFacilitator,
    };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin access required.' });
  next();
}

function cohortManagerMiddleware(req, res, next) {
  if (!req.user?.isAdmin && !req.user?.isFacilitator) {
    return res.status(403).json({ error: 'Facilitator access required.' });
  }
  next();
}

function cleanIdList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(id => Number(id)).filter(Number.isFinite))];
}

function parseCohortBody(body) {
  const moduleNumber = Number(body.moduleNumber);
  const data = {
    name: body.name?.trim(),
    moduleNumber,
    startDate: body.startDate,
    endDate: body.endDate,
    meetingDay: body.meetingDay?.trim(),
    meetingTime: body.meetingTime?.trim(),
    timezone: body.timezone?.trim() || 'America/New_York',
    sessions: Array.isArray(body.sessions) ? body.sessions : [],
    facilitatorIds: cleanIdList(body.facilitatorIds),
    participantIds: cleanIdList(body.participantIds),
  };
  if (!data.name) data.name = `Module ${moduleNumber} Cohort`;
  if (!Number.isInteger(moduleNumber) || moduleNumber < 1 || moduleNumber > 4) {
    throw Object.assign(new Error('Module must be 1, 2, 3, or 4.'), { status: 400 });
  }
  return data;
}

async function keepOnlyFacilitatorUsers(data) {
  const users = await db.listUsers();
  const facilitatorIds = new Set(
    users.filter(user => user.isFacilitator).map(user => String(user.id))
  );
  return {
    ...data,
    facilitatorIds: data.facilitatorIds.filter(id => facilitatorIds.has(String(id))),
  };
}

// ─── Auth routes ─────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, cohortId } = req.body;
  if (!name?.trim() || !email?.trim() || !password)
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await db.createUser(name.trim(), email.trim().toLowerCase(), hash);
    const payload = { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin, isFacilitator: !!user.isFacilitator };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

    // If they registered through the welcome page with a cohort selected,
    // enroll them as a participant in one step.
    let enrolledCohort = null;
    if (cohortId) {
      try {
        const cohorts = await db.listCohorts();
        const cohort = cohorts.find(c => String(c.id) === String(cohortId));
        if (cohort) {
          await db.addCohortParticipant(cohort.id, user.id);
          enrolledCohort = {
            id: cohort.id,
            name: cohort.name,
            moduleNumber: cohort.moduleNumber,
            startDate: cohort.startDate,
            endDate: cohort.endDate,
          };
        }
      } catch (e) {
        console.error('Cohort enrollment failed during registration', e);
        // Don't fail the registration — they can join later.
      }
    }

    res.json({ token, user: payload, enrolledCohort });
  } catch (err) {
    if (err.code === 'DUPLICATE') return res.status(400).json({ error: 'An account with that email already exists.' });
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });
  try {
    const user = await db.findUserByEmail(email.trim().toLowerCase());
    if (!user) return res.status(401).json({ error: 'No account found with that email.' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password.' });
    const payload = { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin, isFacilitator: !!user.isFacilitator };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── Profile ────────────────────────────────────────────────────────────────

app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const completedModules = await db.getCompletedModules(req.user.id, lessons);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      isFacilitator: !!user.isFacilitator,
      completedModules,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.put('/api/me', authMiddleware, async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    const updates = {};

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (trimmed.length < 1) return res.status(400).json({ error: 'Name cannot be empty.' });
      if (trimmed.length > 80) return res.status(400).json({ error: 'Name is too long.' });
      updates.name = trimmed;
    }

    if (email !== undefined) {
      const normalized = String(email).trim().toLowerCase();
      // Basic email shape check — keeping it permissive on purpose.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        return res.status(400).json({ error: 'That email doesn’t look right.' });
      }
      // Reject collisions with other users.
      const existing = await db.findUserByEmail(normalized);
      if (existing && String(existing.id) !== String(req.user.id)) {
        return res.status(409).json({ error: 'That email is already in use.' });
      }
      updates.email = normalized;
    }

    if (bio !== undefined) {
      updates.bio = String(bio).slice(0, 500);
    }

    const user = await db.updateProfile(req.user.id, updates);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({
      ok: true,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Change password — requires current password.
app.post('/api/me/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required.' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    const user = await db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });
    const hash = await bcrypt.hash(newPassword, 10);
    await db.setUserPassword(req.user.id, hash);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/me/avatar', authMiddleware, (req, res, next) => {
  avatarUpload.single('avatar')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Image must be under 2 MB.' });
      return res.status(400).json({ error: 'Upload failed.' });
    }
    if (!req.file) return res.status(400).json({ error: 'No image provided.' });
    try {
      // Encode the in-memory upload as a base64 data URL and persist it on
      // the user row. Self-contained, works on any filesystem.
      const mime = req.file.mimetype || 'image/jpeg';
      const avatarUrl = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
      await db.updateProfile(req.user.id, { avatarUrl });
      res.json({ ok: true, avatarUrl });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Server error.' });
    }
  });
});

// ─── Public: Team (facilitators with profiles) ───────────────────────────────

app.get('/api/team', async (req, res) => {
  try {
    const users = await db.listUsers();
    const facilitators = users.filter(u => u.isFacilitator);
    res.json(facilitators.map(u => ({
      id: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      bio: u.bio,
      isFacilitator: true,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── Alumni directory (requires Module 1 complete) ──────────────────────────

app.get('/api/alumni', authMiddleware, async (req, res) => {
  try {
    // Verify the requesting user has completed Module 1
    const reqCompleted = await db.getCompletedModules(req.user.id, lessons);
    if (!reqCompleted.includes(1)) {
      return res.status(403).json({ error: 'Complete Module 1 to access the alumni directory.' });
    }
    const users = await db.listUsers();
    const alumni = [];
    for (const u of users) {
      const mods = await db.getCompletedModules(u.id, lessons);
      if (mods.includes(1)) {
        alumni.push({
          id: u.id,
          name: u.name,
          avatarUrl: u.avatarUrl,
          bio: u.bio,
          isFacilitator: !!u.isFacilitator,
          completedModules: mods,
        });
      }
    }
    res.json(alumni);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── Admin ───────────────────────────────────────────────────────────────────

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await db.listUsers();
    res.json(users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: !!user.isAdmin,
      isFacilitator: !!user.isFacilitator,
      createdAt: user.createdAt,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.post('/api/admin/users/:id/reset-password', authMiddleware, adminMiddleware, async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const updated = await db.setUserPassword(req.params.id, hash);
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.post('/api/admin/users/:id/make-admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await db.setUserAdmin(req.params.id, true);
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.post('/api/admin/users/:id/make-facilitator', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await db.setUserFacilitator(req.params.id, true);
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  if (String(req.params.id) === String(req.user.id)) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }
  try {
    const deleted = await db.deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.get('/api/cohort-manager/users', authMiddleware, cohortManagerMiddleware, async (req, res) => {
  try {
    const users = await db.listUsers();
    const q = (req.query.q || '').toLowerCase().trim();
    const filtered = q
      ? users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      : users;
    res.json(filtered.slice(0, 20).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isFacilitator: !!user.isFacilitator,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.post('/api/cohort-manager/cohorts', authMiddleware, cohortManagerMiddleware, async (req, res) => {
  try {
    const cohort = await db.createCohort(await keepOnlyFacilitatorUsers(parseCohortBody(req.body)));
    res.json(cohort);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.get('/api/admin/cohorts', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    res.json(await db.listCohorts());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.post('/api/admin/cohorts', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cohort = await db.createCohort(await keepOnlyFacilitatorUsers(parseCohortBody(req.body)));
    res.json(cohort);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.put('/api/admin/cohorts/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cohort = await db.updateCohort(req.params.id, await keepOnlyFacilitatorUsers(parseCohortBody(req.body)));
    if (!cohort) return res.status(404).json({ error: 'Cohort not found.' });
    res.json(cohort);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.delete('/api/admin/cohorts/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await db.deleteCohort(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.get('/api/cohorts', async (req, res) => {
  try {
    const cohorts = await db.listCohorts();
    res.json(cohorts.map(cohort => ({
      id: cohort.id,
      name: cohort.name,
      moduleNumber: cohort.moduleNumber,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      meetingDay: cohort.meetingDay,
      meetingTime: cohort.meetingTime,
      timezone: cohort.timezone,
      facilitators: cohort.facilitators.map(user => ({ name: user.name })),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.get('/api/my/cohorts', authMiddleware, async (req, res) => {
  try {
    res.json(await db.listFacilitatorCohorts(req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Cohorts the signed-in user is enrolled in as a participant.
app.get('/api/my/enrollments', authMiddleware, async (req, res) => {
  try {
    res.json(await db.listParticipantCohorts(req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Self-enroll: signed-in user joins a cohort as a participant after agreeing
// to the program commitments on the welcome page.
app.post('/api/cohorts/:id/join', authMiddleware, async (req, res) => {
  try {
    const cohorts = await db.listCohorts();
    const cohort = cohorts.find(c => String(c.id) === String(req.params.id));
    if (!cohort) return res.status(404).json({ error: 'Cohort not found.' });
    await db.addCohortParticipant(cohort.id, req.user.id);
    res.json({
      ok: true,
      cohort: {
        id: cohort.id,
        name: cohort.name,
        moduleNumber: cohort.moduleNumber,
        startDate: cohort.startDate,
        endDate: cohort.endDate,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not join cohort. Please try again.' });
  }
});

// ─── Lessons ─────────────────────────────────────────────────────────────────

app.get('/api/lessons', authMiddleware, async (req, res) => {
  try {
    const completed = new Set(await db.getProgress(req.user.id));
    const moduleFilter = req.query.module ? Number(req.query.module) : null;
    const filtered = moduleFilter
      ? lessons.filter(l => Number(l.moduleNumber) === moduleFilter)
      : lessons;
    res.json(filtered.map(l => ({
      id: l.id, sectionId: l.sectionId, lessonNumber: l.lessonNumber,
      moduleNumber: l.moduleNumber || 2,
      title: l.title, sectionTitle: l.sectionTitle,
      isCompanion: l.isCompanion, completed: completed.has(l.id)
    })));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/lessons/:id', authMiddleware, (req, res) => {
  const lesson = lessons.find(l => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
  res.json(lesson);
});

// ─── Responses ───────────────────────────────────────────────────────────────

app.get('/api/responses/:lessonId', authMiddleware, async (req, res) => {
  try {
    res.json(await db.getResponses(req.user.id, req.params.lessonId));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/responses/:lessonId/:questionId', authMiddleware, async (req, res) => {
  try {
    await db.setResponse(req.user.id, req.params.lessonId, req.params.questionId, req.body.text ?? '');
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/my/responses', authMiddleware, async (req, res) => {
  try {
    res.json(await db.getAllResponses(req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── Progress ────────────────────────────────────────────────────────────────

app.post('/api/progress/:lessonId', authMiddleware, async (req, res) => {
  try {
    await db.markComplete(req.user.id, req.params.lessonId);
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ─── Audio ───────────────────────────────────────────────────────────────────
// Accepts token via Authorization header OR ?t= query param (needed for <audio> src)

app.get('/api/audio/:section/:folder/:filename', (req, res) => {
  const tok = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : req.query.t;
  if (!tok) return res.status(401).json({ error: 'Unauthorized' });
  try { jwt.verify(tok, JWT_SECRET); } catch { return res.status(401).json({ error: 'Invalid token' }); }

  const { section, folder } = req.params;
  const filename = decodeURIComponent(req.params.filename);

  const allowedSections = new Set(['Section_1', 'Section_2']);
  const allowedFolders = new Set(['Lessons', 'Companions']);
  if (!allowedSections.has(section) || !allowedFolders.has(folder))
    return res.status(403).json({ error: 'Forbidden' });
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\'))
    return res.status(403).json({ error: 'Forbidden' });

  // Production: redirect to CDN
  if (AUDIO_CDN) {
    const cdnUrl = `${AUDIO_CDN}/${section}/${folder}/${encodeURIComponent(filename)}`;
    return res.redirect(302, cdnUrl);
  }

  // Local dev: stream from disk
  const filePath = path.join(AUDIO_BASE, section, folder, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Audio file not found.' });

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': 'audio/mp4',
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mp4',
      'Accept-Ranges': 'bytes',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

// ─── SPA fallback ────────────────────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start (local dev only) ───────────────────────────────────────────────────

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\nSacred Engagement Meditations`);
    console.log(`Running at: http://localhost:${PORT}`);
    console.log(`Phone: http://${require('os').networkInterfaces().en0?.find(i => i.family === 'IPv4')?.address || '<your-ip>'}:${PORT}\n`);
  });
}

module.exports = app;
