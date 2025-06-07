export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { format, input } = req.body || {};

    if (!format || !input) {
      return res.status(400).json({ error: 'Missing format or input in request body.' });
    }

    const model = "models/gemini-1.5-pro";
    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = `Generate a ${format} style improv show prompt using the following input: "${input}"`;

    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const text = await response.text();
    if (!text) {
      return res.status(500).json({ error: 'Empty response from Gemini API' });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({ error: 'Invalid JSON returned from Gemini', raw: text });
    }

    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) {
      return res.status(500).json({ error: 'No result returned from Gemini', raw: data });
    }

    res.status(200).json({ result });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: err.message || 'No error message',
      stack: err.stack || 'No stack trace' 
    });
  }
}
