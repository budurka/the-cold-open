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
    afterDark,
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

  console.log("Incoming request:", req.body); // You can remove or comment out this line

  let prompt = "";

  switch (format) {
    case "Taboops!":
      if (!tabooWord) {
        return res.status(400).json({ error: "Missing taboo word." });
      }

      prompt = `Create a new Taboo-style card. The guess word is "${clean(
        tabooWord
      )}". List five creative words that are not allowed to be said during the game. Format the output as:

Word: ${clean(tabooWord)}
Taboo Words:
1.
2.
3.
4.
5.

Tone: ${
        afterDark
          ? "lean into adult humor and innuendo (but not crude for crude’s sake)"
          : "keep it weird and family-friendly fun"
      }. Be clever.`;
      break;

    case "Buzzwords & Bullsh*t":
      if (!buzzTopic) {
        return res.status(400).json({ error: "Missing buzzword topic." });
      }

      prompt = `You are a comedy writer creating content for a party card game like Cards Against Humanity or Incohearent.

Create a themed card pack with 10 funny, absurd, or buzzword-filled entries based on this topic: "${clean(
        buzzTopic
      )}".

Each entry should be a short phrase, slang expression, pun, or fake corporate buzzword. Keep it clever, weird, and usable in a live improv setting.

Output:
- A short theme label
- A numbered list of 10 words or phrases
- A fun challenge or usage suggestion (e.g., “Sneak these into a TED Talk” or “Act out a product pitch”)`;
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

      prompt = `Write a ridiculous, Mad Libs-style story titled "${clean(
        storyTitle
      )}". Use all of the following words in the story in chaotic and unexpected ways:

- Noun: ${clean(noun1)}
- Adjective: ${clean(adjective)}
- Place: ${clean(place)}
- Another noun: ${clean(noun2)}
- Verb: ${clean(verb)}
- Random thing 1: ${clean(random1)}
- Random thing 2: ${clean(random2)}

The story should be 3–5 SHORT paragraphs, very weird, fast-paced, and full of punchy imagery. Treat the title like a creative theme, not a romance. Don't over-explain, don't make it serious. Just wild, funny, and playful. Avoid any twist endings.`;
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
