export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { format, input } = req.body;

    if (!format || !input) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Handle each format with its own specialized prompt
    let prompt;

    if (format === "Taboops!") {
      prompt = `You are designing a Taboo-style game card. The card has one main word that the player must guess, and five "taboo" words that the clue-giver cannot say.

Create a single funny card that fits the following theme:
"${input}"

Return only the card in this format:

**Guess Word:** <word>
**Taboo Words:** <word 1>, <word 2>, <word 3>, <word 4>, <word 5>`;
    } else if (format === "Buzzwords & Bullsh*t") {
      prompt = `You are a comedy writer creating content for a party card game like Cards Against Humanity or Incohearent.

Create 10 hilarious card entries based on the following theme:
"${input}"

Return just the 10 card phrases in a simple numbered list, no intro or extra commentary.`;
    } else {
      return res.status(400).json({ error: "Unsupported format" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4", // or "gpt-3.5-turbo"
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (data?.choices?.length > 0) {
      const output = data.choices[0].message.content;
      return res.status(200).json({ result: output });
    }

    return res.status(500).json({ error: "No response from OpenAI", data });
  } catch (err) {
    console.error("❌ API Error:", err);
    return res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}
