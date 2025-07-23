document.addEventListener("DOMContentLoaded", function () {
  const formatButtons = document.querySelectorAll(".format-button");
  const fieldsContainer = document.getElementById("fields-container");
  const generateButton = document.getElementById("generate");
  const resultBox = document.getElementById("result");

  const fieldConfigs = {
    "Taboops!": [
      { name: "tabooWord", placeholder: "Enter a guessable word (e.g., pineapple)" }
    ],
    "Buzzwords & Bullsh*t": [
      { name: "buzzTopic", placeholder: "Enter a corporate buzzword (e.g., synergy, blockchain)" }
    ],
    "Fill in the Bleep!": [
      { name: "story", placeholder: "Enter a story title (e.g., Microwave Island)" },
      { name: "noun1", placeholder: "A noun" },
      { name: "adj", placeholder: "An adjective" },
      { name: "place", placeholder: "A place" },
      { name: "noun2", placeholder: "Another noun" },
      { name: "verb", placeholder: "A verb" },
      { name: "random1", placeholder: "Something random" },
      { name: "random2", placeholder: "Something else random" }
    ]
  };

  function createField(name, placeholder) {
    const input = document.createElement("input");
    input.type = "text";
    input.name = name;
    input.placeholder = placeholder;
    input.required = true;
    input.classList.add("input-field");
    return input;
  }

  function updateFields(format) {
    fieldsContainer.innerHTML = "";
    resultBox.innerHTML = "";
    const config = fieldConfigs[format];
    config.forEach(field => {
      const input = createField(field.name, field.placeholder);
      fieldsContainer.appendChild(input);
    });
  }

  formatButtons.forEach(button => {
    button.addEventListener("click", () => {
      formatButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      const selectedFormat = button.dataset.format;
      updateFields(selectedFormat);
    });
  });

  generateButton.addEventListener("click", async () => {
    const activeButton = document.querySelector(".format-button.active");
    const selectedFormat = activeButton.dataset.format;

    const inputs = fieldsContainer.querySelectorAll("input");
    const requestBody = { format: selectedFormat };
    inputs.forEach(input => {
      requestBody[input.name] = input.value;
    });

    generateButton.disabled = true;
    generateButton.textContent = "Thinking...";

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (data.result) {
        resultBox.innerHTML = `<pre>${data.result}</pre>`;
      } else {
        resultBox.textContent = "Something went wrong. Try again?";
      }
    } catch (error) {
      console.error("Error generating result:", error);
      resultBox.textContent = "Error connecting to the generator.";
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = "Generate";
    }
  });

  // Default to Taboops
  updateFields("Taboops!");
});
