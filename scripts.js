document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const formatButtons = document.querySelectorAll('.format-button');
  const fieldsContainer = document.getElementById('fields-container');
  const generateButton = document.getElementById('generate');
  const resultBox = document.getElementById('result');

  const fieldTemplates = {
    'Taboops!': [
      { label: 'Taboo Word', placeholder: 'Enter your taboo word' }
    ],
    'Buzzwords & Bullsh*t': [
      { label: 'Theme', placeholder: "e.g., Things you'd hear in an ice cream boardroom" }
    ],
    'Fill in the Bleep!': [
      { label: 'Story or Genre', placeholder: 'e.g., The Godfather' },
      { label: 'Noun', placeholder: 'Enter a noun' },
      { label: 'Adjective', placeholder: 'Enter an adjective' },
      { label: 'Place', placeholder: 'Enter a place' },
      { label: 'Another Noun', placeholder: 'Enter another noun' },
      { label: 'Verb', placeholder: 'Enter a verb' },
      { label: 'Random Thing #1', placeholder: 'Something silly' },
      { label: 'Random Thing #2', placeholder: 'Another weird thing' }
    ]
  };

  function updateFields(format) {
    fieldsContainer.innerHTML = '';
    const fields = fieldTemplates[format];
    fields.forEach((field, index) => {
      const label = document.createElement('label');
      label.textContent = field.label;
      label.htmlFor = `input-${index}`;
      const input = document.createElement('input');
      input.type = 'text';
      input.id = `input-${index}`;
      input.placeholder = field.placeholder;
      input.className = 'input-box';
      fieldsContainer.appendChild(label);
      fieldsContainer.appendChild(input);
    });
  }

  formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      formatButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateFields(btn.dataset.format);
    });
  });

  generateButton.addEventListener('click', async () => {
    const activeFormat = document.querySelector('.format-button.active').dataset.format;
    const inputs = Array.from(fieldsContainer.querySelectorAll('input')).map(i => i.value);
    const body = JSON.stringify({ format: activeFormat, inputs });

    try {
      const response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      const data = await response.json();
      if (data.result) {
        resultBox.innerHTML = data.result
          .replace(/(?:\*\*(.*?)\*\*)/g, '<strong>$1</strong>')
          .replace(/(?:^|\n)(\d+\.)/g, '<br><strong>$1</strong>')
          .replace(/\n/g, '<br>');
      } else {
        resultBox.textContent = '❌ Error generating scene.';
      }
    } catch (error) {
      resultBox.textContent = '❌ Error generating scene.';
    }
  });

  themeToggle.addEventListener('change', () => {
    const html = document.documentElement;
    html.setAttribute('data-theme', themeToggle.checked ? 'dark' : 'light');
  });

  // Initialize defaults
  updateFields('Taboops!');
});
