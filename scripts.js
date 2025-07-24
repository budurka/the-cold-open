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
  });
});

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

  resultText.textContent = `Here's your generated ${selectedFormat} prompt based on: "${inputValue}"\n\n[Fake AI-generated output here 🤖]`;
  resultSection.hidden = false;
});

// Copy button
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(resultText.textContent).then(() => {
    alert("Copied to clipboard!");
  });
});

// Try again button
tryAgainBtn.addEventListener("click", () => {
  resultSection.hidden = true;
  fieldsContainer.querySelector("input").focus();
});

// Share button placeholder
shareBtn.addEventListener("click", () => {
  alert("Sharing coming soon!");
});