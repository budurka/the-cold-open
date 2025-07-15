// scripts.js

const formatButtons = document.querySelectorAll("#format-buttons button");
const fieldsContainer = document.getElementById("fields-container");
const generateButton = document.getElementById("generate");
const resultEl = document.getElementById("result");
const spinner = document.getElementById("spinner");
const copyButton = document.getElementById("copy-button");
const themeSelect = document.getElementById("theme-select");

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
let currentFormat = "";

// Theme initialization
function applyTheme(theme) {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.setAttribute(
      "data-theme",
      prefersDark.matches ? "dark" : "light"
    );
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
  localStorage.setItem("theme", theme);
  themeSelect.value = theme;
}

themeSelect.addEventListener("change", (e) => applyTheme(e.target.value));
prefersDark.addEventListener("change", () => {
  const saved = localStorage.getItem("theme") || "system";
  if (saved === "system") applyTheme("system");
});

applyTheme(localStorage.getItem("theme") || "system");

// Format switch handling
formatButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFormat = button.dataset.format;
    formatButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");

    resultEl.textContent = "";
    copyButton.style.display = "none";
    fieldsContainer.innerHTML = "";

    const panel = document.createElement("div");
    panel.className = "input-panel";

    if (currentFormat === "Taboops!") {
      panel.innerHTML = `
        <label for="tabooWord">Taboo Word:</label>
        <input type="text" id="tabooWord" placeholder="Enter your taboo word">
        <div class="checkbox-group">
          <input type="checkbox" id="afterDark">
          <label for="afterDark">Taboops After Dark 🌒</label>
        </div>`;
    }

    if (currentFormat === "Buzzwords & Bullsh*t") {
      panel.innerHTML = `
        <label for="buzzTopic">Buzzword or Topic:</label>
        <input type="text" id="buzzTopic" placeholder="Enter a corporate buzzword or topic">`;
    }

    if (currentFormat === "Fill in the Bleep!") {
      const prompts = [
        { id: "storyTitle", label: "Story or Genre", placeholder: "e.g., The Godfather" },
        { id: "noun1", label: "Noun", placeholder: "Enter a noun" },
        { id: "adjective", label: "Adjective", placeholder: "Enter an adjective" },
        { id: "place", label: "Place", placeholder: "Enter a place" },
        { id: "noun2", label: "Another Noun", placeholder: "Enter another noun" },
        { id: "verb", label: "Verb", placeholder: "Enter a verb" },
        { id: "random1", label: "Random Thing #1", placeholder: "Something silly" },
        { id: "random2", label: "Random Thing #2", placeholder: "Another weird thing" }
      ];

      prompts.forEach(({ id, label, placeholder }) => {
        const wrapper = document.createElement("div");
        wrapper.className = "field-group";
        wrapper.innerHTML = `
          <label for="${id}">${label}</label>
          <input type="text" id="${id}" placeholder="${placeholder}">`;
        panel.appendChild(wrapper);
      });
    }

    fieldsContainer.appendChild(panel);
  });
});

// Generate result
generateButton.addEventListener("click", async () => {
  if (!currentFormat) return alert("Please select a format.");
  const inputs = {};

  if (currentFormat === "Taboops!") {
    const word = document.getElementById("tabooWord")?.value;
    const afterDark = document.getElementById("afterDark")?.checked;
    if (!word) return alert("Please enter a taboo word.");
    inputs.tabooWord = word;
    inputs.afterDark = afterDark;
  }

  if (currentFormat === "Buzzwords & Bullsh*t") {
    const buzzword = document.getElementById("buzzTopic")?.value;
    if (!buzzword) return alert("Please enter a buzzword or topic.");
    inputs.buzzTopic = buzzword;
  }

  if (currentFormat === "Fill in the Bleep!") {
    const ids = ["storyTitle", "noun1", "adjective", "place", "noun2", "verb", "random1", "random2"];
    for (const id of ids) {
      const val = document.getElementById(id)?.value;
      if (!val) return alert(`Please enter a value for ${id}.`);
      inputs[id] = val;
    }
  }

  try {
    spinner.style.display = "block";
    resultEl.textContent = "";
    copyButton.style.display = "none";

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: currentFormat, ...inputs })
    });

    const data = await response.json();
    resultEl.textContent = data.result || "No result.";
    copyButton.style.display = "block";
  } catch (error) {
    console.error("Generation error:", error);
    resultEl.textContent = "Something went wrong.";
  } finally {
    spinner.style.display = "none";
  }
});

// Copy to clipboard
copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultEl.textContent);
    copyButton.textContent = "✅ Copied!";
    setTimeout(() => (copyButton.textContent = "📋 Copy to Clipboard"), 2000);
  } catch {
    copyButton.textContent = "❌ Failed";
  }
});
