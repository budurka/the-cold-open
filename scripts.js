// scripts.js

const formatSelect = document.getElementById('format');
const fieldsContainer = document.getElementById('fields-container');
const generateButton = document.getElementById('generate');
const resultEl = document.getElementById('result');
const spinner = document.getElementById('spinner');
const copyButton = document.getElementById('copy-button');
const themeToggle = document.getElementById('theme-toggle');

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  localStorage.setItem('theme', theme);
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  const icon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🖥️';
  themeToggle.textContent = icon;
}

// Cycle through light -> dark -> system
function cycleTheme() {
  const current = localStorage.getItem('theme') || 'system';
  const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
  applyTheme(next);
}

// On load
const savedTheme = localStorage.getItem('theme') || 'system';
applyTheme(savedTheme);

themeToggle.addEventListener('click', cycleTheme);

formatSelect.addEventListener('change', () => {
  const format = formatSelect.value;
  fieldsContainer.innerHTML = '';

  if (format === 'Taboops!') {
    const wordLabel = document.createElement('label');
    wordLabel.textContent = 'Enter a word to guess:';
    const wordInput = document.createElement('input');
    wordInput.type = 'text';
    wordInput.id = 'word';

    const afterDarkContainer = document.createElement('label');
    afterDarkContainer.style.display = 'flex';
    afterDarkContainer.style.alignItems = 'center';
    const afterDark = document.createElement('input');
    afterDark.type = 'checkbox';
    afterDark.id = 'after-dark';
    afterDarkContainer.appendChild(afterDark);
    afterDarkContainer.appendChild(document.createTextNode(' Taboo After Dark'));

    fieldsContainer.appendChild(wordLabel);
    fieldsContainer.appendChild(wordInput);
    fieldsContainer.appendChild(afterDarkContainer);

  } else if (format === 'Buzzwords & Bullsh*t') {
    const buzzwordLabel = document.createElement('label');
    buzzwordLabel.textContent = 'Buzzword:';
    const buzzwordInput = document.createElement('input');
    buzzwordInput.type = 'text';
    buzzwordInput.id = 'buzzword';

    const industryLabel = document.createElement('label');
    industryLabel.textContent = 'Industry:';
    const industryInput = document.createElement('input');
    industryInput.type = 'text';
    industryInput.id = 'industry';

    fieldsContainer.appendChild(buzzwordLabel);
    fieldsContainer.appendChild(buzzwordInput);
    fieldsContainer.appendChild(industryLabel);
    fieldsContainer.appendChild(industryInput);

  } else if (format === 'Fill in the Bleep!') {
    const fields = [
      { id: 'storyTitle', label: 'Story Title' },
      { id: 'noun', label: 'Noun' },
      { id: 'adjective', label: 'Adjective' },
      { id: 'place', label: 'Place' },
      { id: 'noun2', label: 'Another Noun' },
      { id: 'verb', label: 'Verb' },
      { id: 'random1', label: 'Random Thing 1' },
      { id: 'random2', label: 'Random Thing 2' }
    ];
    fields.forEach(({ id, label }) => {
      const lbl = document.createElement('label');
      lbl.textContent = label + ':';
      const input = document.createElement('input');
      input.type = 'text';
      input.id = id;
      fieldsContainer.appendChild(lbl);
      fieldsContainer.appendChild(input);
    });
  }
});

generateButton.addEventListener('click', async () => {
  const format = formatSelect.value;
  const inputs = {};

  if (format === 'Taboops!') {
    inputs.word = document.getElementById('word').value;
    inputs.isAfterDark = document.getElementById('after-dark').checked;
  } else if (format === 'Buzzwords & Bullsh*t') {
    inputs.buzzword = document.getElementById('buzzword').value;
    inputs.industry = document.getElementById('industry').value;
  } else if (format === 'Fill in the Bleep!') {
    ['storyTitle', 'noun', 'adjective', 'place', 'noun2', 'verb', 'random1', 'random2'].forEach(id => {
      inputs[id] = document.getElementById(id).value;
    });
  }

  spinner.style.display = 'block';
  resultEl.textContent = '';
  copyButton.style.display = 'none';

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, inputs, isAfterDark: inputs.isAfterDark })
    });

    const data = await response.json();

    if (data.result) {
      resultEl.textContent = data.result;
      copyButton.style.display = 'block';
    } else {
      resultEl.textContent = data.error || 'Unexpected error.';
    }
  } catch (err) {
    resultEl.textContent = 'Something went wrong.';
  } finally {
    spinner.style.display = 'none';
  }
});

copyButton.addEventListener('click', () => {
  navigator.clipboard.writeText(resultEl.textContent).then(() => {
    copyButton.textContent = '✅ Copied!';
    setTimeout(() => (copyButton.textContent = '📋 Copy to Clipboard'), 2000);
  });
});
