document.addEventListener('DOMContentLoaded', () => {
  const formatSelect = document.getElementById('format');
  const fieldsContainer = document.getElementById('fields-container');
  const generateButton = document.getElementById('generate');
  const resultPre = document.getElementById('result');
  const spinner = document.getElementById('spinner');
  const copyButton = document.getElementById('copy-button');
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // Handle Theme Preference
  let theme = localStorage.getItem('theme') || 'system';
  applyTheme(theme);
  updateToggleLabel(theme);

  themeToggle.addEventListener('click', () => {
    theme = getNextTheme(theme);
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    updateToggleLabel(theme);
  });

  function getNextTheme(current) {
    return current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
  }

  function applyTheme(selected) {
    if (selected === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', selected);
    }
  }

  function updateToggleLabel(current) {
    const labelMap = {
      light: '🌞',
      dark: '🌙',
      system: '🖥️'
    };
    themeToggle.textContent = labelMap[current] || '🖥️';
  }

  // Handle Format Input Prompts
  formatSelect.addEventListener('change', () => {
    fieldsContainer.innerHTML = '';
    const format = formatSelect.value;

    if (format === 'Taboops!') {
      fieldsContainer.appendChild(createInput('word', 'Enter a word to guess'));
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '0.5rem';
      label.innerHTML = `<input type="checkbox" id="afterDark"> After Dark version`;
      fieldsContainer.appendChild(label);
    }

    if (format === 'Buzzwords & Bullsh*t') {
      fieldsContainer.appendChild(createInput('buzzword', 'Enter a buzzword'));
      fieldsContainer.appendChild(createInput('industry', 'Enter an industry'));
    }

    if (format === 'Fill in the Bleep!') {
      fieldsContainer.appendChild(createInput('storyTitle', 'Name a story you wish existed'));
      fieldsContainer.appendChild(createInput('noun', 'Enter a noun'));
      fieldsContainer.appendChild(createInput('adjective', 'Enter an adjective'));
      fieldsContainer.appendChild(createInput('place', 'Enter a place'));
      fieldsContainer.appendChild(createInput('noun2', 'Enter another noun'));
      fieldsContainer.appendChild(createInput('verb', 'Enter a verb'));
      fieldsContainer.appendChild(createInput('random1', 'Enter a random thing'));
      fieldsContainer.appendChild(createInput('random2', 'Enter another random thing'));
    }
  });

  // Create input field
  function createInput(name, labelText) {
    const label = document.createElement('label');
    label.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'text';
    input.name = name;
    input.placeholder = labelText;
    label.appendChild(input);
    return label;
  }

  // Generate prompt handler
  generateButton.addEventListener('click', async () => {
    const format = formatSelect.value;
    if (!format) return alert('Choose a format.');

    const inputData = {};
    fieldsContainer.querySelectorAll('input[type="text"]').forEach(input => {
      inputData[input.name] = input.value.trim();
    });

    const isAfterDark = document.getElementById('afterDark')?.checked || false;

    spinner.style.display = 'block';
    resultPre.textContent = '';
    copyButton.style.display = 'none';

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, inputs: inputData, isAfterDark })
      });

      const data = await res.json();

      if (data.error) {
        resultPre.textContent = `Error: ${data.error}`;
      } else {
        resultPre.textContent = data.result;
        copyButton.style.display = 'block';
      }
    } catch (err) {
      resultPre.textContent = 'Something went wrong.';
    } finally {
      spinner.style.display = 'none';
    }
  });

  // Copy to clipboard
  copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(resultPre.textContent).then(() => {
      copyButton.textContent = '✅ Copied!';
      setTimeout(() => {
        copyButton.textContent = '📋 Copy to Clipboard';
      }, 1500);
    });
  });
});
