export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { format, inputs, isAfterDark } = req.body;

  const prompt = createPrompt(format, inputs, isAfterDark);
  if (!prompt) {
    return res.status(400).json({ error: 'Invalid format or input' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a creative and hilarious improv show writer.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    const output = data?.choices?.[0]?.message?.content;

    if (!output) {
      return res.status(500).json({ error: 'No response from model.' });
    }

    res.status(200).json({ result: output.trim() });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

function createPrompt(format, inputs, isAfterDark) {
  switch (format) {
    case 'Taboops!':
      return `Generate a creative and fun Taboo-style card. The word to guess is "${inputs.word}". Provide exactly five “do not say” words. ${isAfterDark ? 'Make the card cheeky or adult-themed for an After Dark version.' : 'Keep it PG for a regular show.'} Format it like:
      
Word: [Main Word]
Do Not Say:
- Word 1
- Word 2
- Word 3
- Word 4
- Word 5`;

    case 'Buzzwords & Bullsh*t':
      return `Create an over-the-top fictional workplace or product announcement using the buzzword "${inputs.buzzword}" and industry "${inputs.industry}". Make it absurd, like something from a corporate improv sketch.`;

    case 'Fill in the Bleep!':
      return `Create a short and hilarious Mad Libs-style story titled "${inputs.storyTitle}". Fill it using the following audience-provided words:

- Noun: ${inputs.noun}
- Adjective: ${inputs.adjective}
- Place: ${inputs.place}
- Second Noun: ${inputs.noun2}
- Verb: ${inputs.verb}
- Random Thing 1: ${inputs.random1}
- Random Thing 2: ${inputs.random2}

Keep it silly, punchy, and suitable for improv inspiration.`;

    default:
      return null;
  }
}
