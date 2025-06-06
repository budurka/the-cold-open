import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    const { format, input, quantity } = req.body;

    const prompt = `Generate a ${format} style improv show prompt using the following input: "${input}"` +
                   (quantity ? ` with ${quantity} entries.` : "");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ result: text });
  } catch (err) {
    console.error("❌ Gemini API Error:", err);
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}
