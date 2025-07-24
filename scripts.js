document.addEventListener("DOMContentLoaded", () => {
  const formatButtons = document.querySelectorAll(".format-button");
  const fieldsContainer = document.getElementById("fields-container");
  const resultContainer = document.getElementById("result");
  const generateButton = document.getElementById("generate");
  const themeToggle = document.getElementById("theme-toggle");

  let currentFormat = "Taboops!";

  // === FORMAT SWITCHING ===
  formatButtons.forEach((button) => {
    button.addEventListener("click", () => {
      formatButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentFormat = button.dataset.format;
      renderFields();
      resultContainer.innerHTML = "";
    });
  });

  // === THEME TOGGLE ===
  themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    html.setAttribute("data-theme", isDark ? "light" : "dark");
    themeToggle.textContent = isDark ? "🌙 / 🌞" : "🌞 / 🌙";
  });

  // === INPUT FIELD LOGIC ===
  function renderFields() {
    fieldsContainer.innerHTML = "";

    const field = (labelText, id, placeholder) => `
      <div class="field-group">
        <label for="${id}">${labelText}</label>
        <input type="text" class="user-input" id="${id}" placeholder="${placeholder}">
      </div>
    `;

    if (currentFormat === "Taboops!") {
      fieldsContainer.innerHTML = field("Taboo Word", "tabooWord", "Enter a word to avoid");
    } else if (currentFormat === "Buzzwords & Bullsh*t") {
      fieldsContainer.innerHTML = field("Buzzword Theme", "buzzTopic", "e.g., Funny phrases a Walmart greeter might say");
    } else if (currentFormat === "Fill in the Bleep!") {
      const fields = [
        { label: "Story or Genre", id: "story", placeholder: "e.g., The Godfather" },
        { label: "Noun", id: "noun1", placeholder: "Enter a noun" },
        { label: "Adjective", id: "adj", placeholder: "Enter an adjective" },
        { label: "Place", id: "place", placeholder: "Enter a place" },
        { label: "Another Noun", id: "noun2", placeholder: "Enter another noun" },
        { label: "Verb", id: "verb", placeholder: "Enter a verb" },
        { label: "Random Thing #1", id: "random1", placeholder: "Something silly" },
        { label: "Random Thing #2", id: "random2", placeholder: "Another weird thing" },
      ];
      fieldsContainer.innerHTML = fields.map(f => field(f.label, f.id, f.placeholder)).join("");
    } else if (currentFormat === "What’s in the Box?") {
      fieldsContainer.innerHTML = field("Suggestion", "boxPrompt", "e.g., a vampire’s fridge");
    }
  }

  renderFields(); // Initial load

  // === GENERATE BUTTON ===
  generateButton.addEventListener("click", async (e) => {
    e.preventDefault();
    resultContainer.innerHTML = "<span class='loading'>Generating...</span>";

    const data = { format: currentFormat };
    if (currentFormat === "Taboops!") {
      data.tabooWord = document.getElementById("tabooWord").value.trim();
    } else if (currentFormat === "Buzzwords & Bullsh*t") {
      data.buzzTopic = document.getElementById("buzzTopic").value.trim();
    } else if (currentFormat === "Fill in the Bleep!") {
      ["story", "noun1", "adj", "place", "noun2", "verb", "random1", "random2"].forEach(id => {
        data[id] = document.getElementById(id).value.trim();
      });
    } else if (currentFormat === "What’s in the Box?") {
      data.boxPrompt = document.getElementById("boxPrompt").value.trim();
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const res = await response.json();
      if (res.error) {
        resultContainer.innerHTML = `<div class='error'>❌ ${res.error}</div>`;
      } else {
        resultContainer.innerHTML = `
          <div class="result-text">${res.result}</div>
          <button class="copy-btn" id="copy-button">📋 Copy</button>
        `;
        document.getElementById("copy-button").addEventListener("click", () => {
          navigator.clipboard.writeText(res.result);
          const btn = document.getElementById("copy-button");
          btn.innerText = "✅ Copied!";
          setTimeout(() => (btn.innerText = "📋 Copy"), 2000);
        });
      }
    } catch (err) {
      resultContainer.innerHTML = `<div class='error'>❌ Something went wrong.</div>`;
      console.error(err);
    }
  });
});
