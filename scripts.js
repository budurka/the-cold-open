// The Cold Open — Glass Wallet Selector + Generator
const FORMATS = [
  {
    display: "Taboops!",
    apiKey: "Taboops!",
    tagline: "Guess the word without saying the “taboo” words",
    emoji: "🚫💬"
  },
  {
    display: "Buzzwords & Nonsense",
    apiKey: "Buzzwords & Bullsh*t",
    tagline: "Build the most ridiculous phrase you can",
    emoji: "💬🤪"
  },
  {
    display: "Fill in the Bleep!",
    apiKey: "Fill in the Bleep!",
    tagline: "Create hilariously random sentences with surprise words",
    emoji: "✏️📄"
  },
  {
    display: "What’s in the Box?",
    apiKey: "What’s in the Box?",
    tagline: "Reveal the mystery inside",
    emoji: "📦❓"
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
      <div class="emoji" aria-hidden="true">${f.emoji}</div>
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
    const res = await fetch(`/api/generate?format=${encodeURIComponent(selected.apiKey)}`);
    const data = await res.json();
    // Expect {prompt: "..."} or fallback to text
    const text = data.prompt || data.text || JSON.stringify(data);
    promptText.textContent = text.trim();
  }catch(err){
    promptText.textContent = 'Error generating. Please try again.';
    console.error(err);
  }
}

// simple toast
function toast(msg){
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position:fixed; left:50%; bottom:94px; transform:translateX(-50%);
    background:rgba(0,0,0,.6); color:#fff; padding:10px 14px; border-radius:999px;
    backdrop-filter: blur(10px); border:1px solid #ffffff22; font-weight:700; z-index:9999;
  `;
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 1200);
}

// initialize dock state and center first card
scrollToCard(0);
