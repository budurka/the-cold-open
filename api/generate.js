import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const { format, input, quantity } = req.body;

  const prompt = `Generate a ${format} style improv show prompt using the following input: "${input}"${quantity ? ` with ${quantity} entries.` : ''}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are The Cold Open, an AI improv generator with a comedic, creative tone. Always format your output clearly and concisely for performance." },
        { role: "user", content: prompt }
      ],
      temperature: 1.0
    });

    res.status(200).json({ result: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message || "Something went wrong." });
  }
}