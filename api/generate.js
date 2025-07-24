export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clean = (val) => (typeof val === "string" ? val.trim() : "");

  const fallback = [
    "Oops! The suggestion elves are on a coffee break ☕️",
    "Try again — my brain cell fell down.",
    "The improv gods said: not now. Try again!"
  ];

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
    random2
  } = req.body;

  let prompt = "";

  switch (format) {
    case "Taboops!":
      if (!tabooWord) return res.status(400).json({ error: "Missing taboo word." });
      prompt = `Create a new Taboo-style card. The guess word is "${clean(tabooWord)}".
List five clever, weird, but appropriate words that are not allowed to be said during the game.

Format:
Word: ${clean(tabooWord)}
Taboo Words:
1.
2.
3.
4.
5.`;
      break;

    case "Buzzwords & Bullsh*t":
      if (!buzzTopic) return res.status(400).json({ error: "Missing topic." });
      prompt = `Based on the prompt "${clean(buzzTopic)}", generate a creative heading and 10 funny, thematically relevant phrases someone might actually say. Avoid made-up nonsense. Keep it vivid, weird, and useful for improv scenes or TED Talk parodies.

Output format:
Theme: [short label]
1. 
2. 
...
10.`;
      break;

    case "Fill in the Bleep!":
      const required = { story, noun1, adj, place, noun2, verb, random1, random2 };
      const missing = Object.entries(required).filter(([_, val]) => !clean(val));
      if (missing.length > 0) {
        return res.status(400).json({ error: `Missing field(s): ${missing.map(([key]) => key).join(", ")}` });
      }

      prompt = `Write a mad-libs-style story titled "${clean(story)}" using all the following:
- ${clean(noun1)}
- ${clean(adj)}
- ${clean(place)}
- ${clean(noun2)}
- ${clean(verb)}
- ${clean(random1)}
- ${clean(random2)}

Make it 5–7 short, fast-paced sentences. Weird but memorable. Avoid seriousness, twist endings, or romance. Just funny and fast.`;
      break;

    default:
      return res.status(400).json({ error: "Invalid format." });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "You are a witty and imaginative improv prompt generator. Respond with only the result — no extra commentary." },
          { role: "user", content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 800
      })
    });

    const data = await response.json();
    const output = data?.choices?.[0]?.message?.content || fallback[Math.floor(Math.random() * fallback.length)];
    return res.status(200).json({ result: output });
  } catch (err) {
    console.error("Groq API Error:", err);
    return res.status(200).json({ result: fallback[Math.floor(Math.random() * fallback.length)] });
  }
}
