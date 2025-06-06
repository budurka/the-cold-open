import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { format, input } = req.body;

  if (!format || !input) {
    return res.status(400).json({ error: "Missing required fields: format and input." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    const prompt = `You're a creative AI for a live improv comedy show. The format is: ${format}. Use this input from the audience: ${input}.
Generate a fun, formatted response under 200 words with bold section titles. Never write a script.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ result: text });
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    res.status(500).json({ error: "Something went wrong with the Gemini API." });
  }
}
