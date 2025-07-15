export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { format, input } = req.body;

  const prompt = generatePrompt(format, input);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          { role: "system", content: "You are a creative assistant for a live improv show generator site." },
          { role: "user", content: prompt }
        ],
        temperature: 0.9
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({ result: "No response from model." });
    }

    res.status(200).json({ result: data.choices[0].message.content });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ result: "Something went wrong." });
  }
}

function generatePrompt(format, input) {
  switch (format) {
    case "Taboops!":
      return `You're hosting a taboo-style game show. A contestant accidentally says the taboo word "${input}". Set the scene and escalate the chaos.`;

    case "Buzzwords & Bullsh*t":
      return `Use corporate buzzwords to deliver an overly dramatic announcement about: ${input}. Make it confusing, cringey, and full of flair.`;

    case "Fill In The Bleep!":
      const [title, ...words] = input.split(" | ");
      return `Create a short Mad Libs-style story titled "${title}". Use these audience-supplied words in fun and absurd ways: ${words.join(", ")}. Format it like a short dramatic scene.`;

    default:
      return `Create a hilarious improv show concept using this audience input: ${input}`;
  }
}
