// ─── State ────────────────────────────────────────────────────────────────────

let token = localStorage.getItem('se_token');
let currentUser = null;
try { currentUser = JSON.parse(localStorage.getItem('se_user')); } catch {}
let allLessons = [];
let currentLessonId = null;
let audioEl = null;
let saveTimers = {};
let navHistory = [];
let playbackRate = 1;
let autoplayNext = false;
let myCohorts = [];
const ADMIN_EMAIL = 'samperet@gmail.com';

// ─── API ──────────────────────────────────────────────────────────────────────

async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  // Direct link to register: /?register or ?register=1
  const params = new URLSearchParams(location.search);
  if (params.has('cohorts')) {
    document.getElementById('auth-screen').style.display = 'flex';
    showCohortRegistration();
    return;
  }
  if (params.has('register')) {
    document.getElementById('auth-screen').style.display = 'flex';
    showView('register');
    return;
  }
  if (token && currentUser) {
    showApp();
  } else {
    document.getElementById('auth-screen').style.display = 'flex';
  }
});

document.addEventListener('click', (e) => {
  const menu = document.getElementById('user-menu');
  if (!menu.contains(e.target) && !document.getElementById('user-btn').contains(e.target)) {
    menu.classList.remove('visible');
  }
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

function showView(view) {
  document.getElementById('view-login').style.display = view === 'login' ? 'block' : 'none';
  document.getElementById('view-register').style.display = view === 'register' ? 'block' : 'none';
  document.getElementById('view-cohorts').style.display = view === 'cohorts' ? 'block' : 'none';
  clearAuthError();
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.style.display = 'block';
}

function clearAuthError() {
  const el = document.getElementById('auth-error');
  el.style.display = 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  clearAuthError();
  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Signing in…';
  try {
    const data = await api('POST', '/api/auth/login', {
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value,
    });
    storeAuth(data);
    showApp();
  } catch (err) {
    showAuthError(err.message);
  } finally {
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Sign In';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  clearAuthError();
  const btn = document.getElementById('register-btn');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Creating account…';
  try {
    const data = await api('POST', '/api/auth/register', {
      name: document.getElementById('reg-name').value,
      email: document.getElementById('reg-email').value,
      password: document.getElementById('reg-password').value,
    });
    storeAuth(data);
    showApp();
  } catch (err) {
    showAuthError(err.message);
  } finally {
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Create Account';
  }
}

function storeAuth(data) {
  token = data.token;
  currentUser = data.user;
  localStorage.setItem('se_token', token);
  localStorage.setItem('se_user', JSON.stringify(currentUser));
}

function logout() {
  token = null;
  currentUser = null;
  allLessons = [];
  myCohorts = [];
  localStorage.removeItem('se_token');
  localStorage.removeItem('se_user');
  document.getElementById('app-screen').classList.remove('visible');
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('user-menu').classList.remove('visible');
}

function toggleUserMenu() {
  document.getElementById('user-menu').classList.toggle('visible');
}

function currentUserIsAdmin() {
  return !!(currentUser?.isAdmin || currentUser?.email?.toLowerCase() === ADMIN_EMAIL);
}

function currentUserIsFacilitator() {
  return !!currentUser?.isFacilitator;
}

function currentUserCanManageCohorts() {
  return currentUserIsAdmin() || currentUserIsFacilitator();
}

// ─── App Shell ────────────────────────────────────────────────────────────────

async function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').classList.add('visible');

  // Set user avatar initials
  const initial = (currentUser?.name || '?')[0].toUpperCase();
  document.getElementById('user-btn').textContent = initial;
  document.getElementById('user-menu-name').textContent = currentUser?.name || '';
  document.getElementById('admin-menu-item').style.display = currentUserIsAdmin() ? 'block' : 'none';
  document.getElementById('add-cohort-menu-item').style.display = currentUserCanManageCohorts() ? 'block' : 'none';
  refreshCohortMenuAccess();

  await loadHome();
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function setHeader(title, showBack) {
  document.getElementById('header-title').textContent = title;
  const backBtn = document.getElementById('back-btn');
  backBtn.classList.toggle('visible', !!showBack);
}

function goBack() {
  if (navHistory.length > 1) {
    navHistory.pop();
    const prev = navHistory[navHistory.length - 1];
    if (prev.type === 'home') {
      navHistory = [];
      loadHome();
    } else if (prev.type === 'lesson') {
      navHistory.pop();
      loadLesson(prev.id);
    }
  } else {
    navHistory = [];
    loadHome();
  }
}

// ─── Home ─────────────────────────────────────────────────────────────────────

async function loadHome() {
  stopAudio();
  currentLessonId = null;
  navHistory = [{ type: 'home' }];
  setHeader('Meditations', false);
  setContent('<div class="loading-screen"><div class="spinner"></div></div>');

  try {
    allLessons = await api('GET', '/api/lessons');
    renderHome();
  } catch (err) {
    setContent(`<div class="loading-screen"><p>Could not load lessons. Please try again.</p></div>`);
  }
}

async function showCohortRegistration() {
  showView('cohorts');
  const list = document.getElementById('cohort-registration-list');
  list.innerHTML = '<div class="spinner"></div>';
  try {
    const cohorts = await api('GET', '/api/cohorts');
    list.innerHTML = cohorts.length
      ? cohorts.map(renderPublicCohortCard).join('')
      : '<p class="auth-switch">No cohorts are currently open for registration.</p>';
  } catch (err) {
    list.innerHTML = `<p class="auth-switch">${escHtml(err.message || 'Could not load cohorts.')}</p>`;
  }
}

function renderPublicCohortCard(cohort) {
  const facilitators = cohort.facilitators?.map(user => user.name).filter(Boolean).join(', ') || 'To be announced';
  return `
    <div class="cohort-card">
      <div class="cohort-registration-title">Module ${cohort.moduleNumber}: ${escHtml(cohort.name)}</div>
      <div class="cohort-registration-meta">${formatCohortDates(cohort)} · ${escHtml(cohort.meetingDay)} at ${escHtml(cohort.meetingTime)} ${escHtml(cohort.timezone)}</div>
      <div class="cohort-registration-meta">Facilitator${facilitators.includes(',') ? 's' : ''}: ${escHtml(facilitators)}</div>
    </div>
  `;
}

async function refreshCohortMenuAccess() {
  if (!token) return;
  try {
    myCohorts = await api('GET', '/api/my/cohorts');
    document.getElementById('add-cohort-menu-item').style.display = currentUserCanManageCohorts() ? 'block' : 'none';
    document.getElementById('cohorts-menu-item').style.display =
      currentUserIsAdmin() || myCohorts.length ? 'block' : 'none';
  } catch {
    document.getElementById('add-cohort-menu-item').style.display = currentUserCanManageCohorts() ? 'block' : 'none';
    document.getElementById('cohorts-menu-item').style.display = currentUserIsAdmin() ? 'block' : 'none';
  }
}

async function openAdminPanel() {
  document.getElementById('user-menu').classList.remove('visible');
  await loadAdminPanel();
}

async function loadAdminPanel() {
  if (!currentUserIsAdmin()) {
    showToast('Admin access required.');
    return;
  }
  stopAudio();
  currentLessonId = null;
  navHistory = [{ type: 'home' }, { type: 'admin' }];
  setHeader('Admin', true);
  setContent('<div class="loading-screen"><div class="spinner"></div></div>');

  try {
    const [users, cohorts] = await Promise.all([
      api('GET', '/api/admin/users'),
      api('GET', '/api/admin/cohorts'),
    ]);
    renderAdminPanel(users, cohorts);
  } catch (err) {
    setContent(`<div class="loading-screen"><p>${escHtml(err.message || 'Could not load admin panel.')}</p></div>`);
  }
}

function renderAdminPanel(users, cohorts) {
  const adminCount = users.filter(user => user.isAdmin).length;
  const html = `
    <div class="admin-page">
      <div class="admin-hero">
        <div class="admin-eyebrow">Admin</div>
        <div class="admin-title">User administration</div>
        <div class="admin-copy">View all registered users and set a new password for any account. Password resets take effect immediately.</div>
      </div>

      <div class="admin-summary">
        <div class="admin-stat">
          <div class="admin-stat-label">Registered Users</div>
          <div class="admin-stat-value">${users.length}</div>
        </div>
        <div class="admin-stat">
          <div class="admin-stat-label">Admins</div>
          <div class="admin-stat-value">${adminCount}</div>
        </div>
        <div class="admin-stat">
          <div class="admin-stat-label">Cohorts</div>
          <div class="admin-stat-value">${cohorts.length}</div>
        </div>
      </div>

      <div class="admin-section-title">Cohorts</div>
      <div class="cohort-list">
        ${cohorts.length ? cohorts.map(cohort => renderAdminCohortCard(cohort, users)).join('') : '<div class="admin-user-card">No cohorts have been created yet.</div>'}
      </div>

      <div class="admin-section-title">Users</div>
      <div class="admin-user-list">
        ${users.map(renderAdminUserCard).join('')}
      </div>
    </div>
  `;
  setContent(html);
}

function renderAdminUserCard(user) {
  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';
  return `
    <div class="admin-user-card">
      <div class="admin-user-top">
        <div>
          <div class="admin-user-name">${escHtml(user.name)}</div>
          <div class="admin-user-email">${escHtml(user.email)}</div>
          <div class="admin-user-meta">Created ${escHtml(createdAt)}</div>
        </div>
        <div class="admin-badges">
          <div class="admin-badge ${user.isAdmin ? 'admin' : ''}">${user.isAdmin ? 'Admin' : 'Member'}</div>
          ${user.isFacilitator ? '<div class="admin-badge facilitator">Facilitator</div>' : ''}
        </div>
      </div>

      <div class="admin-user-actions">
        ${user.isAdmin ? '' : `<button class="admin-secondary-btn" onclick="makeUserAdmin('${String(user.id)}')">Make Admin</button>`}
        ${user.isFacilitator ? '' : `<button class="admin-secondary-btn" onclick="makeUserFacilitator('${String(user.id)}')">Make Facilitator</button>`}
        <button class="admin-secondary-btn" onclick="showPasswordReset('${String(user.id)}')">Reset Password</button>
        <button class="admin-danger-btn" onclick="deleteUser('${String(user.id)}', '${escHtml(user.name)}')">Delete</button>
      </div>

      <form class="admin-reset-form" id="admin-reset-form-${String(user.id)}" hidden onsubmit="resetUserPassword(event, '${String(user.id)}')">
        <input
          class="admin-reset-input"
          id="admin-password-${String(user.id)}"
          type="password"
          minlength="6"
          placeholder="Enter a new password"
          autocomplete="new-password"
          required
        >
        <button class="admin-reset-btn" id="admin-reset-btn-${String(user.id)}" type="submit">Save Password</button>
        <button class="admin-secondary-btn" type="button" onclick="hidePasswordReset('${String(user.id)}')">Cancel</button>
      </form>
    </div>
  `;
}

function renderCohortForm(prefix, users, cohort = null, options = {}) {
  const facilitatorIds = new Set((cohort?.facilitators || []).map(user => String(user.id)));
  const participantIds = new Set((cohort?.participants || []).map(user => String(user.id)));
  const facilitatorUsers = users.filter(user => user.isFacilitator || facilitatorIds.has(String(user.id)));
  const createHandler = options.createHandler || 'createCohort';
  return `
    <form class="${cohort ? 'admin-form-inline' : 'admin-form-card'}" onsubmit="${cohort ? `updateCohort(event, '${String(cohort.id)}')` : `${createHandler}(event)`}">
      <div class="admin-form-grid">
        <label class="admin-field full">
          Cohort name
          <input id="${prefix}-name" value="${escAttr(cohort?.name || '')}" placeholder="Spring Evening Cohort" required>
        </label>
        <label class="admin-field">
          Module
          <select id="${prefix}-module" required>
            ${[1,2,3,4].map(n => `<option value="${n}" ${Number(cohort?.moduleNumber) === n ? 'selected' : ''}>Module ${n}</option>`).join('')}
          </select>
        </label>
        <label class="admin-field">
          Day
          <input id="${prefix}-day" value="${escAttr(cohort?.meetingDay || '')}" placeholder="Tuesdays" required>
        </label>
        <label class="admin-field">
          Start date
          <input id="${prefix}-start" type="date" value="${escAttr(cohort?.startDate || '')}" required>
        </label>
        <label class="admin-field">
          End date
          <input id="${prefix}-end" type="date" value="${escAttr(cohort?.endDate || '')}" required>
        </label>
        <label class="admin-field">
          Time
          <input id="${prefix}-time" value="${escAttr(cohort?.meetingTime || '')}" placeholder="6:00 PM" required>
        </label>
        <label class="admin-field">
          Timezone
          <input id="${prefix}-timezone" value="${escAttr(cohort?.timezone || 'America/New_York')}" required>
        </label>
        <div class="admin-field full">
          Facilitators
          ${renderUserChecklist(facilitatorUsers, `${prefix}-facilitators`, facilitatorIds, 'No facilitator users yet. Mark a user as facilitator from Admin first.')}
        </div>
        <div class="admin-field full">
          Participants
          ${renderUserChecklist(users, `${prefix}-participants`, participantIds)}
        </div>
      </div>
      <div class="admin-form-actions">
        <button class="admin-reset-btn" type="submit">${cohort ? 'Update Cohort' : 'Create Cohort'}</button>
        ${cohort ? `<button class="admin-secondary-btn" type="button" onclick="toggleCohortEdit('${String(cohort.id)}')">Cancel</button>` : ''}
      </div>
    </form>
  `;
}

function renderUserChecklist(users, name, selectedIds, emptyMessage = 'No users available.') {
  if (!users.length) return `<div class="admin-danger-note">${escHtml(emptyMessage)}</div>`;
  return `
    <div class="cohort-checklist">
      ${users.map(user => `
        <label class="cohort-check">
          <input type="checkbox" name="${name}" value="${String(user.id)}" ${selectedIds.has(String(user.id)) ? 'checked' : ''}>
          <span>${escHtml(user.name)} · ${escHtml(user.email)}</span>
        </label>
      `).join('')}
    </div>
  `;
}

function renderAdminCohortCard(cohort, users) {
  const facilitators = formatUserNames(cohort.facilitators);
  const participants = formatUserNames(cohort.participants);
  const id = String(cohort.id);
  return `
    <div class="cohort-card">
      <div class="cohort-card-title">Module ${cohort.moduleNumber}: ${escHtml(cohort.name)}</div>
      <div class="cohort-meta">${formatCohortDates(cohort)} · ${escHtml(cohort.meetingDay)} at ${escHtml(cohort.meetingTime)} ${escHtml(cohort.timezone)}</div>
      <div class="cohort-member-line"><strong>Facilitators:</strong> ${escHtml(facilitators)}</div>
      <div class="cohort-member-line"><strong>Participants:</strong> ${escHtml(participants)}</div>
      <div class="admin-form-actions">
        <button class="admin-secondary-btn" onclick="toggleCohortEdit('${id}')">Edit Cohort</button>
      </div>
      <div class="cohort-edit" id="cohort-edit-${id}">
        ${renderCohortForm(`edit-${id}`, users, cohort)}
      </div>
    </div>
  `;
}

function getCohortFormData(prefix) {
  const checkedValues = name => [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);
  return {
    name: document.getElementById(`${prefix}-name`).value,
    moduleNumber: document.getElementById(`${prefix}-module`).value,
    startDate: document.getElementById(`${prefix}-start`).value,
    endDate: document.getElementById(`${prefix}-end`).value,
    meetingDay: document.getElementById(`${prefix}-day`).value,
    meetingTime: document.getElementById(`${prefix}-time`).value,
    timezone: document.getElementById(`${prefix}-timezone`).value,
    facilitatorIds: checkedValues(`${prefix}-facilitators`),
    participantIds: checkedValues(`${prefix}-participants`),
  };
}

async function createCohort(event) {
  event.preventDefault();
  try {
    await api('POST', '/api/admin/cohorts', getCohortFormData('new'));
    showToast('Cohort created.');
    await loadAdminPanel();
  } catch (err) {
    showToast(err.message || 'Could not create cohort.');
  }
}

async function updateCohort(event, cohortId) {
  event.preventDefault();
  try {
    await api('PUT', `/api/admin/cohorts/${encodeURIComponent(cohortId)}`, getCohortFormData(`edit-${cohortId}`));
    showToast('Cohort updated.');
    await loadAdminPanel();
  } catch (err) {
    showToast(err.message || 'Could not update cohort.');
  }
}

function toggleCohortEdit(cohortId) {
  document.getElementById(`cohort-edit-${cohortId}`)?.classList.toggle('visible');
}

async function makeUserAdmin(userId) {
  try {
    await api('POST', `/api/admin/users/${encodeURIComponent(userId)}/make-admin`);
    showToast('User is now an admin.');
    await loadAdminPanel();
  } catch (err) {
    showToast(err.message || 'Could not update admin access.');
  }
}

async function makeUserFacilitator(userId) {
  try {
    await api('POST', `/api/admin/users/${encodeURIComponent(userId)}/make-facilitator`);
    showToast('User is now a facilitator.');
    await loadAdminPanel();
  } catch (err) {
    showToast(err.message || 'Could not update facilitator access.');
  }
}

async function deleteUser(userId, name) {
  if (!confirm(`Delete ${name}? This will permanently remove their account and all their data.`)) return;
  try {
    await api('DELETE', `/api/admin/users/${encodeURIComponent(userId)}`);
    showToast(`${name} has been deleted.`);
    await loadAdminPanel();
  } catch (err) {
    showToast(err.message || 'Could not delete user.');
  }
}

async function openAddCohortPanel() {
  document.getElementById('user-menu').classList.remove('visible');
  await loadAddCohortPanel();
}

async function loadAddCohortPanel() {
  if (!currentUserCanManageCohorts()) {
    showToast('Facilitator access required.');
    return;
  }
  stopAudio();
  currentLessonId = null;
  navHistory = [{ type: 'home' }, { type: 'add-cohort' }];
  setHeader('Add Cohort', true);
  setContent('<div class="loading-screen"><div class="spinner"></div></div>');

  try {
    const users = await api('GET', '/api/cohort-manager/users');
    setContent(`
      <div class="admin-page">
        <div class="admin-hero">
          <div class="admin-eyebrow">Cohorts</div>
          <div class="admin-title">Add Cohort</div>
          <div class="admin-copy">Create a Sacred Engagement module cohort with dates, meeting time, facilitators, and participants.</div>
        </div>
        ${renderCohortForm('add', users, null, { createHandler: 'createManagedCohort' })}
      </div>
    `);
  } catch (err) {
    setContent(`<div class="loading-screen"><p>${escHtml(err.message || 'Could not load Add Cohort.')}</p></div>`);
  }
}

async function createManagedCohort(event) {
  event.preventDefault();
  try {
    await api('POST', '/api/cohort-manager/cohorts', getCohortFormData('add'));
    showToast('Cohort created.');
    await loadAddCohortPanel();
  } catch (err) {
    showToast(err.message || 'Could not create cohort.');
  }
}

function showPasswordReset(userId) {
  const form = document.getElementById(`admin-reset-form-${userId}`);
  if (form) form.hidden = false;
  document.getElementById(`admin-password-${userId}`)?.focus();
}

function hidePasswordReset(userId) {
  const form = document.getElementById(`admin-reset-form-${userId}`);
  const input = document.getElementById(`admin-password-${userId}`);
  if (input) input.value = '';
  if (form) form.hidden = true;
}

async function resetUserPassword(event, userId) {
  event.preventDefault();
  const input = document.getElementById(`admin-password-${userId}`);
  const btn = document.getElementById(`admin-reset-btn-${userId}`);
  const password = input.value;

  if (!password || password.length < 6) {
    showToast('Password must be at least 6 characters.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Resetting...';
  try {
    await api('POST', `/api/admin/users/${encodeURIComponent(userId)}/reset-password`, { password });
    input.value = '';
    hidePasswordReset(userId);
    showToast('Password reset successfully.');
  } catch (err) {
    showToast(err.message || 'Could not reset password.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Password';
  }
}

async function openFacilitatorCohorts() {
  document.getElementById('user-menu').classList.remove('visible');
  await loadFacilitatorCohorts();
}

async function loadFacilitatorCohorts() {
  stopAudio();
  currentLessonId = null;
  navHistory = [{ type: 'home' }, { type: 'cohorts' }];
  setHeader('Cohorts', true);
  setContent('<div class="loading-screen"><div class="spinner"></div></div>');

  try {
    const cohorts = await api('GET', '/api/my/cohorts');
    myCohorts = cohorts;
    renderFacilitatorCohorts(cohorts);
  } catch (err) {
    setContent(`<div class="loading-screen"><p>${escHtml(err.message || 'Could not load cohorts.')}</p></div>`);
  }
}

function renderFacilitatorCohorts(cohorts) {
  const html = `
    <div class="admin-page">
      <div class="admin-hero">
        <div class="admin-eyebrow">Facilitator</div>
        <div class="admin-title">My cohorts</div>
        <div class="admin-copy">Participant lists and email shortcuts for the cohorts you facilitate.</div>
      </div>

      <div class="facilitator-cohort-list">
        ${cohorts.length ? cohorts.map(renderFacilitatorCohortCard).join('') : '<div class="admin-user-card">No facilitator cohorts are assigned to your account yet.</div>'}
      </div>
    </div>
  `;
  setContent(html);
}

function renderFacilitatorCohortCard(cohort) {
  const emails = (cohort.participants || []).map(user => user.email).filter(Boolean);
  const mailto = `mailto:?cc=${encodeURIComponent(emails.join(','))}&subject=${encodeURIComponent(`Sacred Engagement Module ${cohort.moduleNumber}: ${cohort.name}`)}`;
  return `
    <div class="facilitator-cohort-card">
      <div class="facilitator-cohort-title">Module ${cohort.moduleNumber}: ${escHtml(cohort.name)}</div>
      <div class="cohort-meta">${formatCohortDates(cohort)} · ${escHtml(cohort.meetingDay)} at ${escHtml(cohort.meetingTime)} ${escHtml(cohort.timezone)}</div>
      <div class="facilitator-participant-list">
        ${(cohort.participants || []).length ? cohort.participants.map(user => `
          <div class="facilitator-participant">${escHtml(user.name)} · ${escHtml(user.email)}</div>
        `).join('') : '<div class="facilitator-participant">No participants assigned yet.</div>'}
      </div>
      ${emails.length ? `<a class="email-cohort-btn" href="${escAttr(mailto)}">Email Participants</a>` : ''}
    </div>
  `;
}

function renderHome() {
  const firstName = (currentUser?.name || '').split(' ')[0];
  const s1Lessons = allLessons.filter(l => l.sectionId === 1 && !l.isCompanion);
  const s1Companions = allLessons.filter(l => l.sectionId === 1 && l.isCompanion);
  const s2Lessons = allLessons.filter(l => l.sectionId === 2 && !l.isCompanion);
  const s2Companions = allLessons.filter(l => l.sectionId === 2 && l.isCompanion);
  const totalDone = allLessons.filter(l => !l.isCompanion && l.completed).length;
  const pct = Math.round((totalDone / 20) * 100);
  const nextLesson = allLessons.find(l => !l.isCompanion && !l.completed);

  const html = `
    <div class="home-hero">
      <img src="/logo.png" alt="Sacred Engagement" class="home-logo">
      <div class="home-greeting">Welcome back, ${firstName}</div>
      <div class="home-module-label">Module 2 — Clearing Away</div>
    </div>

    ${nextLesson ? `
    <div class="continue-card" onclick="loadLesson('${nextLesson.id}')">
      <div class="continue-info">
        <div class="continue-eyebrow">${nextLesson.sectionId === 1 ? 'Section 1' : 'Section 2'} · Lesson ${nextLesson.lessonNumber}</div>
        <div class="continue-title">${nextLesson.title}</div>
        <div class="continue-sub">${totalDone === 0 ? 'Start your journey' : 'Continue where you left off'}</div>
      </div>
      <button class="continue-play-btn" aria-label="Play" onclick="event.stopPropagation(); autoplayNext=true; loadLesson('${nextLesson.id}')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
    ` : `
    <div class="continue-card all-done">
      <div class="continue-info">
        <div class="continue-eyebrow">Module 2</div>
        <div class="continue-title">All lessons complete</div>
        <div class="continue-sub">You've finished both sections</div>
      </div>
      <div class="continue-done-icon">✓</div>
    </div>
    `}

    <div class="home-progress-bar-wrap">
      <div class="home-progress-label">${totalDone} of 20 lessons complete</div>
      <div class="home-progress-track">
        <div class="home-progress-fill" style="width:${pct}%"></div>
      </div>
    </div>

    ${renderSectionGroup(1, 'Section 1: Preparing for the Journey', s1Lessons, s1Companions)}
    ${renderSectionGroup(2, 'Section 2: Meeting the Voices Within', s2Lessons, s2Companions)}
    ${renderInstallBanner()}
    <div style="height:32px"></div>
  `;
  setContent(html);
}

function renderSectionGroup(sectionId, title, lessons, companions) {
  const done = lessons.filter(l => l.completed).length;
  return `
    <div class="section-group">
      <div class="section-header-card">
        <h3>${title}</h3>
        <p style="margin-top:6px;font-size:13px;color:var(--text-muted)">${done} of ${lessons.length} lessons complete</p>
      </div>
    </div>
    <div class="lesson-list">
      ${lessons.map(l => renderLessonCard(l)).join('')}
    </div>
    <div class="companions-section" style="padding-top:16px">
      <div class="companions-title">Companion Meditations</div>
      <div class="companion-grid">
        ${companions.map(c => renderCompanionCard(c)).join('')}
      </div>
    </div>
  `;
}

function renderLessonCard(lesson) {
  return `
    <div class="lesson-card ${lesson.completed ? 'completed' : ''}" onclick="loadLesson('${lesson.id}')">
      <div class="lesson-number">${lesson.completed ? checkSvg() : lesson.lessonNumber}</div>
      <div class="lesson-info">
        <h4>${lesson.title}</h4>
        <span class="lesson-tag">Section ${lesson.sectionId} — Lesson ${lesson.lessonNumber}</span>
      </div>
      <div class="lesson-chevron">${chevronSvg()}</div>
    </div>
  `;
}

function renderCompanionCard(lesson) {
  return `
    <div class="companion-card ${lesson.completed ? 'completed' : ''}" onclick="loadLesson('${lesson.id}')">
      <div class="c-icon">${lesson.completed ? checkSvg() : musicSvg()}</div>
      <span>${lesson.title}</span>
    </div>
  `;
}

// ─── Lesson ───────────────────────────────────────────────────────────────────

async function loadLesson(id) {
  stopAudio();
  currentLessonId = id;
  navHistory = [{ type: 'home' }, { type: 'lesson', id }];
  setContent('<div class="loading-screen"><div class="spinner"></div></div>');

  try {
    const [lesson, responses] = await Promise.all([
      api('GET', `/api/lessons/${id}`),
      api('GET', `/api/responses/${id}`),
    ]);
    renderLesson(lesson, responses);
  } catch (err) {
    setContent(`<div class="loading-screen"><p>Could not load lesson.</p></div>`);
  }
}

function renderLesson(lesson, responses) {
  const isCompleted = allLessons.find(l => l.id === lesson.id)?.completed;
  const lessonLabel = lesson.isCompanion ? lesson.title : `Section ${lesson.sectionId} — Lesson ${lesson.lessonNumber}`;
  setHeader(lesson.sectionTitle, true);

  const audioUrl = `/api/audio/${encodeURIComponent(lesson.audio.section)}/${lesson.audio.folder}/${encodeURIComponent(lesson.audio.file)}?t=${encodeURIComponent(token)}`;

  const blocksHtml = lesson.blocks.map((block, bi) => renderBlock(block, bi, lesson.id, responses)).join('');

  // Find next lesson
  const idx = allLessons.findIndex(l => l.id === lesson.id);
  const next = idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  const html = `
    <div class="lesson-page">
      <div class="audio-player">
        <div class="audio-lesson-title">${lessonLabel}</div>
        <div class="audio-title">${lesson.title}</div>
        <div class="audio-controls">
          <button class="audio-play-btn" id="play-btn" onclick="togglePlay()" aria-label="Play/Pause">
            ${playSvg()}
          </button>
          <div class="audio-progress-wrap">
            <input type="range" class="audio-slider" id="audio-slider" value="0" min="0" max="100" step="0.1"
              oninput="seekAudio(this.value)" aria-label="Progress">
            <div class="audio-time">
              <span id="audio-current">0:00</span>
              <span id="audio-duration">--:--</span>
            </div>
          </div>
        </div>
        <audio id="lesson-audio" preload="metadata" src="${audioUrl}"></audio>
      </div>

      <div class="save-status" id="save-status">
        <div class="save-dot"></div>
        <span id="save-label">Responses auto-save as you type</span>
      </div>

      <div class="lesson-blocks">
        ${blocksHtml}
      </div>

      <div class="complete-section">
        <button class="btn-complete ${isCompleted ? 'done' : ''}" id="complete-btn" onclick="markComplete('${lesson.id}')">
          ${isCompleted ? `${checkSvg()} Completed` : 'Mark as Complete'}
        </button>
        ${next ? `
          <br>
          <button class="next-lesson-btn" onclick="loadLesson('${next.id}')">
            Next: ${next.title} ${chevronSvg()}
          </button>
        ` : ''}
      </div>
    </div>
  `;

  setContent(html);
  initAudio();
}

function youtubeId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/);
  return m ? m[1] : null;
}

function renderBlock(block, blockIndex, lessonId, responses) {
  if (block.type === 'youtube') {
    const vid = youtubeId(block.url);
    if (!vid) return '';
    const thumb = `https://img.youtube.com/vi/${vid}/mqdefault.jpg`;
    return `
      <div class="block-link">
        <a href="https://www.youtube.com/watch?v=${vid}" target="_blank" rel="noopener noreferrer" class="youtube-card">
          <div class="youtube-thumb-wrap">
            <img src="${thumb}" alt="${escHtml(block.label || 'Watch on YouTube')}" class="youtube-thumb-img">
            <div class="youtube-play-overlay">
              <svg class="youtube-play-icon" viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#f00"/><path d="M45 24 27 14v20" fill="#fff"/></svg>
            </div>
          </div>
          ${block.label ? `<div class="youtube-card-label">${escHtml(block.label)}</div>` : ''}
        </a>
      </div>`;
  }

  if (block.type === 'link') {
    return `
      <div class="block-link">
        <a href="${escHtml(block.url)}" target="_blank" rel="noopener noreferrer" class="lesson-link-btn">
          <span class="lesson-link-icon">${block.icon || '↗'}</span>
          ${escHtml(block.label)}
        </a>
      </div>`;
  }

  if (block.type === 'info') {
    return `
      <div class="block-info">
        ${block.title ? `<div class="block-title">${block.title}</div>` : ''}
        <div class="block-intro">${escHtml(block.content)}</div>
      </div>
    `;
  }

  if (block.type === 'questions') {
    const questionsHtml = block.questions.map(q => `
      <div class="question-item">
        <label class="question-label" for="q_${q.id}">${escHtml(q.label)}</label>
        <textarea
          class="question-textarea ${q.large ? 'large' : ''}"
          id="q_${q.id}"
          placeholder="Your response…"
          rows="3"
          oninput="autoResize(this); scheduleAutosave('${lessonId}', '${q.id}', this.value)"
        >${escHtml(responses[q.id] || '')}</textarea>
      </div>
    `).join('');

    return `
      <div class="block-questions">
        ${block.title ? `<div class="block-title">${block.title}</div>` : ''}
        ${block.intro ? `<div class="block-intro" style="margin-bottom:14px">${escHtml(block.intro)}</div>` : ''}
        ${questionsHtml}
      </div>
    `;
  }

  return '';
}

// ─── Auto-resize textareas ────────────────────────────────────────────────────

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

// Init resize on existing content
function initTextareas() {
  document.querySelectorAll('.question-textarea').forEach(el => {
    if (el.value) autoResize(el);
  });
}

// ─── Autosave ─────────────────────────────────────────────────────────────────

function scheduleAutosave(lessonId, questionId, value) {
  const key = `${lessonId}:${questionId}`;
  clearTimeout(saveTimers[key]);
  setSaveStatus('saving');
  saveTimers[key] = setTimeout(() => saveResponse(lessonId, questionId, value), 1200);
}

async function saveResponse(lessonId, questionId, value) {
  try {
    await api('PUT', `/api/responses/${lessonId}/${questionId}`, { text: value });
    setSaveStatus('saved');
  } catch {
    setSaveStatus('error');
  }
}

function setSaveStatus(state) {
  const el = document.getElementById('save-status');
  const label = document.getElementById('save-label');
  if (!el || !label) return;
  el.className = `save-status ${state}`;
  if (state === 'saving') label.textContent = 'Saving…';
  else if (state === 'saved') label.textContent = 'Saved';
  else if (state === 'error') label.textContent = 'Save failed — check connection';
  else label.textContent = 'Responses auto-save as you type';
}

// ─── Mark complete ────────────────────────────────────────────────────────────

async function markComplete(lessonId) {
  const btn = document.getElementById('complete-btn');
  const lesson = allLessons.find(l => l.id === lessonId);
  if (lesson?.completed) return;

  try {
    await api('POST', `/api/progress/${lessonId}`);
    if (lesson) lesson.completed = true;
    btn.className = 'btn-complete done';
    btn.innerHTML = `${checkSvg()} Completed`;
    showToast('Lesson marked as complete!');
  } catch {
    showToast('Could not save progress.');
  }
}

// ─── Audio Player ─────────────────────────────────────────────────────────────

function initAudio() {
  audioEl = document.getElementById('lesson-audio');
  if (!audioEl) return;

  audioEl.addEventListener('loadedmetadata', () => {
    document.getElementById('audio-duration').textContent = formatTime(audioEl.duration);
  });

  audioEl.addEventListener('timeupdate', () => {
    const slider = document.getElementById('audio-slider');
    const current = document.getElementById('audio-current');
    if (!slider || !current) return;
    if (audioEl.duration) {
      slider.value = (audioEl.currentTime / audioEl.duration) * 100;
    }
    current.textContent = formatTime(audioEl.currentTime);
  });

  audioEl.addEventListener('play', () => {
    const btn = document.getElementById('play-btn');
    if (btn) btn.innerHTML = pauseSvg();
  });

  audioEl.addEventListener('pause', () => {
    const btn = document.getElementById('play-btn');
    if (btn) btn.innerHTML = playSvg();
  });

  audioEl.addEventListener('ended', () => {
    const btn = document.getElementById('play-btn');
    if (btn) btn.innerHTML = playSvg();
  });

  // Restore saved position (but not if within last 10s — treat as finished)
  audioEl.addEventListener('loadedmetadata', () => {
    const savedPos = sessionStorage.getItem(`audio_pos_${currentLessonId}`);
    if (savedPos) {
      const pos = parseFloat(savedPos);
      if (pos < audioEl.duration - 10) audioEl.currentTime = pos;
    }
  }, { once: true });

  // Save position periodically
  audioEl.addEventListener('timeupdate', () => {
    if (currentLessonId) {
      sessionStorage.setItem(`audio_pos_${currentLessonId}`, audioEl.currentTime);
    }
  });

  // Autoplay if navigated via the play button — start from beginning
  if (autoplayNext) {
    autoplayNext = false;
    sessionStorage.removeItem(`audio_pos_${currentLessonId}`);
    audioEl.currentTime = 0;
    audioEl.play().catch(() => {});
  }

  // Init textarea auto-resize after a tick
  setTimeout(initTextareas, 50);
}

function togglePlay() {
  if (!audioEl) return;
  if (audioEl.paused) audioEl.play();
  else audioEl.pause();
}

function seekAudio(val) {
  if (!audioEl || !audioEl.duration) return;
  audioEl.currentTime = (val / 100) * audioEl.duration;
}

function cycleSpeed() {
  const speeds = [1, 1.25, 1.5, 0.75];
  const idx = speeds.indexOf(playbackRate);
  playbackRate = speeds[(idx + 1) % speeds.length];
  if (audioEl) audioEl.playbackRate = playbackRate;
  const btn = document.getElementById('speed-btn');
  if (btn) btn.textContent = `${playbackRate}×`;
}

function stopAudio() {
  if (audioEl) {
    audioEl.pause();
    audioEl = null;
  }
}

function formatTime(secs) {
  if (!isFinite(secs)) return '--:--';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function setContent(html) {
  document.getElementById('app-content').innerHTML = html;
}

function escHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escAttr(str) {
  return escHtml(str).replace(/'/g, '&#39;');
}

function formatDateOnly(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = String(dateStr).split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCohortDates(cohort) {
  return `${formatDateOnly(cohort.startDate)} to ${formatDateOnly(cohort.endDate)}`;
}

function formatUserNames(users = []) {
  return users.length ? users.map(user => user.name).join(', ') : 'None assigned';
}

function showToast(msg, duration = 2500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

// ─── Install Banner ───────────────────────────────────────────────────────────

function isStandalone() {
  return window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
}

function isInstallBannerDismissed() {
  return localStorage.getItem('se_install_dismissed') === '1';
}

function renderInstallBanner() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile || isStandalone() || isInstallBannerDismissed()) return '';
  return `
    <div class="install-banner" onclick="showInstallInstructions()">
      <img src="/apple-touch-icon.png" alt="" class="install-banner-icon">
      <div class="install-banner-text">
        <h1 class="install-banner-h1">Add to your Home Screen</h1>
        <h3 class="install-banner-h3">Access Sacred Engagement with one tap</h3>
      </div>
      <button class="install-banner-dismiss" onclick="event.stopPropagation(); dismissInstallBanner()" aria-label="Dismiss">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `;
}

function dismissInstallBanner() {
  localStorage.setItem('se_install_dismissed', '1');
  const banner = document.querySelector('.install-banner');
  if (banner) { banner.style.opacity = '0'; setTimeout(() => banner.remove(), 300); }
}

function getPlatform() {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

function showInstallInstructions() {
  const platform = getPlatform();
  const steps = {
    ios: [
      { icon: '⬆️', text: 'Tap the <strong>Share</strong> button at the bottom of Safari' },
      { icon: '📲', text: 'Scroll down and tap <strong>"Add to Home Screen"</strong>' },
      { icon: '✅', text: 'Tap <strong>Add</strong> in the top-right corner' },
    ],
    android: [
      { icon: '⋮', text: 'Tap the <strong>three-dot menu</strong> in Chrome\'s top-right corner' },
      { icon: '📲', text: 'Tap <strong>"Add to Home Screen"</strong> or <strong>"Install app"</strong>' },
      { icon: '✅', text: 'Tap <strong>Add</strong> to confirm' },
    ],
    desktop: [
      { icon: '🌐', text: 'Open this page in <strong>Chrome</strong> or <strong>Edge</strong>' },
      { icon: '📲', text: 'Click the <strong>install icon</strong> (⊕) in the address bar' },
      { icon: '✅', text: 'Click <strong>Install</strong> to add it to your desktop' },
    ],
  };

  const platformLabel = { ios: 'iPhone / iPad', android: 'Android', desktop: 'Desktop' }[platform];
  const stepsHtml = steps[platform].map(s => `
    <div class="install-step">
      <span class="install-step-icon">${s.icon}</span>
      <span class="install-step-text">${s.text}</span>
    </div>
  `).join('');

  const modal = document.createElement('div');
  modal.className = 'install-modal-overlay';
  modal.innerHTML = `
    <div class="install-modal" onclick="event.stopPropagation()">
      <div class="install-modal-header">
        <img src="/apple-touch-icon.png" alt="" class="install-modal-icon">
        <div>
          <div class="install-modal-title">Add to Home Screen</div>
          <div class="install-modal-platform">${platformLabel}</div>
        </div>
      </div>
      <div class="install-modal-steps">${stepsHtml}</div>
      <button class="btn-primary" onclick="this.closest('.install-modal-overlay').remove()">Got it</button>
    </div>
  `;
  modal.addEventListener('click', () => modal.remove());
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('open'));
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function playSvg() {
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
}
function pauseSvg() {
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
}
function checkSvg() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
}
function chevronSvg() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
}
function musicSvg() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
}
