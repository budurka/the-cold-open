// api/generate.js

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST requests allowed' }), { status: 405 });
  }

  const { word } = await req.json();

  if (!word) {
    return new Response(JSON.stringify({ error: 'Missing required "word" in request body.' }), { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = "models/gemini-1.5-pro-002";

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `The user provided the word: "${word}". Create a Taboo-style game card using that word. Respond only with:\n\n**Taboo Word**: <the word>\n**Forbidden Words**: - word1\n- word2\n- word3\n- word4\n- word5\n**Comedic Challenge**: <funny optional rule performers must follow>\n\nKeep the response under 50 words.`
        }]
      }]
    }),
  });

  const result = await response.json();

  if (result.error) {
    return new Response(JSON.stringify(result.error), { status: 500 });
  }

  const output = result.candidates?.[0]?.content?.parts?.[0]?.text || "Error: No content generated.";
  return new Response(JSON.stringify({ output }), { status: 200 });
}
