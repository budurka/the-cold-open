export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { format, input } = req.body;
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "Missing OpenRouter API key" });
  }

  let prompt = "";

  switch (format) {
    case "Taboops!":
      const isAfterDark = input.includes("After Dark: true");
      prompt = `You are a hilarious card generator for a party game called Taboops!. Generate a single card with the following format:

Word: [Main Guess Word]  
No Words: [5 taboo words or phrases the player cannot say]  

Make it chaotic, surprising, and challenging. ${
        isAfterDark
          ? "This is the 'After Dark' version, so make it adult-themed, edgy, or a little NSFW."
          : "Keep it safe for work and clever but wild."
      }

Return only the card text.`;
      break;

    case "Buzzwords & Bullsh*t":
      prompt = `Create a hilarious improvised corporate speech based on the topic below. Use excessive jargon, empty buzzwords, and forced inspirational tone to sound confident but say absolutely nothing of substance.

Topic: ${input.replace("Topic or Theme: ", "")}

Keep it under 3 paragraphs and full of overused phrases and business nonsense.`;
      break;

    case "Fill in the Bleep!":
      const lines = input.split(" | ");
      const wordMap = {};
      lines.forEach((line) => {
        const [key, val] = line.split(": ");
        wordMap[key.trim()] = val.trim();
      });

      prompt = `Create a short Mad Libs-style story using the following user-submitted words. The story should be funny and absurd, about 3–5 sentences long, and titled "${wordMap["What should this story be called?"]}". 

Words to use:
- Noun: ${wordMap["Noun"]}
- Adjective: ${wordMap["Adjective"]}
- Place: ${wordMap["Place"]}
- Another Noun: ${wordMap["Another Noun"]}
- Verb: ${wordMap["Verb"]}
- Random Thing #1: ${wordMap["Random Thing #1"]}
- Random Thing #2: ${wordMap["Random Thing #2"]}

Return only the title and story.`;
      break;

    default:
      return res.status(400).json({ error: "Invalid format" });
  }

  try {
    const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await completion.json();
    const message = data.choices?.[0]?.message?.content;

    if (!message) {
      return res.status(500).json({ error: "No response from model" });
    }

    res.status(200).json({ result: message.trim() });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
