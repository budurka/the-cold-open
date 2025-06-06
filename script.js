const formatSelector = document.getElementById("format");
const fieldsContainer = document.getElementById("fields-container");

const formatFields = {
  "P-AI-lot Episode": [
    { id: "location", label: "Bizarre Location" },
    { id: "object", label: "Unlikely Object" },
    { id: "emotion", label: "Over-the-top Emotion or Goal" }
  ],
  "Trailer Trash": [
    { id: "concept", label: "Concept or Keyword" }
  ],
  "Game Show Mayhem": [
    { id: "theme", label: "Theme or Suggestion" }
  ],
  "Decks & Drama": [
    { id: "setting", label: "Setting or Type of Drama" }
  ],
  "Taboops!": [
    { id: "word", label: "Taboo Word" }
  ]
};

formatSelector.addEventListener("change", () => {
  const selected = formatSelector.value;
  fieldsContainer.innerHTML = "";
  if (!formatFields[selected]) return;
  formatFields[selected].forEach(field => {
    const label = document.createElement("label");
    label.textContent = field.label;
    label.setAttribute("for", field.id);
    const input = document.createElement("input");
    input.type = "text";
    input.id = field.id;
    input.name = field.id;
    fieldsContainer.appendChild(label);
    fieldsContainer.appendChild(input);
  });
});

document.getElementById("generate").addEventListener("click", async () => {
  const format = formatSelector.value;
  const inputs = fieldsContainer.querySelectorAll("input");
  const inputPairs = [];
  inputs.forEach(input => {
    const label = fieldsContainer.querySelector(`label[for="\${input.id}"]`);
    inputPairs.push(`\${label.textContent}: \${input.value}`);
  });
  const inputText = inputPairs.join(" | ");
  const resultEl = document.getElementById("result");
  resultEl.textContent = "Generating...";
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ format, input: inputText })
  });
  const data = await response.json();
  resultEl.textContent = data.result || "No response.";
});