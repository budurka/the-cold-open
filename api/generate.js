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

    // Custom prompt logic for Taboops!
    const prompt =
      format === "Taboops!"
        ? `You are a creative AI that generates Taboo-style game cards for a live improv comedy show.

Respond with:
- A **bolded and punny title** for the card
- A **short, playful rule** for the performers based on the input word
- A **bulleted list** of 5 to 7 "taboo" words the performers must avoid

Taboo word: ${input}`
        : `You are a creative AI used in a live improv comedy show. Your job is to generate one of six hilarious show formats for human performers based on audience suggestions.

You never write full scenes. Your responses are short, clear, and formatted to be read aloud on stage. Always respond with bolded section titles and a fun tone. Each format is under 200 words.

Supported Formats:
1. 🎬 P-AI-lot Episode
2. 🎥 Trailer Trash
3. 🎲 Game Show Mayhem
4. 🛳️ Real Drama
5. 🧠 Taboops!
6. 🧩 Buzzwords & Bullsh*t

Format: ${format}
Input: ${input}`;

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
