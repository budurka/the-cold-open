document.addEventListener('DOMContentLoaded', () => {
  const formatSelect = document.getElementById('format');
  const fieldsContainer = document.getElementById('fields-container');
  const generateButton = document.getElementById('generate');
  const resultPre = document.getElementById('result');
  const spinner = document.getElementById('spinner');
  const copyButton = document.getElementById('copy-button');
  const themeToggle = document.getElementById('theme-toggle');

  let currentTheme = localStorage.getItem('theme') || 'system';
  applyTheme(currentTheme);
  updateThemeToggleLabel(currentTheme);

  themeToggle.addEventListener('click', () => {
    currentTheme = nextTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
    updateThemeToggleLabel(currentTheme);
  });

  function nextTheme(theme) {
    return theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
  }

  function applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'system') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', theme);
    }
  }

  function updateThemeToggleLabel(theme) {
    themeToggle.textContent = {
      light: '🌞',
      dark: '🌙',
      system: '🖥️'
    }[theme];
  }

  formatSelect.addEventListener('change', () => {
    const format = formatSelect.value;
    fieldsContainer.innerHTML = '';

    if (format === 'Taboops!') {
      const wordInput = createInput('word', 'Enter a word to guess');
      const checkbox = document.createElement('label');
      checkbox.innerHTML = `<input type="checkbox" id="afterDark"> After Dark version`;
      fieldsContainer.appendChild(wordInput);
      fieldsContainer.appendChild(checkbox);
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

  generateButton.addEventListener('click', async () => {
    const format = formatSelect.value;
    if (!format) return alert('Please select a format.');

    const inputs = {};
    const inputElements = fieldsContainer.querySelectorAll('input[type="text"]');
    inputElements.forEach(input => {
      inputs[input.name] = input.value.trim();
    });

    const isAfterDark = document.getElementById('afterDark')?.checked || false;

    spinner.style.display = 'block';
    resultPre.textContent = '';
    copyButton.style.display = 'none';

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, inputs, isAfterDark })
      });

      const data = await response.json();

      if (data.error) {
        resultPre.textContent = `❌ Error: ${data.error}`;
      } else {
        resultPre.textContent = data.result;
        copyButton.style.display = 'block';
      }
    } catch (err) {
      resultPre.textContent = '❌ Something went wrong.';
    } finally {
      spinner.style.display = 'none';
    }
  });

  copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(resultPre.textContent).then(() => {
      copyButton.textContent = '✅ Copied!';
      setTimeout(() => {
        copyButton.textContent = '📋 Copy to Clipboard';
      }, 2000);
    });
  });

  function createInput(name, placeholder) {
    const label = document.createElement('label');
    label.textContent = placeholder;
    const input = document.createElement('input');
    input.type = 'text';
    input.name = name;
    input.placeholder = placeholder;
    label.appendChild(input);
    return label;
  }
});
