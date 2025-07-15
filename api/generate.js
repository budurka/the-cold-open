export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { format, inputs, isAfterDark } = await req.json();

  if (!format) {
    return new Response(JSON.stringify({ error: 'No format selected' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const prompt = buildPrompt(format, inputs, isAfterDark);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.2-3b-instruct:free',
      messages: [
        {
          role: 'system',
          content: 'You are a witty scene and game prompt generator for improv comedy shows. Your answers should be funny, creative, and formatted like a short monologue or setup.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(JSON.stringify({ error: `API error: ${errorText}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await response.json();
  const result = data?.choices?.[0]?.message?.content;

  if (!result) {
    return new Response(JSON.stringify({ error: 'No response from model.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ result }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

function buildPrompt(format, inputs, isAfterDark) {
  switch (format) {
    case 'Taboops!': {
      const base = `Generate a new Taboo-style card. The guess word is "${inputs.word}". List 5 words that CANNOT be said when describing it. Format the response like:
GUESS WORD: [word]
NO WORDS: 1. ..., 2. ..., 3. ..., 4. ..., 5. ...`;

      const afterDarkTag = isAfterDark
        ? ' Make the theme spicy, mature, and inappropriate for a family-friendly audience. Add innuendos or raunchy connections.'
        : ' Keep it clean and PG-rated for a family-friendly audience.';

      return base + afterDarkTag;
    }

    case 'Buzzwords & Bullsh*t':
      return `Write a scene intro inspired by buzzword "${inputs.buzzword}" in the "${inputs.industry}" industry. Use over-the-top corporate jargon.`;

    case 'Fill in the Bleep!':
      return `Create a funny short Mad Libs-style story titled "${inputs.storyTitle}", using the following words:
- Noun: ${inputs.noun}
- Adjective: ${inputs.adjective}
- Place: ${inputs.place}
- Another noun: ${inputs.noun2}
- Verb: ${inputs.verb}
- Random thing 1: ${inputs.random1}
- Random thing 2: ${inputs.random2}
Make it absurd and short (under 150 words) and easy to read aloud on stage.`;

    default:
      return 'Generate a random improv scene prompt.';
  }
}
