const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

themeToggle.checked = localStorage.getItem("theme") === "dark";
applyTheme(themeToggle.checked ? "dark" : "light");

themeToggle.addEventListener("change", () => {
  applyTheme(themeToggle.checked ? "dark" : "light");
});

function applyTheme(t) {
  root.dataset.theme = t;
  localStorage.setItem("theme", t);
}

const formatButtons = document.querySelectorAll(".format-button");
const fieldsContainer = document.getElementById("fields-container");
const generateBtn = document.getElementById("generate");
const resultDiv = document.getElementById("result");
const resultText = document.getElementById("result-text");
const copyBtn = document.getElementById("copy-button");

let currentFormat = "Taboops!";
renderFields();

formatButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    formatButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFormat = btn.dataset.format;
    resultDiv.hidden = true;
    renderFields();
  });
});

function renderFields(){
  fieldsContainer.innerHTML = "";
  if(currentFormat === "Taboops!"){
    fieldsContainer.innerHTML = `<div class="field-group">
      <label>Taboo Word</label>
      <input id="taboo" class="user-input" placeholder="Enter taboo word">
    </div>`;
  }
  if(currentFormat === "Buzzwords & Bullsh*t"){
    fieldsContainer.innerHTML = `<div class="field-group">
      <label>Theme</label>
      <input id="buzz" class="user-input" placeholder="e.g., ice cream boardroom">
    </div>`;
  }
  if(currentFormat === "Fill in the Bleep!"){
    const prompts = [
      { id:"story", label:"Story or Genre", placeholder:"e.g., The Godfather" },
      { id:"noun1", label:"Noun", placeholder:"a noun" },
      { id:"adj", label:"Adjective", placeholder:"an adjective" },
      { id:"place", label:"Place", placeholder:"a place" },
      { id:"noun2", label:"Another Noun", placeholder:"another noun" },
      { id:"verb", label:"Verb", placeholder:"a verb" },
      { id:"random1", label:"Random Thing #1", placeholder:"something weird" },
      { id:"random2", label:"Random Thing #2", placeholder:"another weird thing" }
    ];
    prompts.forEach(({id,label,placeholder}) => {
      const grp = document.createElement("div");
      grp.className = "field-group";
      grp.innerHTML = `<label>${label}</label><input id="${id}" class="user-input" placeholder="${placeholder}">`;
      fieldsContainer.appendChild(grp);
    });
  }
}

generateBtn.addEventListener("click", async () => {
  const inputs = {};
  if(currentFormat === "Taboops!") {
    const val = document.getElementById("taboo").value.trim();
    if(!val) return alert("Type a taboo word");
    inputs.tabooWord = val;
  }
  if(currentFormat === "Buzzwords & Bullsh*t") {
    const val = document.getElementById("buzz").value.trim();
    if(!val) return alert("Enter a theme");
    inputs.buzzTopic = val;
  }
  if(currentFormat === "Fill in the Bleep!") {
    ["story","noun1","adj","place","noun2","verb","random1","random2"].forEach(id => {
      const val = document.getElementById(id).value.trim();
      if(!val) throw alert(`Enter ${id}`);
      inputs[id] = val;
    });
  }

  resultDiv.hidden = false;
  resultText.textContent = "⏳ Generating…";

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ format: currentFormat, ...inputs })
    });
    const { result } = await res.json();
    resultText.textContent = result;
  } catch(e) {
    resultText.textContent = "❌ Error generating result.";
  }
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(resultText.textContent)
    .then(() => copyBtn.textContent = "Copied!")
    .catch(() => copyBtn.textContent = "Failed!");
});