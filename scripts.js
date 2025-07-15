const formatSelector = document.getElementById('format');
const fieldsContainer = document.getElementById('fields-container');
const generateBtn = document.getElementById('generate');
const spinner = document.getElementById('spinner');
const resultContainer = document.getElementById('result');
const copyButton = document.getElementById('copy-button');
const themeToggle = document.getElementById('theme-toggle');

// Handle theme on load
function applyTheme(theme) {
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.body.setAttribute('data-theme', systemTheme);
  } else {
    document.body.setAttribute('data-theme', theme);
  }
  localStorage.setItem('theme', theme);
  updateThemeButton(theme);
}

// Update theme toggle button appearance
function updateThemeButton(theme) {
  if (theme === 'dark') {
    themeToggle.textContent = '☀️';
  } else if (theme === 'light') {
    themeToggle.textContent = '🌙';
  } else {
    themeToggle.textContent = '🖥️';
  }
}

// Toggle theme manually
themeToggle.addEventListener('click', () => {
  const current = localStorage.getItem('theme') || 'system';
  const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
  applyTheme(next);
});

// Set initial theme
applyTheme(localStorage.getItem('theme') || 'system');

// Update input fields based on format
function renderFields(format) {
  fieldsContainer.innerHTML = '';

  if (format === 'Taboops!') {
    const wordInput = document.createElement('input');
    wordInput.type = 'text';
    wordInput.id = 'word';
    wordInput.placeholder = 'Enter the guess word (e.g. pineapple)';
    fieldsContainer.appendChild(wordInput);

    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.style.marginTop = '1rem';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'after-dark';

    const label = document.createElement('label');
    label.htmlFor = 'after-dark';
    label.textContent = 'Taboo After Dark?';
    label.style.marginLeft = '0.5rem';

    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(label);
    fieldsContainer.appendChild(checkboxWrapper);
  }

  if (format === 'Buzzwords & Bullsh*t') {
    const buzzInput = document.createElement('input');
    buzzInput.type = 'text';
    buzzInput.id = 'buzzword';
    buzzInput.placeholder = 'Enter a buzzword (e.g. synergy)';
    fieldsContainer.appendChild(buzzInput);

    const industryInput = document.createElement('input');
    industryInput.type = 'text';
    industryInput.id = 'industry';
    industryInput.placeholder = 'Enter an industry (e.g. healthcare)';
    fieldsContainer.appendChild(industryInput);
  }

  if (format === 'Fill in the Bleep!') {
    const fields = [
      { id: 'storyTitle', placeholder: 'Name of the story you wish was a Mad Lib' },
      { id: 'noun', placeholder: 'Enter a noun' },
      { id: 'adjective', placeholder: 'Enter an adjective' },
      { id: 'place', placeholder: 'Enter a place' },
      { id: 'noun2', placeholder: 'Enter another noun' },
      { id: 'verb', placeholder: 'Enter a verb' },
      { id: 'random1', placeholder: 'Random thing 1' },
      { id: 'random2', placeholder: 'Random thing 2' },
    ];

    fields.forEach(({ id, placeholder }) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = id;
      input.placeholder = placeholder;
      fieldsContainer.appendChild(input);
    });
  }
}

formatSelector.addEventListener('change', (e) => {
  renderFields(e.target.value);
});

// Generate prompt and fetch response
generateBtn.addEventListener('click', async () => {
  const format = formatSelector.value;
  const inputs = {};
  let isAfterDark = false;

  if (!format) {
    alert('Please select a format first!');
    return;
  }

  if (format === 'Taboops!') {
    inputs.word = document.getElementById('word')?.value || '';
    isAfterDark = document.getElementById('after-dark')?.checked || false;
  }

  if (format === 'Buzzwords & Bullsh*t') {
    inputs.buzzword = document.getElementById('buzzword')?.value || '';
    inputs.industry = document.getElementById('industry')?.value || '';
  }

  if (format === 'Fill in the Bleep!') {
    inputs.storyTitle = document.getElementById('storyTitle')?.value || '';
    inputs.noun = document.getElementById('noun')?.value || '';
    inputs.adjective = document.getElementById('adjective')?.value || '';
    inputs.place = document.getElementById('place')?.value || '';
    inputs.noun2 = document.getElementById('noun2')?.value || '';
    inputs.verb = document.getElementById('verb')?.value || '';
    inputs.random1 = document.getElementById('random1')?.value || '';
    inputs.random2 = document.getElementById('random2')?.value || '';
  }

  resultContainer.textContent = '';
  spinner.style.display = 'block';
  copyButton.style.display = 'none';

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, inputs, isAfterDark }),
    });

    const data = await response.json();
    resultContainer.textContent = data.result || 'No response.';
    if (data.result) copyButton.style.display = 'block';
  } catch (err) {
    resultContainer.textContent = 'Something went wrong.';
  } finally {
    spinner.style.display = 'none';
  }
});

// Copy to clipboard
copyButton.addEventListener('click', () => {
  navigator.clipboard.writeText(resultContainer.textContent);
  copyButton.textContent = '✅ Copied!';
  setTimeout(() => (copyButton.textContent = '📋 Copy to Clipboard'), 1500);
});
