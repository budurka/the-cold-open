// ===== Theme (auto/light/dark) =====
(() => {
  const root = document.documentElement;
  const KEY = 'tco-theme-mode'; // 'auto' | 'light' | 'dark'
  const saved = localStorage.getItem(KEY) || 'auto';

  const setMode = (mode) => {
    root.classList.remove('theme-light','theme-dark');
    if (mode === 'light') root.classList.add('theme-light');
    if (mode === 'dark') root.classList.add('theme-dark');
    localStorage.setItem(KEY, mode);
    for (const b of document.querySelectorAll('.segmented .seg')) b.classList.remove('on');
    const btn = document.querySelector(`.segmented [data-mode="${mode}"]`);
    btn && btn.classList.add('on');
  };

  setMode(saved);

  for (const b of document.querySelectorAll('.segmented .seg')) {
    b.addEventListener('click', () => setMode(b.dataset.mode));
  }
})();

// ===== Helpers =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ===== Elements =====
const outputText = $('#outputText');
const outputTitle = $('#outputTitle');
const formatSelect = $('#formatSelect');
const thingsInputWrap = $('#thingsInputWrap');
const thingsInput = $('#thingsInput');
const savedList = $('#savedList');

const STORAGE_SAVED = 'tco-saved-prompts';

// ===== Behavior =====
const formatsRequiringInput = new Set(['things']);

formatSelect.addEventListener('change', () => {
  thingsInputWrap.hidden = !formatsRequiringInput.has(formatSelect.value);
});

$('#generateBtn').addEventListener('click', generate);
$('#saveBtn').addEventListener('click', saveCurrent);
$('#clearBtn').addEventListener('click', () => outputText.textContent = 'Tap Generate to get inspired.');
$('#copyBtn').addEventListener('click', () => navigator.clipboard.writeText(outputText.textContent.trim()));
$('#shareBtn').addEventListener('click', shareCurrent);

$('#exportBtn').addEventListener('click', () => {
  const items = $$('.saved-item .text').map(n => n.textContent);
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'cold-open-saved.json'; a.click();
  URL.revokeObjectURL(url);
});

$('#importBtn').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return;
  const text = await f.text();
  try {
    const arr = JSON.parse(text);
    for (const item of arr) addSaved(item);
    persistSaved();
  } catch {
    // try newline-separated
    text.split(/\r?\n/).filter(Boolean).forEach(addSaved);
    persistSaved();
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'g') { e.preventDefault(); generate(); }
  if (e.key === 's') { e.preventDefault(); saveCurrent(); }
  if (e.key === 'c') { e.preventDefault(); navigator.clipboard.writeText(outputText.textContent.trim()); }
  if (e.key === '/') { e.preventDefault(); thingsInput?.focus(); }
});

// Load saved list on startup
(function loadSaved(){
  const raw = localStorage.getItem(STORAGE_SAVED);
  if (!raw) return;
  try {
    const arr = JSON.parse(raw);
    for (const item of arr) addSaved(item);
  } catch {}
})();

function persistSaved(){
  const items = $$('.saved-item .text').map(n => n.textContent);
  localStorage.setItem(STORAGE_SAVED, JSON.stringify(items));
}

// Share current prompt via URL
function shareCurrent(){
  const text = outputText.textContent.trim();
  if (!text) return;
  const url = new URL(location.href);
  url.hash = encodeURIComponent(text);
  navigator.clipboard.writeText(url.toString());
  alert('Share link copied to clipboard!');
}

// If URL has a hash, show that prompt
(function loadFromHash(){
  if (location.hash.length > 1) {
    const decoded = decodeURIComponent(location.hash.slice(1));
    outputTitle.textContent = 'Shared Prompt';
    outputText.textContent = decoded;
  }
})();

// ===== Prompt generation (placeholder data) =====
const WORDS = {
  location: ['airport lounge','medieval tavern','dentist’s office','DMV line','submarine'],
  object: ['rubber chicken','ancient key','mysterious briefcase','beeping pager','squeaky wheel'],
  profession: ['beekeeper','astronaut','barista','plumber','news anchor'],
  relationship: ['estranged siblings','rival magicians','new roommates','exes','mentor & mentee'],
  emotion: ['gleeful','paranoid','overconfident','sheepish','starstruck'],
  habit: ['interrupts constantly','collects spoons','talks in third person','over-apologizes','gamifies everything'],
  action: ['negotiating a raise','planning a heist','returning a cursed item','teaching a pet','arguing semantics'],
  abstract: ['nostalgia vs. progress','chaos becomes order','truth without evidence','time is a circle','luck runs out'],
  line: [
    "Okay, before you see the alpaca, a few ground rules.",
    "I’m not saying it’s haunted, but the lights hate me.",
    "We only fake the smile on weekdays.",
    "That’s not a receipt—that’s a confession.",
    "You brought the wrong suitcase, again."
  ],
};

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function titleFor(fmt){
  return ({
    location:'Location', object:'Object', profession:'Profession',
    relationship:'Relationship', emotion:'Emotion', habit:'Habit',
    action:'Action', abstract:'Abstract', line:'Opening Line',
    things:'Things You Might Find In…'
  })[fmt] || 'Prompt';
}

function generate(){
  const fmt = formatSelect.value;
  const seed = (fmt === 'things') ? (thingsInput.value || '').trim() : '';
  const prompt = generatePrompt(fmt, seed);
  outputTitle.textContent = titleFor(fmt);
  outputText.textContent = prompt;
}

function saveCurrent(){
  const text = outputText.textContent.trim();
  if (!text) return;
  addSaved(text);
  persistSaved();
}

function addSaved(text){
  const li = document.createElement('li');
  li.className = 'saved-item';
  li.innerHTML = `
    <span class="text">${escapeHtml(text)}</span>
    <span class="row">
      <button class="btn" data-copy>Copy</button>
      <button class="btn" data-del>Delete</button>
    </span>`;
  savedList.prepend(li);
}

savedList.addEventListener('click', (e) => {
  const btn = e.target.closest('button'); if (!btn) return;
  const li = btn.closest('.saved-item');
  if (btn.dataset.copy) {
    const text = li.querySelector('.text').textContent;
    navigator.clipboard.writeText(text);
  } else if (btn.dataset.del) {
    li.remove();
    persistSaved();
  }
});

function generatePrompt(fmt, seed='') {
  if (fmt === 'things') {
    const base = seed || rand(WORDS.location);
    const items = Array.from({length: 3}, () => rand([ ...WORDS.object, ...WORDS.habit, ...WORDS.action ]));
    return `Things you might find in a ${base}: ${items.join(', ')}.`;
  }
  const choices = WORDS[fmt] || ['(no data)'];
  return rand(choices);
}

function escapeHtml(s){
  const map = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#039;'};
  return s.replace(/[&<>"']/g, m => map[m]);
}
