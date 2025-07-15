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
    const endpoint = "https://api.openai.com/v1/chat/completions";

    let prompt = "";

    if (format === "Taboops!") {
      prompt = `You are a creative AI generating *Taboo-style improv game cards* for a live comedy show.

Your job:
1. Create a **punny, bolded title** based on the user's taboo word.
2. Write a **funny one-sentence rule** for the performers.
3. List 5–7 *taboo words* that must be avoided.

Your tone is witty, fast-paced, and made to get laughs on stage. Never explain what the game is. Just output the card.

Taboo Word: ${input}`;
    } else if (format === "Buzzwords & Bullsh*t") {
      prompt = `You are a creative AI that generates hilarious cards for a party game like Cards Against Humanity or Apples to Apples.

The user will provide a theme. Based on that theme, respond with:
- A **bolded and witty title**
- A list of **10 outrageous phrases** that could be cards in that themed deck

Your tone is wild, clever, unexpected, and laugh-out-loud funny. Never explain yourself. Just drop the cards.

Theme: ${input}`;
    } else {
      return res.status(400).json({ error: "Unsupported format" });
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful, creative assistant for a live improv comedy generator site."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9
      })
    });

    const data = await response.json();

    if (data?.choices?.length > 0) {
      const output = data.choices[0].message.content.trim();
      return res.status(200).json({ result: output });
    }

    return res.status(500).json({ error: "No response from OpenAI", data });
  } catch (err) {
    console.error("❌ API Error:", err);
    return res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}
