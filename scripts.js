document.addEventListener("DOMContentLoaded", () => {
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

  const savedTheme = localStorage.getItem("theme") || "light";
  themeToggle.checked = savedTheme === "dark";
  applyTheme(savedTheme);

  // Interactivity
  const formatButtons = document.querySelectorAll(".format-button");
  const fieldsContainer = document.getElementById("fields-container");
  const generateButton = document.getElementById("generate");
  const resultBox = document.getElementById("result");

  let currentFormat = "Taboops!";

  formatButtons.forEach((button) => {
    button.addEventListener("click", () => {
      formatButtons.forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      currentFormat = button.dataset.format;
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
        <input type="text" id="taboo" placeholder="Enter a taboo word to avoid">`;
    }

    if (format === "Buzzwords & Bullsh*t") {
      panel.innerHTML = `
        <label for="buzzword">Topic or Theme</label>
        <input type="text" id="buzzword" placeholder="e.g., corporate ice cream board meeting">`;
    }

    if (format === "Fill in the Bleep!") {
      const prompts = [
        { id: "story", label: "Story or Genre", placeholder: "e.g., The Godfather" },
        { id: "noun1", label: "Noun", placeholder: "Enter a noun" },
        { id: "adj", label: "Adjective", placeholder: "Enter an adjective" },
        { id: "place", label: "Place", placeholder: "Enter a place" },
        { id: "noun2", label: "Another Noun", placeholder: "Enter another noun" },
        { id: "verb", label: "Verb", placeholder: "Enter a verb" },
        { id: "random1", label: "Random Thing #1", placeholder: "Something silly" },
        { id: "random2", label: "Random Thing #2", placeholder: "Another weird thing" }
      ];

      prompts.forEach(({ id, label, placeholder }) => {
        const group = document.createElement("div");
        group.innerHTML = `
          <label for="${id}">${label}</label>
          <input type="text" id="${id}" placeholder="${placeholder}">`;
        panel.appendChild(group);
      });
    }

    fieldsContainer.appendChild(panel);
  }

  generateButton.addEventListener("click", async () => {
    let inputs = {};
    if (currentFormat === "Taboops!") {
      const word = document.getElementById("taboo").value;
      if (!word) return alert("Please enter a taboo word.");
      inputs = { tabooWord: word };
    } else if (currentFormat === "Buzzwords & Bullsh*t") {
      const buzzword = document.getElementById("buzzword").value;
      if (!buzzword) return alert("Please enter a topic.");
      inputs = { buzzTopic: buzzword };
    } else if (currentFormat === "Fill in the Bleep!") {
      const ids = ["story", "noun1", "adj", "place", "noun2", "verb", "random1", "random2"];
      for (const id of ids) {
        const val = document.getElementById(id).value;
        if (!val) return alert(`Enter a value for ${id}.`);
        inputs[id] = val;
      }
    }

    resultBox.textContent = "⏳ Generating...";

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: currentFormat, ...inputs }),
      });

      const data = await res.json();
      resultBox.textContent = data.result || "❌ No result.";
    } catch (err) {
      resultBox.textContent = "❌ Error generating scene.";
      console.error("Generation error:", err);
    }
  });

  renderFields(currentFormat);
});
