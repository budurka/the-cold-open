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
    word,
    buzzword,
    story,
    noun1,
    adj,
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
      if (!word) {
        return res.status(400).json({ error: "Missing taboo word." });
      }

      prompt = `Create a new Taboo-style card. The guess word is "${clean(word)}". List five creative words that are not allowed to be said during the game. Format the output as:

Word: ${clean(word)}
Taboo Words:
1.
2.
3.
4.
5.

Tone: keep it weird and family-friendly fun. Be clever.`;
      break;

    case "Buzzwords & Bullsh*t":
      if (!buzzword) {
        return res.status(400).json({ error: "Missing buzzword topic." });
      }

      prompt = `Based on the topic "${clean(buzzword)}", generate a themed list of 10 funny, exaggerated, or thematically realistic words or phrases.

These should reflect something you'd hear in a parody TED Talk, chaotic debate, scene warmup, or party guessing game — all loosely rooted in the original topic.

Output:
• Theme (brief label or subheading)
• 10 numbered words or phrases`;

      break;

    case "Fill in the Bleep!":
      const fields = {
        story,
        noun1,
        adj,
        place,
        noun2,
        verb,
        random1,
        random2,
      };

      const missing = Object.entries(fields).filter(([_, val]) => !clean(val));
      if (missing.length > 0) {
        return res.status(400).json({
          error: `Missing required field(s): ${missing.map(([key]) => key).join(", ")}`,
        });
      }

      prompt = `Write a weird, fast-paced, Mad Libs-style short story titled "${clean(
        story
      )}". Use all the following in unpredictable, memorable ways:

- Noun: ${clean(noun1)}
- Adjective: ${clean(adj)}
- Place: ${clean(place)}
- Another noun: ${clean(noun2)}
- Verb: ${clean(verb)}
- Random thing 1: ${clean(random1)}
- Random thing 2: ${clean(random2)}

The story should be 5–7 SHORT sentences. Keep it weird but relatable. No romance, no serious tone, no twist ending. Just chaotic, fun, and playful — let the improvisers carry it from here.`;

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
