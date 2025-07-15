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

  const fallbackMessages = [
    "Whoa! We’re out of ideas for a second. Try again?",
    "Even improv needs a coffee break. Try once more?",
    "My brain cell just tripped. Can you ask that again?",
    "💨 That idea went poof. Wanna hit regenerate?",
    "Oops! Our creative hamster fell off the wheel. Try again?",
    "AI got stage fright. Let's try another take.",
    "404: Funny bone not found. Retry?",
  ];

  let prompt = '';

  switch (format) {
    case 'Taboops!':
      prompt = `Create a new Taboo-style game card. The guess word is "${tabooWord}". Provide five creative and clever words that players are NOT allowed to say when giving clues. Format like this:

Word: ${tabooWord}
Taboo Words:
1.
2.
3.
4.
5.

Keep it ${afterDark ? "cheeky, suggestive, and a bit naughty (like a late-night game with friends)" : "lighthearted and family-friendly (appropriate for all ages)"}.
Avoid listing the guess word itself or obvious variations as taboo words. Be creative!`;
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

Use these in hilarious, unexpected ways over 3–5 short paragraphs. Wrap it up with a silly twist. Keep the tone playful and imaginative.`;
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
    const fallback = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    if (data && data.choices && data.choices.length > 0) {
      return res.status(200).json({ result: data.choices[0].message.content });
    } else {
      return res.status(200).json({ result: fallback });
    }
  } catch (error) {
    console.error('Error from Groq:', error);
    const fallback = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    return res.status(200).json({ result: fallback });
  }
}
