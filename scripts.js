const formatButtons = document.querySelectorAll(".format-button");
const fieldsContainer = document.getElementById("fields-container");
const generateBtn = document.getElementById("generate");
const resultSection = document.getElementById("result");
const resultText = document.getElementById("result-text");
const copyBtn = document.getElementById("copy-button");
const tryAgainBtn = document.getElementById("try-again");
const shareBtn = document.getElementById("share");

let selectedFormat = "Taboops!";

// Handle format switching
formatButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    formatButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedFormat = btn.getAttribute("data-format");
    renderFields(selectedFormat);
    resultSection.hidden = true;
  });
});

// Render input fields
function renderFields(format) {
  fieldsContainer.innerHTML = "";

  if (format === "Taboops!") {
    fieldsContainer.innerHTML = `
      <div class="field-group">
        <label for="suggestion">What’s the topic or phrase?</label>
        <input class="user-input" id="suggestion" type="text" placeholder="e.g. Found family, iced coffee, or ghosting your therapist" />
      </div>
    `;
  } else if (format === "Buzzwords & Bullsh*t") {
    fieldsContainer.innerHTML = `
      <div class="field-group">
        <label for="topic">What’s the industry or product?</label>
        <input class="user-input" id="topic" type="text" placeholder="e.g. AI marketing tools, ergonomic gardening gloves" />
      </div>
    `;
  } else if (format === "Fill in the Bleep!") {
    fieldsContainer.innerHTML = `
      <div class="field-group">
        <label for="theme">What’s the theme or category?</label>
        <input class="user-input" id="theme" type="text" placeholder="e.g. Bad boss moments, dating fails" />
      </div>
    `;
  }
}

// Generate output
generateBtn.addEventListener("click", () => {
  const inputField = fieldsContainer.querySelector("input");
  const inputValue = inputField?.value.trim();

  if (!inputValue) {
    alert("Please enter something to work with.");
    return;
  }

  const prompt = `Here's your generated ${selectedFormat} prompt based on: "${inputValue}"\n\n[Fake AI-generated output here 🤖]`;

  resultText.textContent = prompt;
  resultSection.hidden = false;
});

// Copy to clipboard
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(resultText.textContent).then(() => {
    alert("Copied to clipboard!");
  });
});

// Try Again
tryAgainBtn.addEventListener("click", () => {
  resultSection.hidden = true;
  const input = fieldsContainer.querySelector("input");
  if (input) input.focus();
});

// Share (placeholder)
shareBtn.addEventListener("click", () => {
  alert("Sharing coming soon!");
});

// Theme toggle
const themeToggle = document.getElementById("theme-toggle");
const htmlElement = document.documentElement;

// Apply theme on load
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("coldOpenTheme") || "light";
  htmlElement.setAttribute("data-theme", savedTheme);
  themeToggle.checked = savedTheme === "dark";
  renderFields(selectedFormat);
});

// Listen for toggle
themeToggle.addEventListener("change", () => {
  const newTheme = themeToggle.checked ? "dark" : "light";
  htmlElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("coldOpenTheme", newTheme);
});