// The Cold Open — Glass Wallet Selector + Generator (v2, full-screen + POST)
const FORMATS = [
  {
    display: "Taboops!",
    apiKey: "Taboops!",
    tagline: "Guess the word without saying the “taboo” words",
    svg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M7 7l10 10" stroke-linecap="round"/>
            <rect x="8" y="9" width="8" height="4" rx="2" fill="currentColor" opacity=".2"/>
          </svg>`
  },
  {
    display: "Buzzwords & Nonsense",
    apiKey: "Buzzwords & Bullsh*t",
    tagline: "Build the most ridiculous phrase you can",
    svg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-9 8.46 8.5 8.5 0 0 1-3.36-.72L3 20l1.76-4.21A8.38 8.38 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"/>
            <path d="M8 9h.01M16 9h.01M8 13c1.5 1 3.5 1 5 0" stroke-linecap="round"/>
          </svg>`
  },
  {
    display: "Fill in the Bleep!",
    apiKey: "Fill in the Bleep!",
    tagline: "Create hilariously random sentences with surprise words",
    svg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
          </svg>`
  },
  {
    display: "What’s in the Box?",
    apiKey: "What’s in the Box?",
    tagline: "Reveal the mystery inside",
    svg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z"/>
            <path d="M3.3 7L12 12l8.7-5M12 22V12"/>
          </svg>`
  }
];

const wallet = document.getElementById('wallet');
const dockButtons = document.querySelectorAll('.dock-btn');
const generator = document.getElementById('generator');
const genTitle = document.getElementById('gen-title');
const genTag = document.getElementById('genTag');
const promptText = document.getElementById('promptText');

let activeIndex = 0;
let selected = FORMATS[0];

function renderCards(){
  wallet.innerHTML = '';
  FORMATS.forEach((f, idx) => {
    const card = document.createElement('section');
    card.className = 'card';
    card.setAttribute('role','group');
    card.setAttribute('aria-roledescription','show card');
    card.innerHTML = `
      <div class="emoji" aria-hidden="true">${f.svg}</div>
      <div>
        <h3>${f.display}</h3>
        <p>${f.tagline}</p>
      </div>
      <button class="pill select" data-index="${idx}">Select</button>
    `;
    wallet.appendChild(card);
  });
}
renderCards();

wallet.addEventListener('click', (e) => {
  const btn = e.target.closest('.select');
  if(!btn) return;
  const idx = Number(btn.dataset.index);
  openGenerator(idx);
});

dockButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.key;
    const idx = FORMATS.findIndex(f => f.apiKey === key);
    scrollToCard(idx);
  });
});

function scrollToCard(idx){
  const card = wallet.children[idx];
  if(!card) return;
  activeIndex = idx;
  selected = FORMATS[idx];
  card.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
  dockButtons.forEach(b => b.classList.toggle('active', b.dataset.key === selected.apiKey));
}

function openGenerator(idx){
  selected = FORMATS[idx];
  genTitle.textContent = selected.display;
  genTag.textContent = selected.tagline;
  promptText.textContent = 'Generating…';
  generator.classList.remove('hidden');
  generatePrompt();
}

document.getElementById('backBtn').addEventListener('click', () => {
  generator.classList.add('hidden');
});

document.getElementById('genBtn').addEventListener('click', generatePrompt);
document.getElementById('copyBtn').addEventListener('click', async () => {
  try{
    await navigator.clipboard.writeText(promptText.textContent.trim());
    toast('Copied!');
  }catch{
    toast('Copy failed');
  }
});

async function generatePrompt(){
  try{
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: selected.apiKey })
    });
    const data = await res.json();
    if(!res.ok){
      throw new Error(data?.error || res.statusText);
    }
    const text = data.prompt || data.text || JSON.stringify(data);
    promptText.textContent = text.trim();
  }catch(err){
    promptText.textContent = `{ "error": "${err.message}" }`;
    console.error(err);
  }
}

// simple toast
function toast(msg){
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position:fixed; left:50%; bottom:calc(94px + env(safe-area-inset-bottom)); transform:translateX(-50%);
    background:rgba(0,0,0,.6); color:#fff; padding:10px 14px; border-radius:999px;
    backdrop-filter: blur(10px); border:1px solid #ffffff22; font-weight:700; z-index:9999;
  `;
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 1200);
}

// initialize dock state and center first card
scrollToCard(0);
