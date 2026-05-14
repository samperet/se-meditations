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
  localStorage.removeItem('se_token');
  localStorage.removeItem('se_user');
  document.getElementById('app-screen').classList.remove('visible');
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('user-menu').classList.remove('visible');
}

function toggleUserMenu() {
  document.getElementById('user-menu').classList.toggle('visible');
}

// ─── App Shell ────────────────────────────────────────────────────────────────

async function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').classList.add('visible');

  // Set user avatar initials
  const initial = (currentUser?.name || '?')[0].toUpperCase();
  document.getElementById('user-btn').textContent = initial;
  document.getElementById('user-menu-name').textContent = currentUser?.name || '';

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
        <span class="lesson-tag">Lesson ${lesson.lessonNumber}</span>
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
  const lessonLabel = lesson.isCompanion ? lesson.title : `Lesson ${lesson.lessonNumber}`;
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

function renderBlock(block, blockIndex, lessonId, responses) {
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

function showToast(msg, duration = 2500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
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
