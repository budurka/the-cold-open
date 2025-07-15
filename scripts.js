const formatSelector = document.getElementById("format");
const fieldsContainer = document.getElementById("fields-container");
const resultBox = document.getElementById("result");
const spinner = document.getElementById("spinner");
const copyBtn = document.getElementById("copy-button");
const toggleBtn = document.getElementById("theme-toggle");

const formatFields = {
  "Taboops!": [
    { id: "word", label: "Taboo Word" }
  ],
  "Buzzwords & Bullsh*t": [
    { id: "topic", label: "Topic or Theme" }
  ],
  "Fill In The Bleep!": [
    { id: "title", label: "Name of the Story You Wish Existed" },
    { id: "noun1", label: "Noun" },
    { id: "adjective", label: "Adjective" },
    { id: "place", label: "Place" },
    { id: "noun2", label: "Another Noun" },
    { id: "verb", label: "Verb" },
    { id: "random1", label: "Random Thing 1" },
    { id: "random2", label: "Random Thing 2" }
  ]
};

function renderFields(format) {
  fieldsContainer.innerHTML = "";
  resultBox.textContent = ""; // Auto-clear result when format changes
  copyBtn.style.display = "none";

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
    copyBtn.style.display = "inline-block";
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

toggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");

  if (isDark) {
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    toggleBtn.textContent = "🌙";
  } else {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
    toggleBtn.textContent = "☀️";
  }
});
