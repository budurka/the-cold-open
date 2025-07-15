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
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [
          {
            role: "system",
            content: "You are a funny and creative improv assistant who generates scenes based on short prompts."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.85
      })
    });

    const data = await response.json();

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ result: "No response from model." });
    }

    return res.status(200).json({ result: content.trim() });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ result: "Something went wrong." });
  }
}

function generatePrompt(format, input) {
  switch (format) {
    case "Taboops!":
      return `A contestant says the taboo word "${input}". Write a chaotic game show scene where things go off the rails. Keep it funny and exaggerated.`;

    case "Buzzwords & Bullsh*t":
      return `Write a fake over-the-top corporate announcement using buzzwords about: ${input}. Make it cringe-worthy and dramatic.`;

    case "Fill In The Bleep!":
      const [title, ...words] = input.split(" | ");
      return `Create a short silly Mad Libs story titled "${title}". Use these audience words in weird and funny ways: ${words.join(", ")}.`;

    default:
      return `Use this audience suggestion to generate a short improv show idea: ${input}`;
  }
}
