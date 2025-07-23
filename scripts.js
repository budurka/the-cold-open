const themeToggle = document.getElementById("theme-toggle");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  const newTheme = themeToggle.checked ? "dark" : "light";
  applyTheme(newTheme);
}

themeToggle.addEventListener("change", toggleTheme);
const saved = localStorage.getItem("theme") || "light";
themeToggle.checked = saved === "dark";
applyTheme(saved);

// Setup
const formatButtons = document.querySelectorAll(".format-button");
const fieldsContainer = document.getElementById("fields-container");
const generateButton = document.getElementById("generate");
const resultBox = document.getElementById("result");

let currentFormat = "Taboops!";

formatButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    formatButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFormat = btn.dataset.format;
    resultBox.textContent = "";
    renderFields(currentFormat);
  });
});

function renderFields(format) {
  fieldsContainer.innerHTML = "";
  const panel = document.createElement("div");
  panel.className = "input-panel";

  if (format === "Taboops!") {
    panel.innerHTML = `
      <label for="taboo">Taboo Word</label>
      <input type="text" id="taboo" placeholder="Enter your taboo word">
    `;
  }

  if (format === "Buzzwords & Bullsh*t") {
    panel.innerHTML = `
      <label for="buzzword">Topic or Context</label>
      <input type="text" id="buzzword" placeholder="e.g., board meetings at an ice cream company">
    `;
  }

  if (format === "Fill in the Bleep!") {
    const prompts = [
      { id: "story", label: "Story or Theme", placeholder: "e.g., My date was on their phone the whole time" },
      { id: "noun1", label: "Noun", placeholder: "Enter a noun" },
      { id: "adj", label: "Adjective", placeholder: "Enter an adjective" },
      { id: "place", label: "Place", placeholder: "Enter a place" },
      { id: "noun2", label: "Another Noun", placeholder: "Enter another noun" },
      { id: "verb", label: "Verb", placeholder: "Enter a verb" },
      { id: "random1", label: "Random Thing #1", placeholder: "Something silly" },
      { id: "random2", label: "Random Thing #2", placeholder: "Another weird thing" }
    ];
    prompts.forEach(({ id, label, placeholder }) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <label for="${id}">${label}</label>
        <input type="text" id="${id}" placeholder="${placeholder}">
      `;
      panel.appendChild(wrapper);
    });
  }

  fieldsContainer.appendChild(panel);
}

generateButton.addEventListener("click", async () => {
  let inputs = {};
  if (currentFormat === "Taboops!") {
    const taboo = document.getElementById("taboo")?.value.trim();
    if (!taboo) return alert("Please enter a Taboo word.");
    inputs = { tabooWord: taboo };
  } else if (currentFormat === "Buzzwords & Bullsh*t") {
    const buzz = document.getElementById("buzzword")?.value.trim();
    if (!buzz) return alert("Please enter a Topic.");
    inputs = { buzzTopic: buzz };
  } else {
    const ids = ["story","noun1","adj","place","noun2","verb","random1","random2"];
    for (let id of ids) {
      const val = document.getElementById(id)?.value.trim();
      if (!val) return alert(`Please enter ${id}.`);
      inputs[id] = val;
    }
  }

  resultBox.textContent = "⏳ Generating…";
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ format: currentFormat, ...inputs })
    });
    const data = await res.json();
    resultBox.textContent = data.result || "No result.";
  } catch (e) {
    console.error(e);
    resultBox.textContent = "❌ Error generating scene.";
  }
});

// initial load
renderFields(currentFormat);
