export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { format, inputs, isAfterDark } = req.body;

  let prompt = '';

  switch (format) {
    case 'Taboops!':
      prompt = `Create a new Taboo-style card. The guess word is "${inputs.word}". List five creative words that are not allowed to be said during the game. Format the output as:

Word: ${inputs.word}
Taboo Words:
1.
2.
3.
4.
5.

Tone: ${isAfterDark ? 'spicy and unfiltered, adult humor' : 'playful but family-friendly'}.`;
      break;

    case 'Buzzwords & Bullsh*t':
      prompt = `You are a jaded corporate trainer. Create a fake, over-the-top corporate presentation opener that uses the buzzword "${inputs.buzzword}" and ties it to the "${inputs.industry}" industry. Make it sound dramatic, cheesy, and filled with meaningless jargon.`;
      break;

    case 'Fill in the Bleep!':
      prompt = `Create a short, funny Mad Libs-style story titled "${inputs.storyTitle}". The story should include and emphasize the following:

- A noun: ${inputs.noun}
- An adjective: ${inputs.adjective}
- A place: ${inputs.place}
- Another noun: ${inputs.noun2}
- A verb: ${inputs.verb}
- Random thing 1: ${inputs.random1}
- Random thing 2: ${inputs.random2}

Output the complete story in 3–5 short paragraphs using these words in absurd or unexpected ways. End with a silly twist.`;
      break;

    default:
      return res.status(400).json({ error: 'Invalid format' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a witty and imaginative improvisation game generator. Respond only with the generated scene or list—no extra commentary.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.85,
        max_tokens: 800,
      }),
    });

    const data = await response.json();

    if (data && data.choices && data.choices.length > 0) {
      return res.status(200).json({ result: data.choices[0].message.content });
    } else {
      return res.status(500).json({ error: 'No response from model.' });
    }
  } catch (error) {
    console.error('Error from OpenRouter:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
