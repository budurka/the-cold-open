/* === /coldopen/scripts.js === */
const themeSwitch = document.getElementById("theme-switch");
const html = document.documentElement;

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  html.setAttribute("data-theme", "dark");
  themeSwitch.checked = true;
} else {
  html.setAttribute("data-theme", "light");
}

themeSwitch.addEventListener("change", () => {
  const theme = themeSwitch.checked ? "dark" : "light";
  html.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
});

document.querySelectorAll(".format-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".format-buttons button")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

document.getElementById("generate").addEventListener("click", () => {
  const format = document.querySelector(".format-buttons .active")?.dataset.format;
  const word = document.getElementById("taboo-word").value;
  const afterDark = document.getElementById("after-dark").checked;
  const result = `Generated format: ${format || "none"}\nTaboo Word: ${word}\nAfter Dark: ${afterDark}`;
  document.getElementById("result").textContent = result;
});

document.getElementById("copy-button").addEventListener("click", () => {
  const resultText = document.getElementById("result").textContent;
  if (!resultText) return;
  navigator.clipboard.writeText(resultText);
  alert("Copied to clipboard!");
});
