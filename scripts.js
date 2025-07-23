document.addEventListener('DOMContentLoaded', () => {
  const formatButtons = document.querySelectorAll('.format-button');
  const fieldsContainer = document.getElementById('fields-container');
  const generateButton = document.getElementById('generate');
  const resultBox = document.getElementById('result');
  const themeToggle = document.getElementById('theme-toggle');

  // Format switching
  formatButtons.forEach(button => {
    button.addEventListener('click', () => {
      formatButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      renderFields(button.dataset.format);
    });
  });

  // Theme toggling
  themeToggle.addEventListener('change', () => {
    document.documentElement.setAttribute('data-theme', themeToggle.checked ? 'dark' : 'light');
  });

  function renderFields(format) {
    fieldsContainer.innerHTML = ''; // clear previous fields

    const fields = {
      "Taboops!": [{ label: "Taboo Word", placeholder: "e.g., Hawaii" }],
      "Buzzwords & Bullsh*t": [{ label: "Theme", placeholder: "e.g., Things you'd hear in an ice cream boardroom" }],
      "Fill in the Bleep!": [
        { label: "Story or Genre", placeholder: "e.g., The Godfather" },
        { label: "Noun", placeholder: "Enter a noun" },
        { label: "Adjective", placeholder: "Enter an adjective" },
        { label: "Place", placeholder: "Enter a place" },
        { label: "Another Noun", placeholder: "Enter another noun" },
        { label: "Verb", placeholder: "Enter a verb" },
        { label: "Random Thing #1", placeholder: "Something silly" },
        { label: "Random Thing #2", placeholder: "Another weird thing" }
      ]
    };

    fields[format].forEach(field => {
      const label = document.createElement('label');
      label.textContent = field.label;

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = field.placeholder;

      fieldsContainer.appendChild(label);
      fieldsContainer.appendChild(input);
    });
  }

  renderFields("Taboops!"); // default on load

  generateButton.addEventListener('click', async () => {
    const activeFormat = document.querySelector('.format-button.active').dataset.format;
    const inputs = Array.from(fieldsContainer.querySelectorAll('input')).map(input => input.value);

    resultBox.innerHTML = '';

    try {
      const response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: activeFormat, inputs })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Unknown error');

      const lines = data.result.split('\n').filter(Boolean);
      resultBox.innerHTML = lines.map(line => {
        if (/^\*\*(.*?)\*\*/.test(line)) return `<p><strong>${line.replace(/\*\*/g, '')}</strong></p>`;
        if (/^\d+\./.test(line)) return `<p>${line}</p>`;
        return `<p>${line}</p>`;
      }).join('');
    } catch (err) {
      resultBox.innerHTML = `<p class="error">❌ Error generating scene.</p>`;
      console.error(err);
    }
  });
});
