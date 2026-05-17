// ─── State ────────────────────────────────────────────────────────────────────

let token = localStorage.getItem('se_token');
let currentUser = null;
try { currentUser = JSON.parse(localStorage.getItem('se_user')); } catch {}
let allLessons = [];
let currentLessonId = null;
let currentModule = Number(localStorage.getItem('se_module')) || null;
let audioEl = null;
let saveTimers = {};
let navHistory = [];
let playbackRate = 1;
let autoplayNext = false;
let myCohorts = [];
const ADMIN_EMAIL = 'samperet@gmail.com';

const MODULES = [
  { number: 1, name: 'Module 1', subtitle: 'Waking Up',       totalLessons: 42, accent: '#1d6083' },
  { number: 2, name: 'Module 2', subtitle: 'Clearing Away',   totalLessons: 20, accent: '#5c7c62' },
  { number: 3, name: 'Module 3', subtitle: 'Breaking Through', totalLessons: 0,  accent: '#8b6c9e', comingSoon: true },
  { number: 4, name: 'Module 4', subtitle: 'Stepping Into',    totalLessons: 0,  accent: '#b07d56', comingSoon: true },
];

function setCurrentModule(n) {
  currentModule = Number(n);
  localStorage.setItem('se_module', String(currentModule));
}

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
  if (params.has('welcome')) {
    if (token && currentUser) {
      showApp().then(() => showWelcomeOrientation());
    } else {
      document.getElementById('auth-screen').style.display = 'flex';
    }
    return;
  }
  if (params.has('alumni')) {
    if (token && currentUser) {
      showApp().then(() => openAlumniDirectory());
    } else {
      document.getElementById('auth-screen').style.display = 'flex';
    }
    return;
  }
  if (token && currentUser) {
    showApp();
    return;
  }
  // Anonymous users land on the public homepage by default. The "Sign in"
  // link on the welcome page passes ?signin so we still know to show the
  // auth screen when the user explicitly asks for it.
  if (params.has('signin') || params.has('login')) {
    document.getElementById('auth-screen').style.display = 'flex';
    return;
  }
  window.location.replace('/welcome.html');
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
  currentModule = null;
  localStorage.removeItem('se_token');
  localStorage.removeItem('se_user');
  document.getElementById('user-menu').classList.remove('visible');
  // Anonymous users live on the public homepage now.
  window.location.replace('/welcome.html');
}

function toggleUserMenu(event) {
  event?.stopPropagation();
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

  // Keep account access as a menu icon; the user's name appears inside the menu.
  document.getElementById('user-btn').innerHTML = '<span aria-hidden="true"></span>';
  document.getElementById('user-menu-name').textContent = currentUser?.name || '';
  document.getElementById('admin-menu-item').style.display = currentUserIsAdmin() ? 'block' : 'none';
  refreshCohortMenuAccess();

  if (currentModule) {
    await loadHome();
  } else {
    await loadModulePicker();
  }
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
    if (prev.type === 'picker') {
      navHistory = [];
      loadModulePicker();
    } else if (prev.type === 'home') {
      navHistory = [];
      loadHome();
    } else if (prev.type === 'my-cohorts') {
      loadMyCohorts();
    } else if (prev.type === 'profile') {
      loadProfile();
    } else if (prev.type === 'alumni') {
      loadAlumniDirectory();
    } else if (prev.type === 'admin') {
      loadAdminPanel();
    } else if (prev.type === 'admin-users') {
      loadAdminUsers();
    } else if (prev.type === 'admin-cohorts') {
      loadAdminCohorts();
    } else if (prev.type === 'lesson') {
      navHistory.pop();
      loadLesson(prev.id);
    }
  } else {
    // We're already at the topmost in-app screen (the module picker).
    // Take the user out to the public welcome page where upcoming cohorts live.
    window.location.href = '/welcome.html';
  }
}

// ─── Home ─────────────────────────────────────────────────────────────────────

// ─── Additional Resources (Section 2 addendum) ────────────────────────────────
const ADDITIONAL_RESOURCES = [
  { lesson: 'Lesson 1: Noticing Your Inner Patterns', items: [
    { type: 'VIDEO', duration: '66 MIN', author: 'Richard Schwartz', title: 'Getting to Know Our Protectors in IFS', url: 'https://drive.google.com/file/d/1ZgEL-1Fk7fO0yq_dTx3hHvcl-wki5NbC/view?usp=sharing',
      desc: 'The pivotal moment that shaped Internal Family Systems and the idea that every part has a positive intention. At 54 mins he works with the host in a mini demo.',
      why: 'This is one of many conceptual doorways into parts work. Schwartz describes how many parts formed around the need for protection in early life. This perspective is close to several therapeutic models that inform Sacred Engagement.' },
  ]},
  { lesson: 'Lesson 2: Slowing Down the Moment', items: [
    { type: 'QUOTE', author: 'Often attributed to Viktor Frankl', title: '"Between Stimulus and Response There Is a Space"',
      desc: 'A concise reminder that a triggered moment can be slowed down and met more consciously.',
      why: 'This lesson asks learners to slow down a reactive moment. The quote gives simple language for the space you are learning to notice and explore.' },
    { type: 'ARTICLE', duration: '3 MIN', author: 'Brené Brown', title: 'Creating Space', url: 'https://brenebrown.com/articles/2022/05/09/creating-space/',
      desc: 'Brown\'s personal account of learning to pry open the space between stimulus and response, beginning with her sobriety.',
      why: 'Brown describes this practice in a raw, honest, and deeply human way. Her formula, S( )R—stimulus, space, response—is a vivid visual anchor for this lesson\'s practice.' },
    { type: 'BOOK', author: 'Gabor Maté', title: 'The Myth of Normal: Trauma, Illness, and Healing in a Toxic Culture', url: 'https://www.amazon.com/s?k=The+Myth+of+Normal',
      desc: 'Maté\'s comprehensive exploration of how disconnection from the self begins in childhood and shapes our reactive patterns.',
      why: 'Maté writes that trauma is not only what happened, but also the internal disconnection that follows. This lesson is about slowing down enough to see that disconnection in action—the moment when a reaction fires and clear thinking goes offline.' },
  ]},
  { lesson: 'Lesson 3: A Part of Me', items: [
    { type: 'ARTICLE', author: 'Kenneth Sørensen', title: 'Subpersonalities: How Assagioli Conceived and Worked with Them', url: 'https://kennethsorensen.dk/en/subpersonalities-according-to-roberto-assagioli/',
      desc: 'Sørensen\'s synthesis of Assagioli\'s writings on subpersonalities, including their formation, hidden gifts, and transformation.',
      why: 'Sørensen makes an essential point: subpersonalities are not only pathological patterns. They also include the roles we naturally adopt. This broader view can help learners approach their parts with less shame and more curiosity.' },
    { type: 'BOOK', author: 'Piero Ferrucci', title: 'What We May Be: Techniques for Psychological and Spiritual Growth', url: 'https://www.amazon.com/What-May-Techniques-Psychological-Psychosynthesis/dp/1585427268',
      desc: 'An accessible introduction to Psychosynthesis, written by one of Assagioli\'s students. Includes subpersonality exercises.',
      why: 'Ferrucci writes with warmth and literary grace. His chapter on subpersonalities includes the recognition exercise and dialogue technique, both of which mirror the material in the study guide.' },
  ]},
  { lesson: 'Lesson 4: Getting to Know Me', items: [
    { type: 'VIDEO', duration: '15 MIN', author: 'Dr. Gabor Maté', title: 'Compassionate Inquiry', url: 'https://drive.google.com/file/d/1oZbfpceO3cKf3qiWKC34WsTB5ybAtWwP/view?usp=sharing',
      desc: 'A live Zoom session in which Maté guides a volunteer, who has done significant personal development, through a candid exploration of shame and guilt as a parent.',
      why: 'Maté uses questions similar to the ones in these lessons to distinguish early experiences of trauma from the aggravations of current life.' },
  ]},
  { lesson: 'Lesson 5: Dialog', items: [
    { type: 'VIDEO', duration: '50 MIN', author: 'Richard Schwartz', title: 'Real Play: How to Do Internal Family Systems', url: 'https://drive.google.com/file/d/1EJIzE9ns5N9Rfiv5vRhuHUE5iVItykmz/view?usp=sharing',
      desc: 'From 7:30 to 30:00, watch Schwartz guide the host through an actual dialogue with two parts.',
      why: 'Seeing a real dialogue—not a scripted demonstration—models the "tell me more" and perception-checking skills you have been learning. Watch how Schwartz stays curious even when a part says something unexpected.' },
    { type: 'WEBSITE', author: 'Compassionate Inquiry', title: 'Gabor Maté\'s Therapeutic Approach', url: 'https://compassionateinquiry.com/en/',
      desc: 'An overview of Maté\'s Compassionate Inquiry method: gentle questioning that uncovers the core stories we tell ourselves unconsciously.',
      why: 'Maté\'s method closely parallels the dialogue exercise: approach a part with curiosity, ask what it most wants you to understand, and listen without judging the answer. His mantra—"What are you not saying?"—is one of the core questions this dialogue practice is designed to open.' },
  ]},
  { lesson: 'Lesson 6: New Job Posting', items: [
    { type: 'ARTICLE', author: 'Kenneth Sørensen', title: '300+ Psychosynthesis Articles', url: 'https://kennethsorensen.dk/en/category/psychosynthesis-and-psychotherapy/',
      desc: 'Includes translated Assagioli writings on disidentification, the will, and crises of transformation.',
      why: 'Assagioli\'s key insight was that each subpersonality carries an energy that must be transformed, not repressed. That is exactly the "new job posting": you are not firing the part; you are redirecting its energy.' },
  ]},
  { lesson: 'Lesson 7: A Second Round', items: [
    { type: 'VIDEO', duration: '55 MIN', author: 'Richard Schwartz', title: 'No Bad Parts (The Newman Podcast)', url: 'https://drive.google.com/file/d/1QCetHXcBrQXdgv3KUQVKyPrWa26ki6cM/view?usp=sharing',
      desc: 'An in-depth conversation about inner critics, the addiction to achievement, and Self-leadership. Includes a live exploration of the host\'s parts.',
      why: 'Now that learners have met one part deeply, this conversation opens the landscape to the wider ensemble. Schwartz is warm and unhurried. He talks about parts the way you might talk about family members you have come to understand.' },
  ]},
  { lesson: 'Lesson 8: How Parts Push and Pull', items: [
    { type: 'BOOK', author: 'Judson Brewer', title: 'The Craving Mind: From Cigarettes to Smartphones to Love', url: 'https://www.amazon.com/s?k=Judson+Brewer+The+Craving+Mind',
      desc: 'Brewer explains how the brain\'s reward-based learning system creates push-pull dynamics, and how curiosity can interrupt them.',
      why: 'The push-pull between parts often follows the habit loop: trigger, behavior, reward. Brewer\'s framework gives learners a neurological lens for the dynamics they are mapping in this lesson.' },
  ]},
  { lesson: 'Lesson 9: Dissonance Between Parts', items: [
    { type: 'ARTICLE', author: 'James Vargiu', title: 'Subpersonalities and Psychotherapy', url: 'https://kennethsorensen.dk/en/subpersonalities-and-psychotherapy/',
      desc: 'A comprehensive article on the inner dynamics of subpersonalities, including the "board of stockholders" metaphor and the role of the objective observer.',
      why: 'Vargiu introduces the "chairman of the board" metaphor for the unifying Self, anticipating the "conductor" metaphor in the next lesson. His description of parts recruiting each other, forming alliances, and suppressing rivals maps directly onto what learners are discovering.' },
  ]},
  { lesson: 'Lesson 10: The Orchestra Within', items: [
    { type: 'TALK', author: 'Richard Davidson on the podcast "On Being"', title: 'Investigating Healthy Minds', url: 'https://onbeing.org/programs/richard-davidson-investigating-healthy-minds/',
      desc: 'Davidson tells Krista Tippett about his promise to the Dalai Lama to put compassion on the scientific map, and what his research has revealed about the brain\'s capacity for wholeness.',
      why: 'Davidson\'s image of the brain as a plastic organ—capable of reorganizing itself around compassion and awareness—mirrors the conductor\'s role: something in you can reshape how the whole ensemble plays together.' },
    { type: 'MUSIC', author: 'Arvo Pärt', title: 'Spiegel im Spiegel', url: 'https://youtu.be/FZe3mXlnfNc',
      desc: 'Piano and violin in gentle conversation. Extraordinary simplicity and tenderness. (YouTube link — an ad may play before the music.)',
      why: 'Where Beethoven\'s Fifth is the sound of complexity resolving, Pärt\'s piece is the sound of simplicity that was there all along. Listen after the Beethoven with Dudamel; it is what the orchestra sounds like when the conductor rests.' },
  ]},
  { lesson: 'Even More Resources', items: [
    { type: 'WEBSITE + ARTICLES', author: 'Kenneth Sørensen', title: 'What Is Psychosynthesis?', url: 'https://kennethsorensen.dk/en/psychosynthesis/',
      desc: 'A comprehensive overview of Psychosynthesis, including the egg diagram of the psyche, subpersonalities, disidentification, and the relationship between personal and transpersonal growth.',
      why: 'This is the single best starting point for learners new to Psychosynthesis. Sørensen\'s framing echoes the Sacred Engagement study guide: before we can align with something deeper, we must first understand what stands between us and it.' },
    { type: 'FREE E-BOOK', duration: '110 PAGES', author: 'Kenneth Sørensen (ed.)', title: 'Subpersonalities: A Collection of Articles by Roberto Assagioli', url: 'https://kennethsorensen.dk/en/product/subpersonalities-a-collection-of-articles/',
      desc: 'Ten articles by Assagioli on subpersonalities, nine never before published in English, with Sørensen\'s introduction and commentary.',
      why: 'This is a rich resource. Assagioli\'s own voice is warm, practical, and remarkably modern as he describes how to recognize subpersonalities. His observation that the concept can be introduced by simply asking, "Have you noticed you behave differently at work, at home, in solitude?" is exactly how the study guide opens Section 2.' },
    { type: 'ARTICLE', author: 'IFS Institute', title: 'The Internal Family Systems Model Outline', url: 'https://ifs-institute.com/resources/articles/internal-family-systems-model-outline',
      desc: 'A concise, theoretical overview of parts work, Self-leadership, and the goals of Internal Family Systems.',
      why: 'This is a clean conceptual map for learners who orient through structure. Keep it nearby as a reference throughout the section; it can help you name what you are experiencing.' },
    { type: 'ACADEMIC PAPER', title: 'Psychosynthesis: A Foundational Bridge Between Psychology and Spirituality', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5493721/',
      desc: 'An academic paper exploring how Psychosynthesis integrates psychological and spiritual growth.',
      why: 'For learners who want the deeper theoretical roots, this paper shows how Assagioli\'s vision—that each subpersonality holds a higher quality at its core—anticipates the "gift inside the pattern" work that will come in Section 3.' },
    { type: 'PODCAST', author: 'Henry Shukman on Tim Ferriss', title: 'Zen, Tools for Awakening, and Using Wounds as the Doorway', url: 'https://tim.blog/2021/09/08/henry-shukman/',
      desc: 'Shukman describes how his early wounds became a doorway into practice, and how meeting difficult parts of himself became part of the path rather than an obstacle to it.',
      why: 'The podcast covers many aspects of Shukman\'s life. As you listen, notice the different parts of him that appear in his story and how he includes them in his description of the journey. He points to the same invitation offered in this lesson: getting to know a part so well that it stops being a problem and begins to become a teacher.' },
  ]},
];

function loadAdditionalResources() {
  stopAudio();
  currentLessonId = null;
  navHistory = [{ type: 'home' }, { type: 'resources' }];
  setHeader('Additional Resources', true);
  setContent(renderAdditionalResourcesPage());
  window.scrollTo(0, 0);
}

function renderAdditionalResourcesPage() {
  return `
    <div class="resources-page">
      <div class="resources-hero">
        <div class="resources-eyebrow">Section 2 Addendum</div>
        <h2 class="resources-title">Additional Resources</h2>
        <div class="resources-subtitle">Section 2: Meeting the Voices Within</div>
        <div class="resources-subtitle-italic">Getting to know the patterns, protectors, and players inside you.</div>
        <p class="resources-intro">These optional resources offer additional ways to understand the inner patterns and parts you are meeting in Section 2. Some come from traditions closely related to Sacred Engagement, especially Psychosynthesis and Internal Family Systems. Others approach healthy, fulfilled living from different perspectives. Each resource offers another angle on the inner multiplicity we each carry.</p>
        <div class="resources-pause">
          <p><em>Before you click on these links or turn to these resources, pause and take a breath.</em></p>
          <p>Then gently notice what is moving you toward them. Is it simple curiosity? A wish for companionship on the path? Or is there also a subtle belief that you are incomplete, flawed, or in need of something more before you can trust your own experience as sufficient?</p>
          <p>There is no wrong answer. The invitation is simply to reach for these resources consciously, rather than reflexively.</p>
        </div>
        <p class="resources-intro">The idea of working with inner parts, or "subpersonalities," was developed by Roberto Assagioli in the early 1900s. Psychosynthesis became one of the early Western frameworks to treat inner multiplicity as normal, workable, and potentially healthy. It includes both the depth areas of psychology and the heights of human experience. Richard Schwartz's Internal Family Systems (IFS) is one path that builds on this lineage of parts work.</p>
      </div>
      ${ADDITIONAL_RESOURCES.map(group => `
        <div class="resource-group">
          <h3 class="resource-group-title">${escHtml(group.lesson)}</h3>
          ${group.items.map(item => renderResourceItem(item)).join('')}
        </div>
      `).join('')}
      <div style="height:32px"></div>
    </div>
  `;
}

function renderResourceItem(item) {
  const titleBlock = item.url
    ? `<a class="resource-title" href="${escAttr(item.url)}" target="_blank" rel="noopener noreferrer">${escHtml(item.title)}</a>`
    : `<span class="resource-title">${escHtml(item.title)}</span>`;
  return `
    <div class="resource-item">
      <div class="resource-badges">
        <span class="resource-type">${escHtml(item.type)}</span>
        ${item.duration ? `<span class="resource-duration">${escHtml(item.duration)}</span>` : ''}
      </div>
      ${item.author ? `<div class="resource-author">${escHtml(item.author)}</div>` : ''}
      <div class="resource-title-wrap">${titleBlock}</div>
      <p class="resource-desc">${escHtml(item.desc)}</p>
      <p class="resource-why"><strong>Why this resource:</strong> ${escHtml(item.why)}</p>
    </div>
  `;
}

async function loadModulePicker() {
  stopAudio();
  currentLessonId = null;
  navHistory = [{ type: 'picker' }];
  // Show the back button on the picker — it takes signed-in users out to
  // the public welcome/homepage where upcoming cohorts are listed.
  setHeader('Sacred Engagement', true);
  setContent('<div class="loading-screen"><div class="spinner"></div></div>');

  try {
    const lessons = await api('GET', '/api/lessons');
    renderModulePicker(lessons);
  } catch (err) {
    setContent(`<div class="loading-screen"><p>Could not load modules. Please try again.</p></div>`);
  }
}

function renderModulePicker(lessons) {
  const firstName = (currentUser?.name || '').split(' ')[0];

  // Find the most useful "continue" candidate. Prefer the most recently active module,
  // and within it prefer the last lesson the user actually opened. Fall back to the
  // first incomplete lesson.
  let continueCard = '';
  const candidateModules = [];
  if (currentModule) candidateModules.push(currentModule);
  MODULES.forEach(m => { if (!candidateModules.includes(m.number)) candidateModules.push(m.number); });
  for (const modNum of candidateModules) {
    const mod = MODULES.find(m => m.number === modNum);
    const moduleLessons = lessons.filter(l => Number(l.moduleNumber) === modNum && !l.isCompanion);
    const lastLessonId = localStorage.getItem(`se_last_lesson_${modNum}`);
    const lastLesson = lastLessonId && moduleLessons.find(l => l.id === lastLessonId);
    const firstIncomplete = moduleLessons.find(l => !l.completed);
    // Prefer the last lesson they touched (even if marked complete — they might be revisiting)
    const next = lastLesson || firstIncomplete;
    const hasProgress = !!lastLesson || moduleLessons.some(l => l.completed);
    if (hasProgress && next) {
      const eyebrow = modNum === 1
        ? `${mod.name} · Week ${next.sectionId} · Day ${next.lessonNumber}`
        : `${mod.name} · Section ${next.sectionId} · Lesson ${next.lessonNumber}`;
      continueCard = `
        <div class="continue-card" onclick="resumeLesson(${modNum}, '${next.id}')">
          <div class="continue-info">
            <div class="continue-eyebrow">${escHtml(eyebrow)}</div>
            <div class="continue-title">${escHtml(next.title)}</div>
            <div class="continue-sub">Continue where you left off</div>
          </div>
          <button class="continue-play-btn" aria-label="Play" onclick="event.stopPropagation(); resumeLesson(${modNum}, '${next.id}')">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
      `;
      break;
    }
  }

  const cards = MODULES.map(m => {
    if (m.comingSoon) {
      return `
        <div class="module-card coming-soon" style="--accent:${m.accent}">
          <div class="module-card-eyebrow">${escHtml(m.name)}</div>
          <div class="module-card-title">${escHtml(m.subtitle)}</div>
          <div class="module-card-cta coming-soon-label">Coming soon</div>
        </div>
      `;
    }
    const moduleLessons = lessons.filter(l => Number(l.moduleNumber) === m.number && !l.isCompanion);
    const done = moduleLessons.filter(l => l.completed).length;
    const total = moduleLessons.length || m.totalLessons;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const status = done === 0 ? 'Begin journey' : done === total ? 'Complete ✓' : 'Continue';
    return `
      <button class="module-card" style="--accent:${m.accent}" onclick="enterModule(${m.number})">
        <div class="module-card-eyebrow">${escHtml(m.name)}</div>
        <div class="module-card-title">${escHtml(m.subtitle)}</div>
        <div class="module-card-progress">
          <div class="module-card-progress-track"><div class="module-card-progress-fill" style="width:${pct}%;background:${m.accent}"></div></div>
          <div class="module-card-progress-text">${done} of ${total} lessons</div>
        </div>
        <div class="module-card-cta">${status} <span class="module-card-arrow">→</span></div>
      </button>
    `;
  }).join('');
  setContent(`
    <div class="picker-page">
      <div class="picker-hero">
        <img src="/logo.png" alt="Sacred Engagement" class="picker-logo">
        <div class="picker-greeting">Welcome${firstName ? `, ${escHtml(firstName)}` : ''}</div>
        <div class="picker-sub">${continueCard ? '' : 'Choose a module to continue'}</div>
      </div>
      ${continueCard || ''}
      <div class="module-cards">${cards}</div>
      <div style="height:32px"></div>
    </div>
  `);
}

async function resumeLesson(modNum, lessonId) {
  setCurrentModule(modNum);
  setContent('<div class="loading-screen"><div class="spinner"></div></div>');
  try {
    allLessons = await api('GET', `/api/lessons?module=${modNum}`);
    await loadLesson(lessonId);
  } catch (err) {
    setContent(`<div class="loading-screen"><p>Could not load lesson.</p></div>`);
  }
}

function enterModule(n) {
  setCurrentModule(n);
  loadHome();
}

function switchModule() {
  document.getElementById('user-menu')?.classList.remove('visible');
  loadModulePicker();
}

async function loadHome() {
  stopAudio();
  currentLessonId = null;
  if (!currentModule) return loadModulePicker();
  navHistory = [{ type: 'picker' }, { type: 'home' }];
  setHeader('Sacred Engagement', true);
  setContent('<div class="loading-screen"><div class="spinner"></div></div>');

  try {
    allLessons = await api('GET', `/api/lessons?module=${currentModule}`);
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
    const [facilitatorCohorts, enrollments] = await Promise.all([
      api('GET', '/api/my/cohorts'),
      api('GET', '/api/my/enrollments').catch(() => []),
    ]);
    myCohorts = facilitatorCohorts;
    document.getElementById('cohorts-menu-item').style.display =
      currentUserCanManageCohorts() || myCohorts.length ? 'block' : 'none';
    document.getElementById('my-cohorts-menu-item').style.display =
      (enrollments && enrollments.length) ? 'block' : 'none';
  } catch {
    document.getElementById('cohorts-menu-item').style.display = currentUserCanManageCohorts() ? 'block' : 'none';
    document.getElementById('my-cohorts-menu-item').style.display = 'none';
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
    renderAdminDashboard(users, cohorts);
  } catch (err) {
    setContent(`<div class="loading-screen"><p>${escHtml(err.message || 'Could not load admin panel.')}</p></div>`);
  }
}

function renderAdminDashboard(users, cohorts) {
  const adminCount = users.filter(u => u.isAdmin).length;
  const facilitatorCount = users.filter(u => u.isFacilitator).length;
  const activeCohorts = cohorts.filter(c => !c.endDate || new Date(c.endDate) >= new Date());
  const totalParticipants = cohorts.reduce((sum, c) => sum + (c.participants?.length || 0), 0);
  setContent(`
    <div class="admin-page">
      <div class="admin-hero">
        <div class="admin-eyebrow">Admin</div>
        <div class="admin-title">Dashboard</div>
        <div class="admin-copy">Manage users, cohorts, and program settings.</div>
      </div>

      <div class="admin-summary">
        <div class="admin-stat">
          <div class="admin-stat-label">Users</div>
          <div class="admin-stat-value">${users.length}</div>
        </div>
        <div class="admin-stat">
          <div class="admin-stat-label">Facilitators</div>
          <div class="admin-stat-value">${facilitatorCount}</div>
        </div>
        <div class="admin-stat">
          <div class="admin-stat-label">Active Cohorts</div>
          <div class="admin-stat-value">${activeCohorts.length}</div>
        </div>
        <div class="admin-stat">
          <div class="admin-stat-label">Enrolled</div>
          <div class="admin-stat-value">${totalParticipants}</div>
        </div>
      </div>

      <div class="admin-nav-cards">
        <button class="admin-nav-card" onclick="loadAdminUsers()">
          <div class="admin-nav-card-icon">👤</div>
          <div class="admin-nav-card-label">Users</div>
          <div class="admin-nav-card-desc">${users.length} registered · ${adminCount} admins</div>
        </button>
        <button class="admin-nav-card" onclick="loadAdminCohorts()">
          <div class="admin-nav-card-icon">📋</div>
          <div class="admin-nav-card-label">Cohorts</div>
          <div class="admin-nav-card-desc">${cohorts.length} total · ${activeCohorts.length} active</div>
        </button>
      </div>
    </div>
  `);
}

// ─── Admin: Users sub-view ───────────────────────────────────────────────────

async function loadAdminUsers() {
  navHistory = [{ type: 'home' }, { type: 'admin' }, { type: 'admin-users' }];
  setHeader('Users', true);
  setContent('<div class="loading-screen"><div class="spinner"></div></div>');
  try {
    const users = await api('GET', '/api/admin/users');
    renderAdminUsers(users);
  } catch (err) {
    setContent(`<div class="loading-screen"><p>${escHtml(err.message || 'Could not load users.')}</p></div>`);
  }
}

function renderAdminUsers(users) {
  const adminCount = users.filter(u => u.isAdmin).length;
  const facilitatorCount = users.filter(u => u.isFacilitator).length;
  setContent(`
    <div class="admin-page">
      <div class="admin-hero">
        <div class="admin-eyebrow">Admin</div>
        <div class="admin-title">Users</div>
        <div class="admin-copy">${users.length} registered users · ${adminCount} admins · ${facilitatorCount} facilitators</div>
      </div>
      <div class="admin-user-list">
        ${users.map(renderAdminUserCard).join('')}
      </div>
    </div>
  `);
}

// ─── Admin: Cohorts sub-view ─────────────────────────────────────────────────

async function loadAdminCohorts() {
  navHistory = [{ type: 'home' }, { type: 'admin' }, { type: 'admin-cohorts' }];
  setHeader('Cohorts', true);
  setContent('<div class="loading-screen"><div class="spinner"></div></div>');
  try {
    const cohorts = await api('GET', '/api/admin/cohorts');
    renderAdminCohorts(cohorts);
  } catch (err) {
    setContent(`<div class="loading-screen"><p>${escHtml(err.message || 'Could not load cohorts.')}</p></div>`);
  }
}

function renderAdminCohorts(cohorts) {
  setContent(`
    <div class="admin-page">
      <div class="admin-hero">
        <div class="admin-eyebrow">Admin</div>
        <div class="admin-title">Cohorts</div>
        <div class="admin-copy">Create, edit, and manage cohorts.</div>
      </div>

      <div class="admin-section-title">
        Add New Cohort
        <button class="admin-toggle-btn" id="add-cohort-toggle" onclick="toggleAddCohortForm()">+ New</button>
      </div>
      <div id="add-cohort-form-wrap" style="display:none">
        ${renderCohortForm('new', [], null)}
      </div>

      <div class="admin-section-title">${cohorts.length} Cohort${cohorts.length !== 1 ? 's' : ''}</div>
      <div class="cohort-list">
        ${cohorts.length ? cohorts.map(cohort => renderAdminCohortCard(cohort)).join('') : '<div class="admin-user-card">No cohorts have been created yet.</div>'}
      </div>
    </div>
  `);
}

function toggleAddCohortForm() {
  const wrap = document.getElementById('add-cohort-form-wrap');
  if (!wrap) return;
  const isHidden = wrap.style.display === 'none';
  wrap.style.display = isHidden ? 'block' : 'none';
  document.getElementById('add-cohort-toggle').textContent = isHidden ? '− Cancel' : '+ New';
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

// ─── Session state (keyed by form prefix) ──────────────────────────────────────
const cohortSessionsMap = {};

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York',    label: 'Eastern (New York)' },
  { value: 'America/Chicago',     label: 'Central (Chicago)' },
  { value: 'America/Denver',      label: 'Mountain (Denver)' },
  { value: 'America/Los_Angeles', label: 'Pacific (Los Angeles)' },
  { value: 'America/Anchorage',   label: 'Alaska (Anchorage)' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii (Honolulu)' },
  { value: 'Europe/London',       label: 'United Kingdom (London)' },
  { value: 'Europe/Paris',        label: 'Central Europe (Paris)' },
  { value: 'Asia/Tokyo',          label: 'Japan (Tokyo)' },
  { value: 'Australia/Sydney',    label: 'Sydney' },
  { value: 'UTC',                 label: 'UTC' },
];

function initSessions(prefix, cohort) {
  cohortSessionsMap[prefix] = (cohort?.sessions || []).map(s => ({ ...s }));
}

function saveSessionInputs(prefix) {
  (cohortSessionsMap[prefix] || []).forEach((s, i) => {
    s.day      = document.getElementById(`${prefix}-s${i}-day`)?.value  || '';
    s.startTime= document.getElementById(`${prefix}-s${i}-time`)?.value || '';
    s.duration = document.getElementById(`${prefix}-s${i}-dur`)?.value  || '';
    s.meetingLink = document.getElementById(`${prefix}-s${i}-link`)?.value || '';
  });
}

function buildSessionsHTML(prefix) {
  const sessions = cohortSessionsMap[prefix] || [];
  if (!sessions.length) return '<div class="session-empty">No sessions yet.</div>';
  return sessions.map((s, i) => `
    <div class="session-row">
      <div class="session-row-header">
        <span class="session-row-num">Session ${i + 1}</span>
        <div class="session-row-actions">
          <button type="button" class="session-action-btn" onclick="duplicateCohortSession('${prefix}',${i})">Duplicate</button>
          <button type="button" class="session-remove-btn" onclick="removeCohortSession('${prefix}',${i})" aria-label="Remove">×</button>
        </div>
      </div>
      <div class="session-fields">
        <label class="session-label">Date<input type="date" id="${prefix}-s${i}-day" value="${escAttr(s.day || '')}"></label>
        <label class="session-label">Start time<input type="time" id="${prefix}-s${i}-time" value="${escAttr(s.startTime || '')}" step="900"></label>
        <label class="session-label">Duration (min)<input type="number" id="${prefix}-s${i}-dur" value="${escAttr(String(s.duration || '90'))}" min="1" placeholder="90"></label>
        <label class="session-label session-link-field">Meeting link<input type="url" id="${prefix}-s${i}-link" value="${escAttr(s.meetingLink || '')}" placeholder="https://zoom.us/j/..."></label>
      </div>
    </div>
  `).join('');
}

function refreshSessionsUI(prefix) {
  const wrap = document.getElementById(`${prefix}-sessions-inner`);
  if (wrap) wrap.innerHTML = buildSessionsHTML(prefix);
}

function addCohortSession(prefix) {
  saveSessionInputs(prefix);
  if (!cohortSessionsMap[prefix]) cohortSessionsMap[prefix] = [];
  cohortSessionsMap[prefix].push({ day: '', startTime: '', duration: '90', meetingLink: '' });
  refreshSessionsUI(prefix);
}

function duplicateCohortSession(prefix, idx) {
  saveSessionInputs(prefix);
  const list = cohortSessionsMap[prefix] || [];
  const src = list[idx];
  if (!src) return;
  list.splice(idx + 1, 0, { ...src });
  refreshSessionsUI(prefix);
}

function removeCohortSession(prefix, idx) {
  saveSessionInputs(prefix);
  (cohortSessionsMap[prefix] || []).splice(idx, 1);
  refreshSessionsUI(prefix);
}

// ─── Member search state (keyed by field id, e.g. "edit-123-facilitators") ────
const memberSelectMap = {};

function initMemberSelect(fieldId, members) {
  memberSelectMap[fieldId] = {};
  (members || []).forEach(u => {
    memberSelectMap[fieldId][String(u.id)] = { id: u.id, name: u.name, email: u.email };
  });
}

function addMember(fieldId, user) {
  if (!memberSelectMap[fieldId]) memberSelectMap[fieldId] = {};
  memberSelectMap[fieldId][String(user.id)] = { id: user.id, name: user.name, email: user.email };
  refreshMemberChips(fieldId);
  // Clear the search input and results
  const input = document.getElementById(`${fieldId}-search`);
  if (input) input.value = '';
  const results = document.getElementById(`${fieldId}-results`);
  if (results) results.innerHTML = '';
}

function removeMember(fieldId, userId) {
  if (memberSelectMap[fieldId]) delete memberSelectMap[fieldId][String(userId)];
  refreshMemberChips(fieldId);
}

function getMemberIds(fieldId) {
  return Object.keys(memberSelectMap[fieldId] || {});
}

function refreshMemberChips(fieldId) {
  const wrap = document.getElementById(`${fieldId}-chips`);
  if (!wrap) return;
  const members = Object.values(memberSelectMap[fieldId] || {});
  wrap.innerHTML = members.length
    ? members.map(u => `
        <span class="member-chip">
          ${escHtml(u.name)}
          <button type="button" class="member-chip-remove" onclick="removeMember('${fieldId}', '${String(u.id)}')" aria-label="Remove">×</button>
        </span>
      `).join('')
    : '<span class="member-chip-empty">None added yet</span>';
}

let memberSearchTimer = null;
function handleMemberSearch(fieldId, query, filterFacilitators) {
  clearTimeout(memberSearchTimer);
  const results = document.getElementById(`${fieldId}-results`);
  if (!results) return;
  const q = query.trim();
  if (q.length < 2) { results.innerHTML = ''; return; }
  memberSearchTimer = setTimeout(async () => {
    try {
      let users = await api('GET', `/api/cohort-manager/users?q=${encodeURIComponent(q)}`);
      if (filterFacilitators) users = users.filter(u => u.isFacilitator);
      // Hide already-selected users
      const selected = memberSelectMap[fieldId] || {};
      users = users.filter(u => !selected[String(u.id)]);
      if (!users.length) {
        results.innerHTML = '<div class="member-search-empty">No matching users</div>';
        return;
      }
      results.innerHTML = users.map(u => `
        <button type="button" class="member-search-result" onclick="addMember('${fieldId}', ${escAttr(JSON.stringify({id:u.id,name:u.name,email:u.email}))})">
          <span class="member-search-name">${escHtml(u.name)}</span>
          <span class="member-search-email">${escHtml(u.email)}</span>
        </button>
      `).join('');
    } catch {
      results.innerHTML = '<div class="member-search-empty">Search failed</div>';
    }
  }, 250);
}

function renderMemberSearchField(fieldId, label, filterFacilitators = false) {
  return `
    <div class="member-search-field">
      <div class="member-chips" id="${fieldId}-chips"></div>
      <div class="member-search-wrap">
        <input type="text" class="member-search-input" id="${fieldId}-search"
          placeholder="Search by name or email…"
          autocomplete="off"
          oninput="handleMemberSearch('${fieldId}', this.value, ${filterFacilitators})">
        <div class="member-search-results" id="${fieldId}-results"></div>
      </div>
    </div>
  `;
}

function renderCohortForm(prefix, users, cohort = null, options = {}) {
  const createHandler = options.createHandler || 'createCohort';
  initSessions(prefix, cohort);
  // Initialize member select state
  initMemberSelect(`${prefix}-facilitators`, cohort?.facilitators || []);
  initMemberSelect(`${prefix}-participants`, cohort?.participants || []);
  const html = `
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
          Timezone
          <select id="${prefix}-timezone" required>
            ${TIMEZONE_OPTIONS.map(tz => `<option value="${tz.value}" ${(cohort?.timezone || 'America/New_York') === tz.value ? 'selected' : ''}>${tz.label}</option>`).join('')}
          </select>
        </label>
        <div class="admin-field full">
          <div class="sessions-header">
            Sessions
            <button type="button" class="session-add-btn" onclick="addCohortSession('${prefix}')">+ Add Session</button>
          </div>
          <div class="sessions-list" id="${prefix}-sessions-inner">
            ${buildSessionsHTML(prefix)}
          </div>
        </div>
        <div class="admin-field full">
          Facilitators
          ${renderMemberSearchField(`${prefix}-facilitators`, 'Facilitators', true)}
        </div>
        <div class="admin-field full">
          Participants
          ${renderMemberSearchField(`${prefix}-participants`, 'Participants', false)}
        </div>
      </div>
      <div class="admin-form-actions">
        <button class="admin-reset-btn" type="submit">${cohort ? 'Update Cohort' : 'Create Cohort'}</button>
        ${cohort ? `<button class="admin-secondary-btn" type="button" onclick="toggleCohortEdit('${String(cohort.id)}')">Cancel</button>` : ''}
      </div>
    </form>
  `;
  // Schedule chip rendering after DOM is available
  setTimeout(() => {
    refreshMemberChips(`${prefix}-facilitators`);
    refreshMemberChips(`${prefix}-participants`);
  }, 0);
  return html;
}

function renderAdminCohortCard(cohort) {
  const facilitators = formatUserNames(cohort.facilitators);
  const participantCount = (cohort.participants || []).length;
  const id = String(cohort.id);
  const isPast = cohort.endDate && new Date(cohort.endDate) < new Date();
  return `
    <div class="cohort-card ${isPast ? 'cohort-past' : ''}">
      <div class="cohort-card-top">
        <div>
          <div class="cohort-card-title">Module ${cohort.moduleNumber}: ${escHtml(cohort.name)}</div>
          <div class="cohort-meta">${formatCohortDates(cohort)} · ${escHtml(cohort.meetingDay)} at ${escHtml(cohort.meetingTime)} ${escHtml(cohort.timezone)}</div>
        </div>
        ${isPast ? '<span class="my-cohort-badge completed">Completed</span>' : '<span class="my-cohort-badge active">Active</span>'}
      </div>
      <div class="cohort-member-line"><strong>Facilitators:</strong> ${escHtml(facilitators)}</div>
      <div class="cohort-member-line"><strong>Participants:</strong> ${participantCount}</div>
      <div class="admin-form-actions">
        <button class="admin-secondary-btn" onclick="toggleCohortEdit('${id}')">Edit</button>
        <button class="admin-danger-btn" onclick="deleteCohort('${id}', '${escAttr(cohort.name)}')">Delete</button>
      </div>
      <div class="cohort-edit" id="cohort-edit-${id}">
        ${renderCohortForm(`edit-${id}`, [], cohort)}
      </div>
    </div>
  `;
}

function getCohortFormData(prefix) {
  saveSessionInputs(prefix);
  const sessions = (cohortSessionsMap[prefix] || []).filter(s => s.day || s.meetingLink);
  const sortedDays = sessions.map(s => s.day).filter(Boolean).sort();
  const firstWithTime = sessions.find(s => s.startTime);
  const firstDay = sortedDays[0];
  const meetingDay = firstDay
    ? new Date(firstDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }) + 's'
    : '';
  return {
    name: document.getElementById(`${prefix}-name`).value,
    moduleNumber: document.getElementById(`${prefix}-module`).value,
    startDate: sortedDays[0] || '',
    endDate: sortedDays[sortedDays.length - 1] || '',
    meetingDay,
    meetingTime: firstWithTime?.startTime || '',
    timezone: document.getElementById(`${prefix}-timezone`).value,
    facilitatorIds: getMemberIds(`${prefix}-facilitators`),
    participantIds: getMemberIds(`${prefix}-participants`),
    sessions,
  };
}

async function createCohort(event) {
  event.preventDefault();
  try {
    await api('POST', '/api/admin/cohorts', getCohortFormData('new'));
    showToast('Cohort created.');
    await loadAdminCohorts();
  } catch (err) {
    showToast(err.message || 'Could not create cohort.');
  }
}

async function updateCohort(event, cohortId) {
  event.preventDefault();
  try {
    await api('PUT', `/api/admin/cohorts/${encodeURIComponent(cohortId)}`, getCohortFormData(`edit-${cohortId}`));
    showToast('Cohort updated.');
    await loadAdminCohorts();
  } catch (err) {
    showToast(err.message || 'Could not update cohort.');
  }
}

async function deleteCohort(cohortId, name) {
  if (!confirm(`Delete cohort "${name}"? This cannot be undone.`)) return;
  try {
    await api('DELETE', `/api/admin/cohorts/${encodeURIComponent(cohortId)}`);
    showToast('Cohort deleted.');
    await loadAdminCohorts();
  } catch (err) {
    showToast(err.message || 'Could not delete cohort.');
  }
}

function toggleCohortEdit(cohortId) {
  document.getElementById(`cohort-edit-${cohortId}`)?.classList.toggle('visible');
}

async function makeUserAdmin(userId) {
  try {
    await api('POST', `/api/admin/users/${encodeURIComponent(userId)}/make-admin`);
    showToast('User is now an admin.');
    await loadAdminUsers();
  } catch (err) {
    showToast(err.message || 'Could not update admin access.');
  }
}

async function makeUserFacilitator(userId) {
  try {
    await api('POST', `/api/admin/users/${encodeURIComponent(userId)}/make-facilitator`);
    showToast('User is now a facilitator.');
    await loadAdminUsers();
  } catch (err) {
    showToast(err.message || 'Could not update facilitator access.');
  }
}

async function deleteUser(userId, name) {
  if (!confirm(`Delete ${name}? This will permanently remove their account and all their data.`)) return;
  try {
    await api('DELETE', `/api/admin/users/${encodeURIComponent(userId)}`);
    showToast(`${name} has been deleted.`);
    await loadAdminUsers();
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

// ─── My Cohorts (participant view) ─────────────────────────────────────────────

async function openMyCohorts() {
  document.getElementById('user-menu').classList.remove('visible');
  await loadMyCohorts();
}

async function loadMyCohorts() {
  stopAudio();
  currentLessonId = null;
  navHistory = [{ type: 'home' }, { type: 'my-cohorts' }];
  setHeader('My Cohorts', true);
  setContent('<div class="loading-screen"><div class="spinner"></div></div>');
  try {
    const enrollments = await api('GET', '/api/my/enrollments');
    renderMyCohorts(enrollments || []);
  } catch (err) {
    setContent(`<div class="loading-screen"><p>Could not load your cohorts.</p></div>`);
  }
}

function renderMyCohorts(cohorts) {
  const now = new Date();
  const active = cohorts.filter(c => !c.endDate || new Date(c.endDate) >= now);
  const completed = cohorts.filter(c => c.endDate && new Date(c.endDate) < now);

  if (!cohorts.length) {
    setContent(`
      <div class="my-cohorts-page">
        <div class="my-cohorts-hero">
          <div class="my-cohorts-eyebrow">Cohorts</div>
          <div class="my-cohorts-title">My Cohorts</div>
          <div class="my-cohorts-sub">You haven't joined any cohorts yet.</div>
        </div>
        <div class="my-cohorts-empty">
          <div class="my-cohorts-empty-icon">✦</div>
          <div class="my-cohorts-empty-msg">Visit the <a href="/welcome.html" class="my-cohorts-link">homepage</a> to browse upcoming cohorts and enroll.</div>
        </div>
      </div>
    `);
    return;
  }

  const activeHtml = active.length ? `
    <div class="my-cohorts-section">
      <div class="my-cohorts-section-label">Active & Upcoming</div>
      <div class="my-cohorts-list">${active.map(c => renderMyCohortCard(c, false)).join('')}</div>
    </div>
  ` : '';

  const completedHtml = completed.length ? `
    <div class="my-cohorts-section">
      <div class="my-cohorts-section-label">Completed</div>
      <div class="my-cohorts-list">${completed.map(c => renderMyCohortCard(c, true)).join('')}</div>
    </div>
  ` : '';

  setContent(`
    <div class="my-cohorts-page">
      <div class="my-cohorts-hero">
        <div class="my-cohorts-eyebrow">Cohorts</div>
        <div class="my-cohorts-title">My Cohorts</div>
        <div class="my-cohorts-sub">Your enrolled cohorts and fellow participants.</div>
      </div>
      ${activeHtml}
      ${completedHtml}
    </div>
  `);
}

function renderMyCohortCard(cohort, isCompleted) {
  const facilitatorNames = (cohort.facilitators || []).map(u => u.name).filter(Boolean);
  const participantNames = (cohort.participants || []).map(u => u.name).filter(Boolean);
  const nextSession = isCompleted ? null : getNextSession(cohort);

  const nextSessionHtml = nextSession ? `
    <div class="my-cohort-next-session">
      <span class="my-cohort-next-label">Next session:</span>
      ${formatDateOnly(nextSession.day)} at ${escHtml(nextSession.startTime || '')}
      ${nextSession.meetingLink ? `<a href="${escAttr(nextSession.meetingLink)}" target="_blank" rel="noopener noreferrer" class="my-cohort-zoom-link">Join →</a>` : ''}
    </div>
  ` : '';

  const statusBadge = isCompleted
    ? '<span class="my-cohort-badge completed">Completed</span>'
    : '<span class="my-cohort-badge active">Active</span>';

  return `
    <div class="my-cohort-card ${isCompleted ? 'completed' : ''}">
      <div class="my-cohort-card-header">
        <div>
          <div class="my-cohort-card-title">Module ${cohort.moduleNumber}: ${escHtml(cohort.name)}</div>
          <div class="my-cohort-card-meta">${formatCohortDates(cohort)} · ${escHtml(cohort.meetingDay || '')} at ${escHtml(cohort.meetingTime || '')} ${escHtml(cohort.timezone || '')}</div>
        </div>
        ${statusBadge}
      </div>
      ${nextSessionHtml}
      <div class="my-cohort-people">
        <div class="my-cohort-people-group">
          <div class="my-cohort-people-label">Facilitator${facilitatorNames.length !== 1 ? 's' : ''}</div>
          <div class="my-cohort-people-names">${facilitatorNames.length ? facilitatorNames.map(n => `<span class="my-cohort-person">${escHtml(n)}</span>`).join('') : '<span class="my-cohort-person muted">To be announced</span>'}</div>
        </div>
        <div class="my-cohort-people-group">
          <div class="my-cohort-people-label">Participants (${participantNames.length})</div>
          <div class="my-cohort-people-names">${participantNames.length ? participantNames.map(n => `<span class="my-cohort-person">${escHtml(n)}</span>`).join('') : '<span class="my-cohort-person muted">No participants yet</span>'}</div>
        </div>
      </div>
      <button class="my-cohort-directory-btn" onclick="openMemberDirectory('${String(cohort.id)}')">View Member Directory →</button>
    </div>
  `;
}

// ─── Profile ───────────────────────────────────────────────────────────────────

async function openProfile() {
  document.getElementById('user-menu').classList.remove('visible');
  await loadProfile();
}

async function loadProfile() {
  stopAudio();
  currentLessonId = null;
  navHistory = [{ type: 'home' }, { type: 'profile' }];
  setHeader('My Profile', true);
  setContent('<div class="loading-screen"><div class="spinner"></div></div>');
  try {
    const me = await api('GET', '/api/me');
    renderProfile(me);
  } catch (err) {
    setContent(`<div class="loading-screen"><p>Could not load profile.</p></div>`);
  }
}

function renderProfile(me) {
  const avatarHtml = me.avatarUrl
    ? `<img src="${escAttr(me.avatarUrl)}" class="profile-avatar-img" alt="">`
    : `<div class="profile-avatar-placeholder">${escHtml((me.name || '?')[0].toUpperCase())}</div>`;
  const modBadges = (me.completedModules || []).map(m =>
    `<span class="profile-mod-badge">Module ${m} ✓</span>`
  ).join('') || '<span class="profile-mod-none">No modules completed yet</span>';

  setContent(`
    <div class="profile-page">
      <div class="profile-hero">
        <div class="profile-avatar-wrap" onclick="document.getElementById('avatar-input').click()">
          ${avatarHtml}
          <div class="profile-avatar-edit">Edit</div>
          <input type="file" id="avatar-input" accept="image/*" style="display:none" onchange="uploadAvatar(this)">
        </div>
        <div class="profile-name">${escHtml(me.name)}</div>
        <div class="profile-email">${escHtml(me.email)}</div>
        ${me.isFacilitator ? '<div class="profile-role-badge">Facilitator</div>' : ''}
        <div class="profile-mod-badges">${modBadges}</div>
      </div>

      <div class="profile-section">
        <label class="profile-label">About me</label>
        <textarea class="profile-bio-input" id="profile-bio" maxlength="500" placeholder="Write a short bio that other participants can see…">${escHtml(me.bio || '')}</textarea>
        <div class="profile-bio-footer">
          <span class="profile-bio-count" id="bio-count">${(me.bio || '').length}/500</span>
          <button class="profile-save-btn" id="profile-save-btn" onclick="saveProfile()">Save</button>
        </div>
      </div>
    </div>
  `);
  // Wire up character count
  document.getElementById('profile-bio')?.addEventListener('input', (e) => {
    document.getElementById('bio-count').textContent = `${e.target.value.length}/500`;
  });
}

async function uploadAvatar(input) {
  const file = input.files?.[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('avatar', file);
  try {
    const res = await fetch('/api/me/avatar', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    showToast('Photo updated');
    await loadProfile();
  } catch (err) {
    showToast(err.message || 'Could not upload photo.');
  }
}

async function saveProfile() {
  const btn = document.getElementById('profile-save-btn');
  const bio = document.getElementById('profile-bio')?.value || '';
  btn.disabled = true;
  btn.textContent = 'Saving…';
  try {
    await api('PUT', '/api/me', { bio });
    showToast('Profile saved');
  } catch (err) {
    showToast(err.message || 'Could not save profile.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save';
  }
}

// ─── Member Directory (per-cohort) ──────────────────────────────────────────

function openMemberDirectory(cohortId) {
  navHistory.push({ type: 'member-directory' });
  loadMemberDirectory(cohortId);
}

async function loadMemberDirectory(cohortId) {
  setHeader('Members', true);
  setContent('<div class="loading-screen"><div class="spinner"></div></div>');
  try {
    const enrollments = await api('GET', '/api/my/enrollments');
    const cohort = (enrollments || []).find(c => String(c.id) === String(cohortId));
    if (!cohort) { setContent('<div class="loading-screen"><p>Cohort not found.</p></div>'); return; }
    renderMemberDirectory(cohort);
  } catch (err) {
    setContent(`<div class="loading-screen"><p>Could not load members.</p></div>`);
  }
}

function renderMemberDirectory(cohort) {
  const allMembers = [
    ...(cohort.facilitators || []).map(u => ({ ...u, role: 'facilitator' })),
    ...(cohort.participants || []).map(u => ({ ...u, role: 'participant' })),
  ];
  const cards = allMembers.map(u => renderMemberCard(u)).join('');
  setContent(`
    <div class="directory-page">
      <div class="directory-hero">
        <div class="directory-eyebrow">Module ${cohort.moduleNumber}</div>
        <div class="directory-title">${escHtml(cohort.name)}</div>
        <div class="directory-sub">${allMembers.length} member${allMembers.length !== 1 ? 's' : ''}</div>
      </div>
      <div class="directory-list">${cards}</div>
    </div>
  `);
}

function renderMemberCard(user) {
  const avatar = user.avatarUrl
    ? `<img src="${escAttr(user.avatarUrl)}" class="member-card-avatar" alt="">`
    : `<div class="member-card-avatar-placeholder">${escHtml((user.name || '?')[0].toUpperCase())}</div>`;
  const roleBadge = user.role === 'facilitator'
    ? '<span class="member-card-role facilitator">Facilitator</span>'
    : '';
  return `
    <div class="member-card">
      ${avatar}
      <div class="member-card-info">
        <div class="member-card-name">${escHtml(user.name)} ${roleBadge}</div>
        ${user.bio ? `<div class="member-card-bio">${escHtml(user.bio)}</div>` : ''}
      </div>
    </div>
  `;
}

// ─── Alumni Directory ───────────────────────────────────────────────────────

async function openAlumniDirectory() {
  document.getElementById('user-menu').classList.remove('visible');
  await loadAlumniDirectory();
}

async function loadAlumniDirectory() {
  stopAudio();
  currentLessonId = null;
  navHistory = [{ type: 'home' }, { type: 'alumni' }];
  setHeader('Alumni', true);
  setContent('<div class="loading-screen"><div class="spinner"></div></div>');
  try {
    const alumni = await api('GET', '/api/alumni');
    renderAlumniDirectory(alumni);
  } catch (err) {
    if (err.message?.includes('Complete Module 1')) {
      setContent(`
        <div class="directory-page">
          <div class="directory-hero">
            <div class="directory-eyebrow">Alumni</div>
            <div class="directory-title">Alumni Directory</div>
            <div class="directory-sub">Complete Module 1 to unlock the alumni directory and connect with fellow graduates.</div>
          </div>
          <div class="directory-locked">
            <div class="directory-locked-icon">🔒</div>
            <div class="directory-locked-msg">This directory becomes available after you complete Module 1: Waking Up.</div>
          </div>
        </div>
      `);
    } else {
      setContent(`<div class="loading-screen"><p>Could not load alumni directory.</p></div>`);
    }
  }
}

function renderAlumniDirectory(alumni) {
  const cards = alumni.map(u => {
    const avatar = u.avatarUrl
      ? `<img src="${escAttr(u.avatarUrl)}" class="member-card-avatar" alt="">`
      : `<div class="member-card-avatar-placeholder">${escHtml((u.name || '?')[0].toUpperCase())}</div>`;
    const modBadges = (u.completedModules || []).map(m =>
      `<span class="alumni-mod-badge">Mod ${m}</span>`
    ).join('');
    const facilitatorBadge = u.isFacilitator
      ? '<span class="member-card-role facilitator">Facilitator</span>'
      : '';
    return `
      <div class="member-card">
        ${avatar}
        <div class="member-card-info">
          <div class="member-card-name">${escHtml(u.name)} ${facilitatorBadge}</div>
          ${u.bio ? `<div class="member-card-bio">${escHtml(u.bio)}</div>` : ''}
          <div class="alumni-badges">${modBadges}</div>
        </div>
      </div>
    `;
  }).join('');

  setContent(`
    <div class="directory-page">
      <div class="directory-hero">
        <div class="directory-eyebrow">Community</div>
        <div class="directory-title">Alumni Directory</div>
        <div class="directory-sub">${alumni.length} graduate${alumni.length !== 1 ? 's' : ''} of Module 1 and beyond.</div>
      </div>
      <div class="directory-list">${cards}</div>
    </div>
  `);
}

function getNextSession(cohort) {
  if (!cohort?.sessions?.length) return null;
  const now = new Date();
  const upcoming = cohort.sessions
    .filter(s => s.day)
    .map(s => ({ ...s, date: new Date(s.day + 'T' + (s.startTime || '00:00')) }))
    .filter(s => s.date > now)
    .sort((a, b) => a.date - b.date);
  return upcoming[0] || null;
}

function renderHome() {
  const firstName = (currentUser?.name || '').split(' ')[0];
  const moduleConfig = MODULES.find(m => m.number === currentModule) || MODULES[1];
  const moduleLessons = allLessons.filter(l => !l.isCompanion);
  const totalDone = moduleLessons.filter(l => l.completed).length;
  const totalLessons = moduleLessons.length;
  const pct = totalLessons ? Math.round((totalDone / totalLessons) * 100) : 0;
  // Prefer the lesson the user last opened in this module so they resume in place
  const lastId = localStorage.getItem(`se_last_lesson_${currentModule}`);
  const lastLesson = lastId && moduleLessons.find(l => l.id === lastId);
  const nextLesson = lastLesson || moduleLessons.find(l => !l.completed);

  // Group lessons by sectionId
  const sectionIds = [...new Set(moduleLessons.map(l => l.sectionId))].sort((a, b) => a - b);
  const sectionPrefix = currentModule === 1 ? 'Week' : 'Section';
  const sectionsHtml = sectionIds.map(sid => {
    const lessons = allLessons.filter(l => l.sectionId === sid && !l.isCompanion);
    const companions = allLessons.filter(l => l.sectionId === sid && l.isCompanion);
    const sectionTitle = lessons[0]?.sectionTitle || `${sectionPrefix} ${sid}`;
    const fullTitle = currentModule === 1
      ? sectionTitle
      : `Section ${sid}: ${sectionTitle}`;
    return renderSectionGroup(sid, fullTitle, lessons, companions);
  }).join('');

  const eyebrow = nextLesson
    ? (currentModule === 1
        ? `Week ${nextLesson.sectionId} · Day ${nextLesson.lessonNumber}`
        : `Section ${nextLesson.sectionId} · Lesson ${nextLesson.lessonNumber}`)
    : '';
  const lessonWord = currentModule === 1 ? 'days' : 'lessons';


  const html = `
    <div class="home-hero">
      <img src="/logo.png" alt="Sacred Engagement" class="home-logo">
      <div class="home-greeting">Welcome back, ${firstName}</div>
      <div class="home-module-label">${escHtml(moduleConfig.name)} — ${escHtml(moduleConfig.subtitle)}</div>
    </div>

    ${nextLesson ? `
    <div class="continue-card" onclick="loadLesson('${nextLesson.id}')">
      <div class="continue-info">
        <div class="continue-eyebrow">${eyebrow}</div>
        <div class="continue-title">${escHtml(nextLesson.title)}</div>
        <div class="continue-sub">${totalDone === 0 ? 'Start your journey' : 'Continue where you left off'}</div>
      </div>
      <button class="continue-play-btn" aria-label="Play" onclick="event.stopPropagation(); autoplayNext=true; loadLesson('${nextLesson.id}')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
    ` : `
    <div class="continue-card all-done">
      <div class="continue-info">
        <div class="continue-eyebrow">${escHtml(moduleConfig.name)}</div>
        <div class="continue-title">All ${lessonWord} complete</div>
        <div class="continue-sub">You've finished this module</div>
      </div>
      <div class="continue-done-icon">✓</div>
    </div>
    `}

    <div class="home-progress-bar-wrap">
      <div class="home-progress-label">${totalDone} of ${totalLessons} ${lessonWord} complete</div>
      <div class="home-progress-track">
        <div class="home-progress-fill" style="width:${pct}%"></div>
      </div>
    </div>

    ${sectionsHtml}
    ${renderInstallBanner()}
    <div style="height:32px"></div>
  `;
  setContent(html);
}

function renderSectionGroup(sectionId, title, lessons, companions) {
  const done = lessons.filter(l => l.completed).length;
  const lessonWord = currentModule === 1 ? 'days' : 'lessons';
  // Additional Resources button only shown for Module 2 Section 2
  const showResources = currentModule === 2 && sectionId === 2;
  return `
    <div class="section-group">
      <div class="section-header-card">
        <h3>${title}</h3>
        <p style="margin-top:6px;font-size:13px;color:var(--text-muted)">${done} of ${lessons.length} ${lessonWord} complete</p>
        ${showResources ? `
          <button class="section-resources-btn" onclick="loadAdditionalResources()">
            <span class="section-resources-label">Additional Resources</span>
            <span class="section-resources-arrow">→</span>
          </button>
        ` : ''}
      </div>
    </div>
    <div class="lesson-list">
      ${lessons.map(l => renderLessonCard(l)).join('')}
    </div>
    ${companions.length ? `
    <div class="companions-section" style="padding-top:16px">
      <div class="companions-title">Companion Meditations</div>
      <div class="companion-grid">
        ${companions.map(c => renderCompanionCard(c)).join('')}
      </div>
    </div>
    ` : ''}
  `;
}

function renderLessonCard(lesson) {
  const tag = (lesson.moduleNumber || currentModule) === 1
    ? `Week ${lesson.sectionId} — Day ${lesson.lessonNumber}`
    : `Section ${lesson.sectionId} — Lesson ${lesson.lessonNumber}`;
  return `
    <div class="lesson-card ${lesson.completed ? 'completed' : ''}" onclick="loadLesson('${lesson.id}')">
      <div class="lesson-number">${lesson.completed ? checkSvg() : lesson.lessonNumber}</div>
      <div class="lesson-info">
        <h4>${escHtml(lesson.title)}</h4>
        <span class="lesson-tag">${tag}</span>
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
    // Remember the last lesson opened in this module so the picker can resume here
    const modNum = Number(lesson.moduleNumber) || (id.startsWith('m1_') ? 1 : 2);
    localStorage.setItem(`se_last_lesson_${modNum}`, id);
    renderLesson(lesson, responses);
  } catch (err) {
    setContent(`<div class="loading-screen"><p>Could not load lesson.</p></div>`);
  }
}

function renderLesson(lesson, responses) {
  const isCompleted = allLessons.find(l => l.id === lesson.id)?.completed;
  const isMod1 = Number(lesson.moduleNumber) === 1;
  const lessonLabel = lesson.isCompanion
    ? lesson.title
    : isMod1
      ? `Week ${lesson.sectionId} — Day ${lesson.lessonNumber}`
      : `Section ${lesson.sectionId} — Lesson ${lesson.lessonNumber}`;
  setHeader(lesson.sectionTitle, true);

  const audioUrl = lesson.audio
    ? `/api/audio/${encodeURIComponent(lesson.audio.section)}/${lesson.audio.folder}/${encodeURIComponent(lesson.audio.file)}?t=${encodeURIComponent(token)}`
    : null;

  const blocksHtml = lesson.blocks.map((block, bi) => renderBlock(block, bi, lesson.id, responses)).join('');

  // Find next lesson
  const idx = allLessons.findIndex(l => l.id === lesson.id);
  const next = idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  const playerHtml = audioUrl ? `
      <div class="audio-player">
        <div class="audio-lesson-title">${lessonLabel}</div>
        <div class="audio-title">${escHtml(lesson.title)}</div>
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
  ` : `
      <div class="lesson-hero">
        <div class="lesson-hero-eyebrow">${escHtml(lessonLabel)}</div>
        <div class="lesson-hero-title">${escHtml(lesson.title)}</div>
      </div>
  `;

  const html = `
    <div class="lesson-page">
      ${playerHtml}

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

function showCeremony(title, msg) {
  document.getElementById('ceremony-title').textContent = title;
  document.getElementById('ceremony-msg').textContent = msg;
  document.getElementById('ceremony-overlay').classList.add('visible');
}
function closeCeremony() {
  document.getElementById('ceremony-overlay').classList.remove('visible');
}

async function markComplete(lessonId) {
  const btn = document.getElementById('complete-btn');
  const lesson = allLessons.find(l => l.id === lessonId);
  if (lesson?.completed) return;

  try {
    await api('POST', `/api/progress/${lessonId}`);
    if (lesson) lesson.completed = true;
    btn.className = 'btn-complete done';
    btn.innerHTML = `${checkSvg()} Completed`;

    // Check if this completed the entire section
    const sectionLessons = allLessons.filter(l =>
      l.sectionId === lesson.sectionId &&
      Number(l.moduleNumber) === Number(lesson.moduleNumber) &&
      !l.isCompanion
    );
    const allSectionDone = sectionLessons.every(l => l.completed);
    if (allSectionDone) {
      const mod = MODULES.find(m => m.number === Number(lesson.moduleNumber));
      const sectionWord = Number(lesson.moduleNumber) === 1 ? 'Week' : 'Section';
      const allModuleDone = allLessons.filter(l => !l.isCompanion).every(l => l.completed);
      if (allModuleDone) {
        showCeremony(
          `${mod?.name || 'Module'} Complete`,
          `You've completed every lesson in ${mod?.subtitle || 'this module'}. Take a moment to honour how far you've come.`
        );
      } else {
        showCeremony(
          `${sectionWord} ${lesson.sectionId} Complete`,
          `You've finished all lessons in this ${sectionWord.toLowerCase()}. Take a breath before continuing.`
        );
      }
    } else {
      showToast('Lesson marked as complete!');
    }
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
    const savedPos = localStorage.getItem(`audio_pos_${currentLessonId}`);
    if (savedPos) {
      const pos = parseFloat(savedPos);
      if (pos < audioEl.duration - 10) audioEl.currentTime = pos;
    }
  }, { once: true });

  // Save position periodically
  audioEl.addEventListener('timeupdate', () => {
    if (currentLessonId) {
      localStorage.setItem(`audio_pos_${currentLessonId}`, audioEl.currentTime);
    }
  });

  // Autoplay if navigated via the play button — resume from saved position
  if (autoplayNext) {
    autoplayNext = false;
    const startPlay = () => audioEl.play().catch(() => {});
    if (audioEl.readyState >= 1) startPlay();
    else audioEl.addEventListener('loadedmetadata', startPlay, { once: true });
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

function showWelcomeOrientation() {
  // Small delay to let the app render first
  setTimeout(() => {
    const overlay = document.getElementById('ceremony-overlay');
    if (!overlay) return;
    const firstName = (currentUser?.name || '').split(' ')[0];
    document.getElementById('ceremony-title').textContent = `Welcome${firstName ? ', ' + firstName : ''}!`;
    document.getElementById('ceremony-msg').textContent = "You're all set. Start with Day 1 of Week 1 — spend 30–60 minutes on the daily material before your first Zoom session.";
    overlay.classList.add('visible');
  }, 400);
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
