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

  console.log("Incoming request:", req.body);

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

      prompt = `You're writing for a live improv show where players need absurdly believable material.

Your job: Based on the audience topic "${clean(buzzTopic)}", generate a list of 10 phrases, statements, or expressions that are exaggerated, hilarious, or strangely specific — but still sound like something someone might *actually* say.

The phrases should be performable: great for guessing games, parody TED Talks, chaotic debates, character inspiration, or ridiculous exclamations.

Guidelines:
- Stick to the topic.
- Avoid made-up words or nonsense slang.
- Phrases can be questions, exclamations, advice, awkward confessions, or jargony one-liners.
- Should make people laugh by how *real-but-weird* they sound.
- Don’t try to explain the jokes. Just list them.

Output:
1. A short theme subheading (based on the topic)
2. A numbered list of 10 phrases
3. A brief challenge suggestion (e.g. “Debate these on Shark Tank” or “Use them in a breakup scene”)`;
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

      prompt = `You're writing a short, fast-paced setup for an improv scene based on this audience-generated title: "${clean(storyTitle)}".

Incorporate all of the following words into the story, but don't over-explain or make it serious. Be funny, weird, and relatable — not random for random’s sake. The story should sound like the *beginning* of something wild, not a complete narrative. Think: “What else could possibly happen?”

Use these words creatively and unexpectedly:
- Noun: ${clean(noun1)}
- Adjective: ${clean(adjective)}
- Place: ${clean(place)}
- Another noun: ${clean(noun2)}
- Verb: ${clean(verb)}
- Random thing 1: ${clean(random1)}
- Random thing 2: ${clean(random2)}

Guidelines:
- Only 5 to 7 short sentences.
- Don't end with a twist — leave it open for live performers.
- Keep the tone ridiculous, performable, and character-driven.
- Treat the title like a loose creative theme, not a literal plot.

Your job is to tee up the chaos. Let the improvisers finish it.`;
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

    const raw = await response.text();
    console.log("Raw Groq response:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("JSON parsing failed:", err);
      return res.status(200).json({
        result: fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)],
      });
    }

    if (data && data.choices && data.choices.length > 0) {
      return res.status(200).json({ result: data.choices[0].message.content });
    } else {
      return res.status(200).json({
        result: fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)],
      });
    }
  } catch (error) {
    console.error("Error from Groq:", error);
    return res.status(200).json({
      result: fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)],
    });
  }
}
