import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  try {
    const { format, input, quantity } = req.body;

    const prompt = `Generate a ${format} style improv show prompt using the following input: "${input}"${quantity ? ` with ${quantity} entries.` : ''}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are The Cold Open, an AI improv generator with a comedic, creative tone. Always format your output clearly and concisely for performance." },
        { role: "user", content: prompt }
      ],
      temperature: 1.0
    });

    res.status(200).json({ result: completion.choices[0].message.content });

  } catch (err) {
    console.error("❌ API Error:", err);
    res.status(500).json({ error: "Something went wrong.", detail: err.message });
  }
}
