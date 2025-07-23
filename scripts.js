document.addEventListener("DOMContentLoaded", function () {
  const formatButtons = document.querySelectorAll(".format-button");
  const fieldsContainer = document.getElementById("fields-container");
  const resultBox = document.getElementById("result");
  const generateButton = document.getElementById("generate");
  const themeToggle = document.getElementById("theme-toggle");
  let selectedFormat = "Taboops!";

  const allFields = {
    "Taboops!": [
      { label: "Taboo Word", name: "tabooWord", placeholder: "Hawaii" },
    ],
    "Buzzwords & Bullsh*t": [
      { label: "Theme", name: "buzzTopic", placeholder: "Things you'd hear at Walmart" },
    ],
    "Fill in the Bleep!": [
      { label: "Story or Genre", name: "story", placeholder: "e.g., The Godfather" },
      { label: "Noun", name: "noun1", placeholder: "Enter a noun" },
      { label: "Adjective", name: "adj", placeholder: "Enter an adjective" },
      { label: "Place", name: "place", placeholder: "Enter a place" },
      { label: "Another Noun", name: "noun2", placeholder: "Enter another noun" },
      { label: "Verb", name: "verb", placeholder: "Enter a verb" },
      { label: "Random Thing #1", name: "random1", placeholder: "Something silly" },
      { label: "Random Thing #2", name: "random2", placeholder: "Another weird thing" },
    ],
  };

  function renderFields(format) {
    fieldsContainer.innerHTML = "";
    allFields[format].forEach((field) => {
      const fieldWrapper = document.createElement("div");
      fieldWrapper.className = "field-group";

      const label = document.createElement("label");
      label.textContent = field.label;
      label.htmlFor = field.name;

      const input = document.createElement("input");
      input.type = "text";
      input.name = field.name;
      input.placeholder = field.placeholder;
      input.className = "user-input";

      fieldWrapper.appendChild(label);
      fieldWrapper.appendChild(input);
      fieldsContainer.appendChild(fieldWrapper);
    });
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  }

  formatButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      formatButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedFormat = btn.dataset.format;
      renderFields(selectedFormat);
      resultBox.innerHTML = "";
    });
  });

  generateButton.addEventListener("click", async () => {
    const inputs = fieldsContainer.querySelectorAll("input");
    const data = { format: selectedFormat };

    inputs.forEach((input) => {
      data[input.name] = input.value.trim();
    });

    resultBox.innerHTML = "<span class='loading'>Generating…</span>";

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.error) {
        resultBox.innerHTML = `<span class="error">❌ ${result.error}</span>`;
        return;
      }

      resultBox.innerHTML = `
        <pre>${result.result}</pre>
        <button class="copy-btn">Copy</button>
      `;

      document.querySelector(".copy-btn").addEventListener("click", () => {
        copyToClipboard(result.result);
      });
    } catch (error) {
      resultBox.innerHTML = `<span class="error">❌ Something went wrong.</span>`;
    }
  });

  themeToggle.addEventListener("change", () => {
    document.documentElement.setAttribute(
      "data-theme",
      themeToggle.checked ? "dark" : "light"
    );
  });

  // Initialize
  renderFields(selectedFormat);
});
