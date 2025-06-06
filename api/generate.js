export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model } = req.body;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + process.env.GEMINI_API_KEY, {
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
      return res.status(500).json({ error: 'Invalid JSON returned from Gemini API', raw: text });
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) {
      return res.status(500).json({ error: 'No content returned from Gemini API', raw: data });
    }

    res.status(200).json({ result });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
