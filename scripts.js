const formatSelector = document.getElementById("format");
const fieldsContainer = document.getElementById("fields-container");
const resultBox = document.getElementById("result");
const spinner = document.getElementById("spinner");
const copyBtn = document.getElementById("copy-button");
const themeSelect = document.getElementById("theme-select");
const afterDarkContainer = document.getElementById("after-dark-container");
const afterDarkCheckbox = document.getElementById("after-dark");

const formatFields = {
  "Taboops!": [],
  "Buzzwords & Bullsh*t": [
    { id: "topic", label: "Topic or Theme" }
  ],
  "Fill in the Bleep!": [
    { id: "storyTitle", label: "What should this story be called?" },
    { id: "noun1", label: "Noun" },
    { id: "adjective", label: "Adjective" },
    { id: "place", label: "Place" },
    { id: "noun2", label: "Another Noun" },
    { id: "verb", label: "Verb" },
    { id: "thing1", label: "Random Thing #1" },
    { id: "thing2", label: "Random Thing #2" }
  ]
};

// Theme handling
function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    html.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    html.setAttribute("data-theme", theme);
  }
  localStorage.setItem("theme", theme);
}

themeSelect.addEventListener("change", () => {
  applyTheme(themeSelect.value);
});

// Load theme preference
const savedTheme = localStorage.getItem("theme") || "system";
themeSelect.value = savedTheme;
applyTheme(savedTheme);

// Render fields
function renderFields(format) {
  fieldsContainer.innerHTML = "";
  resultBox.textContent = "";
  copyBtn.style.display = "none";
  afterDarkContainer.style.display = format === "Taboops!" ? "block" : "none";

  if (!formatFields[format]) return;

  formatFields[format].forEach(({ id, label }) => {
    const labelEl = document.createElement("label");
    labelEl.setAttribute("for", id);
    labelEl.textContent = label;

    const inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.id = id;
    inputEl.name = id;

    fieldsContainer.appendChild(labelEl);
    fieldsContainer.appendChild(inputEl);
  });
}

formatSelector.addEventListener("change", () => {
  renderFields(formatSelector.value);
});

document.getElementById("generate").addEventListener("click", async () => {
  const format = formatSelector.value;
  const inputs = fieldsContainer.querySelectorAll("input");
  const inputPairs = [];

  inputs.forEach(input => {
    const label = fieldsContainer.querySelector(`label[for="${input.id}"]`);
    inputPairs.push(`${label.textContent}: ${input.value}`);
  });

  // Add After Dark value if relevant
  const afterDarkEnabled = afterDarkCheckbox.checked;
  if (format === "Taboops!") {
    inputPairs.push(`After Dark: ${afterDarkEnabled ? "true" : "false"}`);
  }

  spinner.style.display = "block";
  resultBox.textContent = "";
  copyBtn.style.display = "none";

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format, input: inputPairs.join(" | ") })
    });

    const data = await res.json();
    resultBox.textContent = data.result || "No response.";
    if (data.result) {
      copyBtn.style.display = "inline-block";
    }
  } catch (err) {
    resultBox.textContent = "Something went wrong.";
  } finally {
    spinner.style.display = "none";
  }
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(resultBox.textContent).then(() => {
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => (copyBtn.textContent = "📋 Copy to Clipboard"), 2000);
  });
});
