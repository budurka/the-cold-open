export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { format, input } = req.body;

  let prompt = "";

  if (format === "Taboops!") {
    const afterDark = input.includes("Taboo After Dark: true");
    const wordMatch = input.match(/Taboo Word: ([^|]+)/);
    const word = wordMatch ? wordMatch[1].trim() : "mystery";

    prompt = `Create a new "Taboops!" card based on the taboo word "${word}". 
Respond only with the card content, in this format:

Taboo Word: [Main word]
❌ [No word 1]
❌ [No word 2]
❌ [No word 3]
❌ [No word 4]
❌ [No word 5]

Keep it ${afterDark ? "edgy and adult-themed" : "family-friendly"} and fun.`;
  } else if (format === "Buzzwords & Bullsh*t") {
    const topicMatch = input.match(/Topic or Theme: ([^|]+)/);
    const topic = topicMatch ? topicMatch[1].trim() : "corporate synergy";

    prompt = `Write a short improv game premise for a segment called "Buzzwords & Bullsh*t" based on the topic: "${topic}". 
Include over-the-top jargon, corporate nonsense, and ridiculous business logic. 
Make it sound like a motivational meeting gone off the rails.`;
  } else if (format === "Fill in the Bleep!") {
    const words = {};
    input.split("|").forEach(part => {
      const [label, value] = part.trim().split(":");
      if (label && value) {
        words[label.trim().toLowerCase()] = value.trim();
      }
    });

    prompt = `Write a short, funny madlibs-style scene based on this idea: "${words["story title"] || "Untitled Adventure"}".

Use the following audience-supplied words:
- Noun: ${words["noun"] || "cat"}
- Adjective: ${words["adjective"] || "smelly"}
- Place: ${words["place"] || "Canada"}
- Second Noun: ${words["second noun"] || "toaster"}
- Verb: ${words["verb"] || "yell"}
- Random Thing 1: ${words["random thing 1"] || "glitter bomb"}
- Random Thing 2: ${words["random thing 2"] || "left shoe"}

Weave these into a very short, absurd story or sketch that can inspire an improv scene.`;
  } else {
    return res.status(400).json({ error: "Unsupported format." });
  }

  try {
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [
          {
            role: "system",
            content: "You are a witty improv comedy assistant generating scene inspiration."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await aiRes.json();

    if (!data.choices || !data.choices.length) {
      return res.status(500).json({ result: "No response from model." });
    }

    const result = data.choices[0].message.content.trim();
    res.status(200).json({ result });
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ result: "Something went wrong." });
  }
}
