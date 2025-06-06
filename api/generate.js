export default async function handler(req, res) {
  try {
    const { format, input, quantity } = req.body;

    const prompt = `Generate a ${format} style improv show prompt using the following input: "${input}"` +
                   (quantity ? ` with ${quantity} entries.` : '');

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    console.log("📤 Prompt:", prompt);
    console.log("🔐 API Key Present:", !!apiKey);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();

    console.log("📥 Raw Gemini Response:", JSON.stringify(data));

    if (data.candidates && data.candidates.length > 0) {
      const output = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ result: output });
    }

    res.status(500).json({ error: "No candidates returned from Gemini.", details: data });

  } catch (err) {
    console.error("❌ Gemini API Error:", err);
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}
