document.getElementById("generate").addEventListener("click", async () => {
  const format = document.getElementById("format").value;
  const input = document.getElementById("user-input").value;
  const quantity = document.getElementById("quantity").value;
  const resultEl = document.getElementById("result");

  resultEl.textContent = "Generating...";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format, input, quantity })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    resultEl.textContent = data.result || "No response.";
  } catch (err) {
    console.error("Fetch error:", err);
    resultEl.textContent = "Something went wrong. Please try again.";
  }
});
