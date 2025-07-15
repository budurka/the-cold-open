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
    const model = "meta-llama/llama-3-70b-instruct"; // or try claude-3-opus or another

    let prompt = "";

    switch (format) {
      case "Taboops!":
        prompt = `You are a creative AI that generates Taboo-style game cards for a live improv comedy show.

Respond with:
- A **bolded and punny title** for the card
- A **short, playful rule** for the performers based on the input word
- A **bulleted list** of 5 to 7 "taboo" words the performers must avoid

Taboo word: ${input}`;
        break;

      case "Buzzwords & Bullsh*t":
        prompt = `You are a creative AI that invents hilarious party card content for a Cards Against Humanity-style game.

Topic: ${input}

Generate 10 funny, absurd, or outrageous phrases, quotes, or ideas that would be cards in this themed party game. Keep the tone edgy but playful. Format them as a simple bullet list.`;
        break;

      case "Fill in the Bleep!":
        const [ideaLine, wordsLine] = input.split(" | ");
        const storyIdea = ideaLine?.replace("General Story Idea: ", "").trim();
        const wordList = wordsLine?.replace("List 2–8 Random Words: ", "").trim();

        prompt = `You are a creative AI crafting a Mad Libs-style short story for an improv comedy show.

Story premise: ${storyIdea}
Words to include: ${wordList}

Write a short, absurd, and energetic story (3–5 sentences) that uses these words as blanks filled in for comedic effect. Bold the filled-in words in the output. Format it so it can be read aloud on stage.`;
        break;

      default:
        prompt = `You are a creative AI for a live improv comedy site. Format not recognized. Respond with a funny one-liner instead.`;
        break;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-site-name.com", // Optional for OpenRouter tracking
        "X-Title": "The Cold Open Generator"
      },
      body: JSON.stringify({
        model,
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
