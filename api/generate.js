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
    storyTitle,
    noun1,
    adjective,
    place,
    noun2,
    verb,
    random1,
    random2,
  } = req.body;

  console.log("Incoming request:", req.body);

  let prompt = "";

  switch (format) {
    case "Taboops!":
      if (!tabooWord) {
        return res.status(400).json({ error: "Missing taboo word." });
      }

      prompt = `Create a new Taboo-style card. The guess word is "${clean(tabooWord)}". 
List five creative words that are not allowed to be said during the game.

Format:
Word: ${clean(tabooWord)}
Taboo Words:
1.
2.
3.
4.
5.

Tone: clever, weird, and family-friendly fun — usable in a party or live improv setting.`;
      break;

    case "Buzzwords & Bullsh*t":
      if (!buzzTopic) {
        return res.status(400).json({ error: "Missing buzzword topic." });
      }

      prompt = `Based on the topic: "${clean(buzzTopic)}", generate a list of 10 funny, exaggerated, or thematically realistic words or phrases.

These should feel like things you'd hear in a boardroom, TED Talk, chaotic debate, or improv scene. They can be slogans, corporate lingo, Gen Z slang, confident but ridiculous one-liners, or misused jargon — whatever fits the vibe. Prioritize usable, familiar, and punchy content over randomness.

Output:
• A short theme label based on the topic
• A numbered list of 10 words or phrases`;
      break;

    case "Fill in the Bleep!":
      const fields = {
        storyTitle,
        noun1,
        adjective,
        place,
        noun2,
        verb,
        random1,
        random2,
      };

      const missing = Object.entries(fields).filter(([_, val]) => !clean(val));
      if (missing.length > 0) {
        return res.status(400).json({
          error: `Missing required field(s): ${missing
            .map(([key]) => key)
            .join(", ")}`,
        });
      }

      prompt = `Write a short, Mad Libs-style story titled "${clean(storyTitle)}". 
Use the following ingredients in chaotic and surprising ways:

- Noun: ${clean(noun1)}
- Adjective: ${clean(adjective)}
- Place: ${clean(place)}
- Another noun: ${clean(noun2)}
- Verb: ${clean(verb)}
- Random thing 1: ${clean(random1)}
- Random thing 2: ${clean(random2)}

Rules:
- Make it fast-paced, punchy, and memorable.
- Only 5–7 short sentences total.
- Relatable, playful, and a little weird — like a weird thing your friend told you over drinks.
- Avoid any twist endings or serious tone — leave the rest to the improvisers.`;
      break;

    default:
      return res.status(400).json({ error: "Invalid format." });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
              "You are a witty and imaginative improvisation game generator. Respond only with the generated scene, list, or story — no extra commentary.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.85,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Groq API error:", err);
      return res.status(500).json({ error: err.error || "Groq API error." });
    }

    const data = await response.json();
    const fallback =
      fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    if (data && data.choices && data.choices.length > 0) {
      return res.status(200).json({ result: data.choices[0].message.content });
    } else {
      return res.status(200).json({ result: fallback });
    }
  } catch (error) {
    console.error("Fetch failed:", error);
    const fallback =
      fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    return res.status(200).json({ result: fallback });
  }
}
