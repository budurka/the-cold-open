// pages/api/generate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const fallbackMessages = [
    "Whoa! We’re out of ideas for a second. Try again?",
    "Even improv needs a coffee break. Try once more?",
    "My brain cell just tripped. Can you ask that again?",
    "💨 That idea went poof. Wanna hit regenerate?",
    "Oops! Our creative hamster fell off the wheel. Try again?",
    "AI got stage fright. Let's try another take.",
    "404: Funny bone not found. Retry?",
  ];

  const clean = (val) =>
    typeof val === "string" ? val.trim() : val === undefined ? "" : val;

  const {
    format,
    tabooWord,
    buzzTopic,
    story,
    noun1,
    adj,
    place,
    noun2,
    verb,
    random1,
    random2,
  } = req.body;

  let prompt = "";

  switch (format) {
    case "Taboops!":
      if (!tabooWord) {
        return res.status(400).json({ error: "Missing taboo word." });
      }

      prompt = `Create a new Taboo-style card. The guess word is "${clean(
        tabooWord
      )}". List five creative words that are not allowed to be said during the game.

Format:
Word: ${clean(tabooWord)}
Taboo Words:
1.
2.
3.
4.
5.

Tone: Keep it weird and family-friendly fun. Be clever and playful.`;
      break;

    case "Buzzwords & Bullsh*t":
      if (!buzzTopic) {
        return res.status(400).json({ error: "Missing buzzword topic." });
      }

      prompt = `You're generating funny and realistic prompts for an improv or party game.

Given the topic: "${clean(
        buzzTopic
      )}", create a list of 10 thematically realistic or exaggerated phrases. These could be catchphrases, slogans, awkward quotes, or absurd phrases heard in the given setting.

Respond with:
• A brief theme/label
• A numbered list of 10 phrases (1–2 lines each)
• Make it vivid, culturally relevant, and imaginative
Avoid nonsense words.`;
      break;

    case "Fill in the Bleep!":
      const required = { story, noun1, adj, place, noun2, verb, random1, random2 };
      const missing = Object.entries(required).filter(([_, val]) => !clean(val));

      if (missing.length > 0) {
        return res.status(400).json({
          error: `Missing required field(s): ${missing
            .map(([key]) => key)
            .join(", ")}`,
        });
      }

      prompt = `Write a funny, chaotic, and punchy short story titled "${clean(
        story
      )}" using the following words creatively:

- Noun: ${clean(noun1)}
- Adjective: ${clean(adj)}
- Place: ${clean(place)}
- Another noun: ${clean(noun2)}
- Verb: ${clean(verb)}
- Random thing 1: ${clean(random1)}
- Random thing 2: ${clean(random2)}

The story should be 5–7 SHORT sentences max. Weird, fast-moving, and suggestive of a bigger world without over-explaining. It should feel like a Mad Libs fever dream. No twist endings or moral lessons. Leave room for performers to expand.`;

      break;

    default:
      return res.status(400).json({ error: "Invalid format." });
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content:
                "You are a witty and imaginative improvisation game generator. Respond only with the generated list or story — no extra commentary or apologies.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.85,
          max_tokens: 800,
        }),
      }
    );

    const data = await response.json();
    const fallback =
      fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    if (data && data.choices && data.choices.length > 0) {
      return res.status(200).json({ result: data.choices[0].message.content });
    } else {
      return res.status(200).json({ result: fallback });
    }
  } catch (error) {
    console.error("Error from Groq:", error);
    const fallback =
      fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    return res.status(200).json({ result: fallback });
  }
}
