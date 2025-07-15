// ✅ Updated generate.js to support all 3 formats correctly and use OpenRouter API

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { format, input } = req.body;

    if (!format || !input) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const endpoint = "https://openrouter.ai/api/v1/chat/completions";

    let prompt = "";

    if (format === "Taboops!") {
      prompt = `You are a creative AI that generates Taboo-style game cards for a live improv comedy show.\n\nRespond with:\n- A **bolded and punny title** for the card\n- A **short, playful rule** for the performers based on the input word\n- A **bulleted list** of 5 to 7 \"taboo\" words the performers must avoid\n\nTaboo word: ${input}`;
    } else if (format === "Buzzwords & Bullsh*t") {
      prompt = `You are a creative AI generating hilarious card text for a game similar to Apples to Apples or Cards Against Humanity.\n\nCreate 10 possible cards that would be featured in this absurd or edgy card game.\n\nGame Theme: ${input}`;
    } else if (format === "Fill In The Bleep!") {
      prompt = `You are a creative AI that writes absurd Mad Libs-style short stories to inspire improv comedy scenes.\n\nAudience provides typical Mad Libs-style words. Ask them for the following:\n- Noun\n- Adjective\n- Place\n- Noun\n- Verb\n- Two random things\n\nThen, using these inputs, write a short 5-7 sentence funny story that sounds like it could be straight out of a children's book with a twist.\n\nStory Prompt: ${input}`;
    } else {
      prompt = `Format not recognized: ${format}`;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mixtral-8x7b",
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

    return res.status(500).json({ error: "No response from OpenRouter", data });
  } catch (err) {
    console.error("❌ API Error:", err);
    return res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}
