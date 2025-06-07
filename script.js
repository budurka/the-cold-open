const formatSelector = document.getElementById("format");
const fieldsContainer = document.getElementById("fields-container");
const resultBox = document.getElementById("result");
const spinner = document.getElementById("spinner");
const copyBtn = document.getElementById("copy-button");
const toggleBtn = document.getElementById("theme-toggle");

const formatFields = {
  "P-AI-lot Episode": [
    { id: "location", label: "Bizarre Location" },
    { id: "object", label: "Unlikely Object" },
    { id: "emotion", label: "Over-the-top Emotion or Goal" }
  ],
  "Trailer Trash": [
    { id: "concept", label: "Concept or Keyword(s)" }
  ],
  "Game Show Mayhem": [
    { id: "classic", label: "Classic Game" }
  ],
  "Real Drama": [
    { id: "setting", label: "Location or Type of Drama" }
  ],
  "Taboops!": [
    { id: "word", label: "Taboo Word" }
  ],
  "Buzzwords & Bullsh*t": [
    { id: "topic", label: "Topic or Theme" },
    { id: "quantity", label: "How many?" }
  ]
};

// render appropriate fields
function renderFields(format) {
  fieldsContainer.innerHTML = "";

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

// on change, show inputs
formatSelector.addEventListener("change", () => {
  const selected = formatSelector.value;
  renderFields(selected);
});

// on click, generate
document.getElementById("generate").addEventListener("click", async () => {
  const format = formatSelector.value;
  const inputs = fieldsContainer.querySelectorAll("input");
  const inputPairs = [];

  inputs.forEach(input => {
    const label = fieldsContainer.querySelector(`label[for="${input.id}"]`);
    inputPairs.push(`${label.textContent}: ${input.value}`);
  });

  const inputText = inputPairs.join(" | ");

  spinner.style.display = "block";
  resultBox.textContent = "";
  copyBtn.style.display = "none";

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format, input: inputText })
    });

    const data = await res.json();

    if (data.result) {
      resultBox.textContent = data.result;
      copyBtn.style.display = "inline-block";
    } else {
      resultBox.textContent = `⚠️ ${data.error || 'No response'}\n${data.details || ''}`;
    }
  } catch (err) {
    resultBox.textContent = `❌ Fetch error: ${err.message}`;
  } finally {
    spinner.style.display = "none";
  }
});

// copy button
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(resultBox.textContent).then(() => {
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => (copyBtn.textContent = "📋 Copy to Clipboard"), 2000);
  });
});

// light/dark toggle
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
});
