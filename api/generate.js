export default async function handler(req, res) {
  const { format, input, quantity } = req.body;

  const prompt = `Generate a ${format} style improv show prompt using the following input: "${input}"` +
                 (quantity ? ` with ${quantity} entries.` : '');

  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.status(200).json({ result: data.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ error: "No candidates returned", raw: data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
