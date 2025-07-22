document.addEventListener("DOMContentLoaded", () => {
  const formatButtons = document.querySelectorAll(".format-button");
  const generateBtn = document.getElementById("generate-btn");
  const resultArea = document.getElementById("result");
  const copyBtn = document.getElementById("copy-button");
  const spinner = document.getElementById("spinner");
  const themeToggle = document.getElementById("theme-toggle");

  let selectedFormat = null;

  formatButtons.forEach(button => {
    button.addEventListener("click", () => {
      formatButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      selectedFormat = button.textContent.trim();
      renderFields(selectedFormat);
    });
  });

  generateBtn.addEventListener("click", () => {
    if (!selectedFormat) {
      resultArea.textContent = "Please select a format.";
      return;
    }

    resultArea.textContent = "";
    spinner.style.display = "block";

    // Fake loading for demo
    setTimeout(() => {
      const prompt = generatePrompt(selectedFormat);
      resultArea.textContent = prompt;
      spinner.style.display = "none";
    }, 600);
  });

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

  themeToggle.addEventListener("change", () => {
    document.documentElement.setAttribute(
      "data-theme",
      themeToggle.checked ? "dark" : "light"
    );
  });

  function renderFields(format) {
    const container = document.getElementById("fields-container");
    const afterDark = document.getElementById("after-dark-container");
    container.innerHTML = "";

    if (format === "Taboops!") {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Enter your taboo word";
      input.id = "taboo-input";
      input.className = "input-field";
      container.appendChild(input);
      afterDark.style.display = "inline-block";
    } else {
      afterDark.style.display = "none";
    }
  }

  function generatePrompt(format) {
    if (format === "Taboops!") {
      const tabooWord = document.getElementById("taboo-input")?.value.trim();
      const isAfterDark = document.getElementById("after-dark")?.checked;
      if (!tabooWord) return "Please enter a taboo word.";

      return `Your scene prompt must avoid saying the word "${tabooWord}".${isAfterDark ? " Watch your mouth—it's After Dark." : ""}`;
    }

    if (format === "Buzzwords & Bullsh*t") {
      return `You're in a corporate meeting. Incorporate as many meaningless buzzwords as possible while pretending you know what you're talking about.`;
    }

    if (format === "Fill in the Bleep!") {
      return `You're given a sentence with a missing word—your job is to act out the scene and let your partner figure out the missing "bleep."`;
    }

    return "Invalid format.";
  }
});
