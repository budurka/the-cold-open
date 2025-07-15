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
    random2,
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
      prompt = `You are a comedy writer creating content for a party card game like Cards Against Humanity or Incohearent.

Create 10 hilarious card entries based on the following theme: "${buzzTopic}".

Each entry should be short (1–6 words), ridiculous, punchy, and absurdly specific. Prioritize irony, adult humor, unexpected combinations, and pop culture twists. Avoid explanations or intros — just return the list in this format:

Buzzwords & Bullsh*t Theme: ${buzzTopic}

1.
2.
3.
...
10.`;
      break;

    case 'Fill in the Bleep!':
      prompt = `Create a short, funny Mad Libs-style story titled "${storyTitle}". Use the following words in unexpected and absurd ways:

- Noun: ${noun1}
- Adjective: ${adjective}
- Place: ${place}
- Another noun: ${noun2}
- Verb: ${verb}
- Random thing 1: ${random1}
- Random thing 2: ${random2}

The story should be 3–5 short paragraphs, feel like a classic Mad Libs, and playfully exaggerate the use of the words. It should be absurd, energetic, and inspired by the story title. No need for a twist ending — just make it fun and wild.`;
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
        max_tokens: 1000,
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
