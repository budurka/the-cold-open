document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const formatButtons = document.querySelectorAll(".format-button");
  const fieldsContainer = document.getElementById("fields-container");
  const generateButton = document.getElementById("generate");
  const resultBox = document.getElementById("result");

  const defaultTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

  // Theme Setup
  const savedTheme = localStorage.getItem("theme") || defaultTheme;
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeToggle.checked = savedTheme === "dark";

  themeToggle.addEventListener("change", () => {
    const newTheme = themeToggle.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  // Format Selection
  formatButtons.forEach((button) => {
    button.addEventListener("click", () => {
      formatButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      loadFields(button.dataset.format);
      resultBox.innerHTML = ""; // Clear result on switch
    });
  });

  function createField(labelText, placeholder, name) {
    const group = document.createElement("div");
    group.className = "field-group";

    const label = document.createElement("label");
    label.textContent = labelText;
    label.htmlFor = name;

    const input = document.createElement("input");
    input.type = "text";
    input.id = name;
    input.name = name;
    input.className = "user-input";
    input.placeholder = placeholder;

    group.appendChild(label);
    group.appendChild(input);
    return group;
  }

  function loadFields(format) {
    fieldsContainer.innerHTML = "";

    if (format === "Taboops!") {
      fieldsContainer.appendChild(
        createField("Taboo Word", "Enter a word to avoid", "tabooWord")
      );
    } else if (format === "Buzzwords & Bullsh*t") {
      fieldsContainer.appendChild(
        createField("Buzzword Theme", "e.g., Things you'd hear in an ice cream boardroom", "buzzTopic")
      );
    } else if (format === "Fill in the Bleep!") {
      fieldsContainer.appendChild(createField("Story or Genre", "e.g., The Godfather", "story"));
      fieldsContainer.appendChild(createField("Noun", "Enter a noun", "noun1"));
      fieldsContainer.appendChild(createField("Adjective", "Enter an adjective", "adj"));
      fieldsContainer.appendChild(createField("Place", "Enter a place", "place"));
      fieldsContainer.appendChild(createField("Another Noun", "Enter another noun", "noun2"));
      fieldsContainer.appendChild(createField("Verb", "Enter a verb", "verb"));
      fieldsContainer.appendChild(createField("Random Thing #1", "Something silly", "random1"));
      fieldsContainer.appendChild(createField("Random Thing #2", "Another weird thing", "random2"));
    }
  }

  // Generate Output
  generateButton.addEventListener("click", async () => {
    const activeFormat = document.querySelector(".format-button.active")?.dataset?.format;
    if (!activeFormat) return;

    generateButton.disabled = true;
    generateButton.textContent = "Thinking...";
    resultBox.innerHTML = "";

    const formData = {};
    document.querySelectorAll(".user-input").forEach((input) => {
      formData[input.name] = input.value;
    });
    formData.format = activeFormat;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.result) {
        resultBox.innerHTML = `
          <pre>${data.result}</pre>
          <button class="copy-btn">📋 Copy</button>
        `;
        document.querySelector(".copy-btn").addEventListener("click", () => {
          navigator.clipboard.writeText(data.result);
        });
      } else {
        resultBox.innerHTML = `<p class="error">❌ Error: ${data.error || "Unknown error."}</p>`;
      }
    } catch (err) {
      resultBox.innerHTML = `<p class="error">❌ Error connecting to server.</p>`;
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = "Generate";
    }
  });

  // Initialize default mode
  document.querySelector(".format-button.active")?.click();
});
