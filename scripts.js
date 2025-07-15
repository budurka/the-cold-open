const formatSelector = document.getElementById("format");
const fieldsContainer = document.getElementById("fields-container");
const generateButton = document.getElementById("generate");
const resultEl = document.getElementById("result");
const spinner = document.getElementById("spinner");
const copyButton = document.getElementById("copy-button");
const themeSelect = document.getElementById("theme-select");

// Apply theme preference
function applyTheme(theme) {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
  localStorage.setItem("theme", theme);
}

// Initialize theme on load
const savedTheme = localStorage.getItem("theme") || "system";
themeSelect.value = savedTheme;
applyTheme(savedTheme);

// Listen for theme change
themeSelect.addEventListener("change", () => {
  const selectedTheme = themeSelect.value;
  applyTheme(selectedTheme);
});

// Update fields when format changes
formatSelector.addEventListener("change", () => {
  const format = formatSelector.value;
  fieldsContainer.innerHTML = "";

  if (format === "Taboops!") {
    const tabooLabel = document.createElement("label");
    tabooLabel.htmlFor = "tabooWord";
    tabooLabel.textContent = "Taboo Word:";

    const tabooInput = document.createElement("input");
    tabooInput.type = "text";
    tabooInput.id = "tabooWord";
    tabooInput.placeholder = "Enter your taboo word";
    tabooInput.required = true;

    const afterDarkCheckbox = document.createElement("input");
    afterDarkCheckbox.type = "checkbox";
    afterDarkCheckbox.id = "afterDark";

    const afterDarkLabel = document.createElement("label");
    afterDarkLabel.htmlFor = "afterDark";
    afterDarkLabel.textContent = "Taboops After Dark 🌒";

    fieldsContainer.appendChild(tabooLabel);
    fieldsContainer.appendChild(tabooInput);
    fieldsContainer.appendChild(afterDarkCheckbox);
    fieldsContainer.appendChild(afterDarkLabel);
  }

  if (format === "Buzzwords & Bullsh*t") {
    const buzzLabel = document.createElement("label");
    buzzLabel.htmlFor = "buzzTopic";
    buzzLabel.textContent = "Buzzword or Topic:";

    const buzzInput = document.createElement("input");
    buzzInput.type = "text";
    buzzInput.id = "buzzTopic";
    buzzInput.placeholder = "Enter a corporate buzzword or topic";
    buzzInput.required = true;

    fieldsContainer.appendChild(buzzLabel);
    fieldsContainer.appendChild(buzzInput);
  }

  if (format === "Fill in the Bleep!") {
    const prompts = [
      { id: "storyTitle", label: "Story Title or Genre", placeholder: "e.g., The Godfather, Star Wars" },
      { id: "noun", label: "Noun", placeholder: "Enter a noun" },
      { id: "adjective", label: "Adjective", placeholder: "Enter an adjective" },
      { id: "place", label: "Place", placeholder: "Enter a place" },
      { id: "noun2", label: "Another Noun", placeholder: "Enter another noun" },
      { id: "verb", label: "Verb", placeholder: "Enter a verb" },
      { id: "random1", label: "Random Thing #1", placeholder: "Something weird or funny" },
      { id: "random2", label: "Random Thing #2", placeholder: "Something else strange" },
    ];

    prompts.forEach(({ id, label, placeholder }) => {
      const inputLabel = document.createElement("label");
      inputLabel.htmlFor = id;
      inputLabel.textContent = label;

      const input = document.createElement("input");
      input.type = "text";
      input.id = id;
      input.placeholder = placeholder;
      input.required = true;

      fieldsContainer.appendChild(inputLabel);
      fieldsContainer.appendChild(input);
    });
  }
});

generateButton.addEventListener("click", async () => {
  const format = formatSelector.value;
  const inputs = {};

  if (!format) return alert("Please select a format first.");

  if (format === "Taboops!") {
    inputs.word = document.getElementById("tabooWord")?.value;
    inputs.isAfterDark = document.getElementById("afterDark")?.checked;
    if (!inputs.word) return alert("Please enter a taboo word.");
  }

  if (format === "Buzzwords & Bullsh*t") {
    inputs.buzzword = document.getElementById("buzzTopic")?.value;
    if (!inputs.buzzword) return alert("Please enter a buzzword or topic.");
  }

  if (format === "Fill in the Bleep!") {
    ["storyTitle", "noun", "adjective", "place", "noun2", "verb", "random1", "random2"].forEach((id) => {
      inputs[id] = document.getElementById(id)?.value;
    });
    if (Object.values(inputs).some((v) => !v)) {
      return alert("Please fill in all the fields for Fill in the Bleep.");
    }
  }

  try {
    spinner.style.display = "block";
    resultEl.textContent = "";
    copyButton.style.display = "none";

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format, ...inputs }),
    });

    const data = await res.json();
    resultEl.textContent = data.result || "No result.";
    copyButton.style.display = "block";
  } catch (err) {
    console.error("Generation error:", err);
    resultEl.textContent = "Something went wrong.";
  } finally {
    spinner.style.display = "none";
  }
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultEl.textContent);
    copyButton.textContent = "✅ Copied!";
    setTimeout(() => (copyButton.textContent = "📋 Copy to Clipboard"), 2000);
  } catch (err) {
    copyButton.textContent = "❌ Failed";
  }
});
