document.addEventListener("DOMContentLoaded", () => {
  const formatSelect = document.getElementById("format");
  const generateButton = document.getElementById("generate");
  const resultEl = document.getElementById("result");
  const spinner = document.getElementById("spinner");
  const copyButton = document.getElementById("copy-button");
  const themeToggle = document.getElementById("theme-toggle");

  // Initialize theme
  initTheme();

  formatSelect.addEventListener("change", () => {
    updateFields(formatSelect.value);
  });

  generateButton.addEventListener("click", async () => {
    const format = formatSelect.value;
    if (!format) {
      alert("Please select a format.");
      return;
    }

    const input = getInput(format);
    spinner.style.display = "block";
    resultEl.textContent = "";
    copyButton.style.display = "none";

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, input })
      });

      const data = await response.json();
      if (data?.output) {
        resultEl.textContent = data.output;
        copyButton.style.display = "block";
      } else {
        resultEl.textContent = "No response from model.";
      }
    } catch (error) {
      resultEl.textContent = "Something went wrong.";
    } finally {
      spinner.style.display = "none";
    }
  });

  copyButton.addEventListener("click", () => {
    const text = resultEl.textContent;
    navigator.clipboard.writeText(text);
  });

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    let next = "light";
    if (current === "light") next = "dark";
    else if (current === "dark") next = "system";
    else next = "light";

    applyTheme(next);
    localStorage.setItem("theme", next);
    updateThemeLabel(next);
  });

  function initTheme() {
    const saved = localStorage.getItem("theme") || "system";
    applyTheme(saved);
    updateThemeLabel(saved);
  }

  function applyTheme(mode) {
    if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      document.documentElement.setAttribute("data-theme", mode);
    }
  }

  function updateThemeLabel(mode) {
    if (mode === "dark") themeToggle.textContent = "🌙";
    else if (mode === "light") themeToggle.textContent = "☀️";
    else themeToggle.textContent = "🖥️ System";
  }
});

function updateFields(format) {
  const container = document.getElementById("fields-container");
  container.innerHTML = "";

  if (format === "Taboops!") {
    const wordInput = document.createElement("input");
    wordInput.type = "text";
    wordInput.placeholder = "Enter a word for the Taboops! card";
    wordInput.id = "taboops-word";
    container.appendChild(wordInput);

    const checkboxWrapper = document.createElement("div");
    checkboxWrapper.className = "checkbox-wrapper";

    const afterDarkCheckbox = document.createElement("input");
    afterDarkCheckbox.type = "checkbox";
    afterDarkCheckbox.id = "after-dark";
    afterDarkCheckbox.name = "after-dark";

    const checkboxLabel = document.createElement("label");
    checkboxLabel.htmlFor = "after-dark";
    checkboxLabel.innerHTML = "Taboops After Dark 🌒";

    checkboxWrapper.appendChild(afterDarkCheckbox);
    checkboxWrapper.appendChild(checkboxLabel);

    container.appendChild(checkboxWrapper);
  }

  if (format === "Fill in the Bleep!") {
    const promptInput = document.createElement("input");
    promptInput.type = "text";
    promptInput.placeholder = "Name a story you wish was in Mad Libs";
    promptInput.id = "bleep-prompt";
    container.appendChild(promptInput);

    const fields = [
      "Noun",
      "Adjective",
      "Place",
      "Noun",
      "Verb",
      "Random Thing",
      "Another Random Thing"
    ];

    fields.forEach((labelText, i) => {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = labelText;
      input.id = `bleep-${i}`;
      container.appendChild(input);
    });
  }

  if (format === "Buzzwords & Bullsh*t") {
    const topicInput = document.createElement("input");
    topicInput.type = "text";
    topicInput.placeholder = "Enter a buzzwordy topic";
    topicInput.id = "buzz-topic";
    container.appendChild(topicInput);
  }
}

function getInput(format) {
  if (format === "Taboops!") {
    const word = document.getElementById("taboops-word")?.value.trim();
    const isAfterDark = document.getElementById("after-dark")?.checked;
    return `Word: ${word || "Random"} | After Dark: ${isAfterDark}`;
  }

  if (format === "Fill in the Bleep!") {
    const prompt = document.getElementById("bleep-prompt")?.value.trim();
    const parts = [];
    for (let i = 0; i < 7; i++) {
      const val = document.getElementById(`bleep-${i}`)?.value.trim();
      parts.push(val || `[blank ${i + 1}]`);
    }
    return `Story: ${prompt || "Untitled"} | Words: ${parts.join(", ")}`;
  }

  if (format === "Buzzwords & Bullsh*t") {
    const topic = document.getElementById("buzz-topic")?.value.trim();
    return topic || "Synergizing verticals in the metaverse";
  }

  return "";
}
