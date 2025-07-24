document.addEventListener("DOMContentLoaded", () => {
  const formatButtons = document.querySelectorAll(".format-button");
  const fieldsContainer = document.getElementById("fields-container");
  const resultContainer = document.getElementById("result");
  const generateButton = document.getElementById("generate");
  const copyButton = document.getElementById("copy-button");
  const backLink = document.getElementById("back-link");
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
    const currentTheme = html.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    themeToggle.classList.toggle("active", newTheme === "dark");
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
    }
  }

  renderFields(); // Initial load

  // === GENERATE BUTTON ===
  generateButton.addEventListener("click", async () => {
    resultContainer.innerHTML = "<span class='loading'>Generating...</span>";

    const data = { format: currentFormat };
    if (currentFormat === "Taboops!") {
      data.tabooWord = document.getElementById("tabooWord").value.trim();
    } else if (currentFormat === "Buzzwords & Bullsh*t") {
      data.buzzTopic = document.getElementById("buzzTopic").value.trim();
    } else if (currentFormat === "Fill in the Bleep!") {
      ["story", "noun1", "adj", "place", "noun2", "verb", "random1", "random2"].forEach(id => {
        const val = document.getElementById(id).value.trim();
        data[id] = val;
      });
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
          <pre>${res.result}</pre>
          <button class="copy-btn" id="copy-button">📋 Copy</button>
        `;

        // Copy Button Logic
        document.getElementById("copy-button").addEventListener("click", () => {
          navigator.clipboard.writeText(res.result);
          document.getElementById("copy-button").innerText = "✅ Copied!";
          setTimeout(() => {
            document.getElementById("copy-button").innerText = "📋 Copy";
          }, 2000);
        });
      }
    } catch (err) {
      resultContainer.innerHTML = `<div class='error'>❌ Something went wrong.</div>`;
      console.error(err);
    }
  });

  // === BACK LINK ===
  backLink.addEventListener("click", () => {
    window.location.href = "https://chasebudurka.com";
  });
});
