document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const html = document.documentElement;
  const formatButtons = document.querySelectorAll(".format-button");
  const fieldsContainer = document.getElementById("fields-container");
  const generateButton = document.getElementById("generate");
  const resultBox = document.getElementById("result");

  // Theme Toggle
  themeToggle.addEventListener("change", () => {
    html.setAttribute("data-theme", themeToggle.checked ? "dark" : "light");
  });

  // Handle Format Change
  formatButtons.forEach(button => {
    button.addEventListener("click", () => {
      formatButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      generateFields(button.dataset.format);
    });
  });

  // Generate based on active format
  generateButton.addEventListener("click", () => {
    const format = document.querySelector(".format-button.active").dataset.format;
    const inputs = fieldsContainer.querySelectorAll("input");
    const values = Array.from(inputs).map(i => i.value);

    let output = "";

    if (format === "Taboops!") {
      output = `You can't say: "${values[0]}" — good luck!`;
    } else if (format === "Buzzwords & Bullsh*t") {
      const theme = values[0] || "Corporate synergy pitch";
      const list = Array.from({ length: 10 }, (_, i) => `${i + 1}. ${generateBuzzword()}`);
      output = `🧩 ${theme} 🧩\n${list.join("\n")}`;
    } else if (format === "Fill in the Bleep!") {
      const [story, noun, adj, place, noun2, verb, thing1, thing2] = values;
      output = `🎬 Title: ${story}\n\nOnce upon a time, a ${adj} ${noun} went to ${place}. There, they met a ${noun2} who made them ${verb}. Then ${thing1} exploded and ${thing2} became president.`;
    }

    resultBox.textContent = output;
  });

  function generateFields(format) {
    fieldsContainer.innerHTML = "";

    if (format === "Taboops!") {
      fieldsContainer.innerHTML = `<label>Taboo Word<br><input type="text" placeholder="Enter your taboo word" /></label>`;
    } else if (format === "Buzzwords & Bullsh*t") {
      fieldsContainer.innerHTML = `<label>Theme<br><input type="text" placeholder="e.g., Things you'd hear in an ice cream boardroom" /></label>`;
    } else if (format === "Fill in the Bleep!") {
      fieldsContainer.innerHTML = `
        <label>Story or Genre<br><input type="text" placeholder="e.g., The Godfather" /></label>
        <label>Noun<br><input type="text" placeholder="Enter a noun" /></label>
        <label>Adjective<br><input type="text" placeholder="Enter an adjective" /></label>
        <label>Place<br><input type="text" placeholder="Enter a place" /></label>
        <label>Another Noun<br><input type="text" placeholder="Enter another noun" /></label>
        <label>Verb<br><input type="text" placeholder="Enter a verb" /></label>
        <label>Random Thing #1<br><input type="text" placeholder="Something silly" /></label>
        <label>Random Thing #2<br><input type="text" placeholder="Another weird thing" /></label>
      `;
    }
  }

  function generateBuzzword() {
    const buzz = [
      "Synergize the sprinkle stack",
      "Disrupt the fudge layer",
      "Leverage creamstream innovation",
      "Reinvent cold chain delight",
      "Double churn cross-collaboration",
      "Elevate cone-first thinking",
      "Gamify the sundae matrix",
      "Monetize vanilla vision",
      "Streamline toppings architecture",
      "Pivot to popsicle-driven ROI"
    ];
    return buzz[Math.floor(Math.random() * buzz.length)];
  }

  // Init default
  generateFields("Taboops!");
});
