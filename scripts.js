document.addEventListener("DOMContentLoaded", () => {
  const formatButtons = document.querySelectorAll(".format-button");
  const generateBtn = document.getElementById("generate-btn");
  const resultArea = document.getElementById("result");
  const copyBtn = document.getElementById("copy-button");
  const spinner = document.getElementById("spinner");
  const themeToggle = document.getElementById("theme-toggle");

  let selectedFormat = null;

  // Handle format button selection
  formatButtons.forEach(button => {
    button.addEventListener("click", () => {
      formatButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      selectedFormat = button.dataset.format;
      renderFields();
    });
  });

  // Generate scene content
  generateBtn.addEventListener("click", () => {
    if (!selectedFormat) {
      resultArea.textContent = "Please select a format.";
      return;
    }

    resultArea.textContent = "";
    spinner.style.display = "block";

    setTimeout(() => {
      const prompt = generatePrompt(selectedFormat);
      resultArea.textContent = prompt;
      spinner.style.display = "none";
    }, 500);
  });

  // Copy result
  copyBtn.addEventListener("click", () => {
    const text = resultArea.textContent;
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy to Clipboard";
        }, 1500);
      });
    }
  });

  // Theme toggle
  themeToggle.addEventListener("change", () => {
    const mode = themeToggle.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", mode);
  });

  // Update dynamic field rendering
  function renderFields() {
    const container = document.getElementById("fields-container");
    const afterDarkContainer = document.getElementById("after-dark-container");

    container.innerHTML = "";
    afterDarkContainer.style.display = "none";

    if (selectedFormat === "taboops") {
      const label = document.createElement("label");
      label.textContent = "Taboo Word:";
      label.setAttribute("for", "taboo-input");

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Enter your taboo word";
      input.id = "taboo-input";
      input.className = "input-field";

      container.appendChild(label);
      container.appendChild(input);
      afterDarkContainer.style.display = "inline-flex";
    }
  }

  // Generate content per format
  function generatePrompt(format) {
    if (format === "taboops") {
      const tabooWord = document.getElementById("taboo-input")?.value.trim();
      const isAfterDark = document.getElementById("after-dark")?.checked;
      if (!tabooWord) return "Please enter a taboo word.";
      return `🎭 Avoid saying: "${tabooWord}" in your scene!${isAfterDark ? " And it's After Dark… so no filters allowed. 🌙" : ""}`;
    }

    if (format === "buzzwords") {
      return `📈 Your job: deliver a fake presentation packed with buzzwords like "synergy," "pivot," and "AI-powered innovation."`;
    }

    if (format === "bleep") {
      return `🔇 You've got a key word you're not allowed to say. Act out the scene and let your partner guess the missing "bleep"!`;
    }

    return "Format not recognized.";
  }
});
