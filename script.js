document.getElementById("generate").addEventListener("click", async () => {
  const format = document.getElementById("format").value;
  const input = document.getElementById("user-input").value;
  const quantity = document.getElementById("quantity").value;
  const resultEl = document.getElementById("result");

  resultEl.textContent = "Generating...";

  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ format, input, quantity })
  });

  const data = await response.json();
  resultEl.textContent = data.result || "No response.";
});