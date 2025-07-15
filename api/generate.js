export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    format,
    tabooWord,
    afterDark,
    buzzTopic,
    storyTitle,
    noun1,
    adjective,
    place,
    noun2,
    verb,
    random1,
    random2
  } = req.body;

  let prompt = '';

  switch (format) {
    case 'Taboops!':
      prompt = `Create a new Taboo-style card. The guess word is "${tabooWord}". List five creative words that are not allowed to be said during the game. Format the output as:

Word: ${tabooWord}
Taboo Words:
1.
2.
3.
4.
5.

Tone: ${afterDark ? 'spicy and unfiltered, adult humor' : 'playful but family-friendly'}.`;
      break;

    case 'Buzzwords & Bullsh*t':
      prompt = `You are a jaded corporate trainer. Create a fake, over-the-top corporate presentation opener that uses the buzzword "${buzzTopic}" in an absurd context. Make it sound dramatic, cheesy, and filled with meaningless jargon.`;
      break;

    case 'Fill in the Bleep!':
      prompt = `Create a short, funny Mad Libs-style story titled "${storyTitle}". The story should include and emphasize the following:

- A noun: ${noun1}
- An adjective: ${adjective}
- A place: ${place}
- Another noun: ${noun2}
- A verb: ${verb}
- Random thing 1: ${random1}
- Random thing 2: ${random2}

Output the complete story in 3–5 short paragraphs using these words in absurd or unexpected ways. End with a silly twist.`;
      break;

    default:
      return res.status(400).json({ error: 'Invalid format' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
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
    console.error('Error from Groq:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
