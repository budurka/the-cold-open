// Theme toggle: prefers-color-scheme aware with explicit overrides
(() => {
  const root = document.documentElement;
  const KEY = 'tco-theme';
  const saved = localStorage.getItem(KEY);

  // Respect saved theme if present
  if (saved === 'dark') root.classList.add('theme-dark');
  if (saved === 'light') root.classList.add('theme-light');

  const btn = document.getElementById('themeToggle');
  const setPressed = () => {
    const isDark = root.classList.contains('theme-dark');
    if (btn) btn.setAttribute('aria-pressed', String(isDark));
  };
  setPressed();

  btn?.addEventListener('click', () => {
    const isDark = root.classList.toggle('theme-dark');
    if (isDark) root.classList.remove('theme-light');
    localStorage.setItem(KEY, isDark ? 'dark' : 'light');
    setPressed();
  });
})();

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const outputText = $('#outputText');
const outputTitle = $('#outputTitle');
const formatSelect = $('#formatSelect');
const thingsInputWrap = $('#thingsInputWrap');
const thingsInput = $('#thingsInput');
const savedList = $('#savedList');

const formatsRequiringInput = new Set(['things']);

formatSelect.addEventListener('change', () => {
  const needs = formatsRequiringInput.has(formatSelect.value);
  thingsInputWrap.hidden = !needs;
});

$('#generateBtn').addEventListener('click', () => {
  const fmt = formatSelect.value;
  const seed = (fmt === 'things') ? (thingsInput.value || '').trim() : '';
  const prompt = generatePrompt(fmt, seed);
  outputTitle.textContent = titleFor(fmt);
  outputText.textContent = prompt;
});

$('#saveBtn').addEventListener('click', () => {
  const text = outputText.textContent.trim();
  if (!text) return;
  const li = document.createElement('li');
  li.className = 'saved-item';
  li.innerHTML = `
    <span class="text">${escapeHtml(text)}</span>
    <span class="row">
      <button class="btn" data-copy>Copy</button>
      <button class="btn" data-del>Delete</button>
    </span>`;
  savedList.prepend(li);
});

$('#clearBtn').addEventListener('click', () => {
  outputText.textContent = 'Tap Generate to get inspired.';
});

$('#copyBtn').addEventListener('click', () => {
  const text = outputText.textContent.trim();
  if (!text) return;
  navigator.clipboard.writeText(text);
});

savedList.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const li = btn.closest('.saved-item');
  if (btn.dataset.copy) {
    const text = li.querySelector('.text').textContent;
    navigator.clipboard.writeText(text);
  } else if (btn.dataset.del) {
    li.remove();
  }
});

$('#exportBtn').addEventListener('click', () => {
  const items = $$('.saved-item .text').map(n => n.textContent);
  const blob = new Blob([items.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'cold-open-saved.txt'; a.click();
  URL.revokeObjectURL(url);
});

// --- Prompt generation (placeholder data) ---
// Swap these arrays with your existing data or API calls.
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
