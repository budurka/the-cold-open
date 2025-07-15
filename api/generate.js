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
    const endpoint = "https://openrouter.ai/api/v1/chat";

    let prompt = "";

    switch (format) {
      case "Taboops!": {
        const tabooWord = input.split(": ")[1];
        prompt = `You are a creative AI that generates Taboo-style game cards for a live improv comedy show.

Respond with:
- A **bolded and punny title** for the card
- A **short, playful rule** for the performers based on the input word
- A **bulleted list** of 5 to 7 "taboo" words the performers must avoid

Taboo word: ${tabooWord}`;
        break;
      }

      case "Buzzwords & Bullsh*t": {
        const topic = input.split(": ")[1];
        prompt = `You're an over-the-top consultant who turns boring business topics into absurd corporate jargon.

Topic: ${topic}

Generate a hilarious "corporate innovation pitch" that includes:
- A **bold, nonsense slogan**
- 3 **buzzword-packed bullet points**
- A **closing line** that’s all flair, no substance.

Use parody and satire. This will be read out loud at a comedy show.`;
        break;
      }

      case "Fill in the Bleep!": {
        const lines = input.split(" | ");
        const values = Object.fromEntries(lines.map(line => {
          const [key, val] = line.split(": ");
          return [key.toLowerCase(), val];
        }));

        prompt = `You are a creative AI crafting a Mad Libs-style story for a live improv comedy show.

**Story idea:** ${values["what should the story be about?"]}
**Words to include:**
- Noun: ${values["noun"]}
- Adjective: ${values["adjective"]}
- Place: ${values["place"]}
- Another Noun: ${values["another noun"]}
- Verb: ${values["verb"]}
- Random Thing #1: ${values["random thing #1"]}
- Random Thing #2: ${values["random thing #2"]}

Write a funny 3–5 sentence Mad Libs-style short story using all the words above. Bold each audience-supplied word in the story. Keep it absurd, high-energy, and use the story idea as inspiration.`;
        break;
      }

      default: {
        prompt = `You are a creative AI used in a live improv comedy show. Your job is to generate one of several hilarious show formats for human performers based on audience suggestions.

You never write full scenes. Your responses are short, clear, and formatted to be read aloud on stage. Always respond with bolded section titles and a fun tone. Each format is under 200 words.

Format: ${format}
Input: ${input}`;
        break;
      }
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4",
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

    if (data?.choices?.[0]?.message?.content) {
      return res.status(200).json({ result: data.choices[0].message.content.trim() });
    }

    return res.status(500).json({ error: "No response from OpenRouter", data });
  } catch (err) {
    console.error("❌ API Error:", err);
    return res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}
