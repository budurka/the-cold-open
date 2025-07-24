const themeToggle = document.getElementById("theme-toggle");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  const newTheme = themeToggle.checked ? "dark" : "light";
  applyTheme(newTheme);
}

themeToggle.addEventListener("change", toggleTheme);

const savedTheme = localStorage.getItem("theme") || "light";
themeToggle.checked = savedTheme === "dark";
applyTheme(savedTheme);

const formatButtons = document.querySelectorAll(".format-button");
const fieldsContainer = document.getElementById("fields-container");
const generateButton = document.getElementById("generate");
const resultBox = document.getElementById("result");

let currentFormat = "Taboops!";

formatButtons.forEach((button) => {
  button.addEventListener("click", () => {
    formatButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    currentFormat = button.dataset.format;
    resultBox.textContent = "";
    renderFields(currentFormat);
  });
});

function renderFields(format) {
  fieldsContainer.innerHTML = "";

  if (format === "Taboops!") {
    fieldsContainer.innerHTML = `
      <div class="field-group">
        <label for="tabooWord">Taboo Word</label>
        <input class="user-input" type="text" id="tabooWord" placeholder="Enter a word to avoid">
      </div>`;
  }

  if (format === "Buzzwords & Bullsh*t") {
    fieldsContainer.innerHTML = `
      <div class="field-group">
        <label for="buzzTopic">Buzzword Theme</label>
        <input class="user-input" type="text" id="buzzTopic" placeholder="e.g., Gen Z phrases, things a boss says">
      </div>`;
  }

  if (format === "Fill in the Bleep!") {
    const prompts = [
      { id: "story", label: "Story or Theme", placeholder: "e.g., The Godfather" },
      { id: "noun1", label: "Noun", placeholder: "Enter a noun" },
      { id: "adj", label: "Adjective", placeholder: "Enter an adjective" },
      { id: "place", label: "Place", placeholder: "Enter a place" },
      { id: "noun2", label: "Another Noun", placeholder: "Enter another noun" },
      { id: "verb", label: "Verb", placeholder: "Enter a verb" },
      { id: "random1", label: "Random Thing #1", placeholder: "Something silly" },
      { id: "random2", label: "Random Thing #2", placeholder: "Another weird thing" },
    ];

    prompts.forEach(({ id, label, placeholder }) => {
      const group = document.createElement("div");
      group.className = "field-group";
      group.innerHTML = `
        <label for="${id}">${label}</label>
        <input class="user-input" type="text" id="${id}" placeholder="${placeholder}">`;
      fieldsContainer.appendChild(group);
    });
  }
}

generateButton.addEventListener("click", async () => {
  let inputs = {};
  if (currentFormat === "Taboops!") {
    const word = document.getElementById("tabooWord").value;
    if (!word) return alert("Please enter a taboo word.");
    inputs = { format: currentFormat, tabooWord: word };
  } else if (currentFormat === "Buzzwords & Bullsh*t") {
    const buzzword = document.getElementById("buzzTopic").value;
    if (!buzzword) return alert("Please enter a theme.");
    inputs = { format: currentFormat, buzzTopic: buzzword };
  } else if (currentFormat === "Fill in the Bleep!") {
    const ids = ["story", "noun1", "adj", "place", "noun2", "verb", "random1", "random2"];
    for (const id of ids) {
      const val = document.getElementById(id).value;
      if (!val) return alert(`Please enter a value for ${id}.`);
      inputs[id] = val;
    }
    inputs.format = currentFormat;
  }

  resultBox.innerHTML = "<span class='loading'>⏳ Generating...</span>";

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputs),
    });

    const data = await res.json();
    resultBox.innerHTML = `<pre>${data.result || "No result."}</pre>
    <button class="copy-btn" onclick="copyToClipboard()">📋 Copy</button>`;
  } catch (err) {
    resultBox.innerHTML = "<span class='error'>❌ Error generating output.</span>";
    console.error(err);
  }
});

function copyToClipboard() {
  const text = document.querySelector("#result pre").textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied to clipboard!");
  });
}

renderFields(currentFormat);
