const formatSelector = document.getElementById("format");
const fieldsContainer = document.getElementById("fields-container");
const generateButton = document.getElementById("generate");
const resultEl = document.getElementById("result");
const spinner = document.getElementById("spinner");
const copyButton = document.getElementById("copy-button");
const themeSelect = document.getElementById("theme-select");

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

// Theme handling
function applyTheme(theme) {
  if (theme === "system") {
    document.documentElement.setAttribute("data-theme", prefersDark.matches ? "dark" : "light");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
  localStorage.setItem("theme", theme);
  themeSelect.value = theme;
}

themeSelect.addEventListener("change", (e) => {
  applyTheme(e.target.value);
});

prefersDark.addEventListener("change", () => {
  if (localStorage.getItem("theme") === "system") {
    applyTheme("system");
  }
});

applyTheme(localStorage.getItem("theme") || "system");

// Handle format changes
formatSelector.addEventListener("change", () => {
  const format = formatSelector.value;
  fieldsContainer.innerHTML = "";

  if (format === "Taboops!") {
    const label = document.createElement("label");
    label.textContent = "Taboo Word:";
    const input = document.createElement("input");
    input.type = "text";
    input.id = "tabooWord";
    input.placeholder = "Enter your taboo word";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "afterDark";

    const checkboxLabel = document.createElement("label");
    checkboxLabel.setAttribute("for", "afterDark");
    checkboxLabel.textContent = "Taboops After Dark 🌒";

    fieldsContainer.appendChild(label);
    fieldsContainer.appendChild(input);
    fieldsContainer.appendChild(checkbox);
    fieldsContainer.appendChild(checkboxLabel);
  }

  if (format === "Buzzwords & Bullsh*t") {
    const label = document.createElement("label");
    label.textContent = "Buzzword or Topic:";
    const input = document.createElement("input");
    input.type = "text";
    input.id = "buzzTopic";
    input.placeholder = "Enter a corporate buzzword or topic";

    fieldsContainer.appendChild(label);
    fieldsContainer.appendChild(input);
  }

  if (format === "Fill in the Bleep!") {
    const prompts = [
      { id: "storyTitle", label: "Story or Genre", placeholder: "e.g., The Godfather" },
      { id: "noun1", label: "Noun", placeholder: "Enter a noun" },
      { id: "adjective", label: "Adjective", placeholder: "Enter an adjective" },
      { id: "place", label: "Place", placeholder: "Enter a place" },
      { id: "noun2", label: "Another Noun", placeholder: "Enter another noun" },
      { id: "verb", label: "Verb", placeholder: "Enter a verb" },
      { id: "random1", label: "Random Thing #1", placeholder: "Something silly" },
      { id: "random2", label: "Random Thing #2", placeholder: "Another weird thing" },
    ];

    prompts.forEach(({ id, label, placeholder }) => {
      const labelEl = document.createElement("label");
      labelEl.textContent = label;

      const input = document.createElement("input");
      input.type = "text";
      input.id = id;
      input.placeholder = placeholder;

      fieldsContainer.appendChild(labelEl);
      fieldsContainer.appendChild(input);
    });
  }
});

// Generate click
generateButton.addEventListener("click", async () => {
  const format = formatSelector.value;
  const payload = { format };

  if (!format) return alert("Please select a format.");

  if (format === "Taboops!") {
    const word = document.getElementById("tabooWord")?.value;
    const afterDark = document.getElementById("afterDark")?.checked;
    if (!word) return alert("Please enter a taboo word.");
    payload.tabooWord = word;
    payload.afterDark = afterDark;
  }

  if (format === "Buzzwords & Bullsh*t") {
    const buzzword = document.getElementById("buzzTopic")?.value;
    if (!buzzword) return alert("Please enter a buzzword or topic.");
    payload.buzzTopic = buzzword;
  }

  if (format === "Fill in the Bleep!") {
    const fields = ["storyTitle", "noun1", "adjective", "place", "noun2", "verb", "random1", "random2"];
    for (let field of fields) {
      const val = document.getElementById(field)?.value;
      if (!val) return alert(`Please enter a value for ${field}.`);
      payload[field] = val;
    }
  }

  try {
    spinner.style.display = "block";
    resultEl.textContent = "";
    copyButton.style.display = "none";

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    resultEl.textContent = data.result || "🤯 Whoa! We’re out of ideas for a second. Try again?";
    copyButton.style.display = "block";
  } catch (err) {
    console.error("Generation error:", err);
    resultEl.textContent = "❌ Something went wrong. Maybe the improv gods are taking five.";
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
