import { OpenRouterStream } from "openrouter-stream";

export const config = {
  runtime: "edge"
};

const handler = async (req) => {
  try {
    const { format, input } = await req.json();

    const promptMap = {
      "Taboops!": `You're generating a creative taboo-style word guessing game.
Generate a list of 6 words that are associated with the word: "${input}".
These should be things the player cannot say while teammates try to guess the main word.
Return the response in a playful and direct tone like a party game.
Format it like:
Main Word: [word]
Taboo Words: [word1], [word2], [word3], [word4], [word5], [word6]`,

      "Buzzwords & Bullsh*t": `You're creating funny cards for an adult party game inspired by Cards Against Humanity or Apples to Apples.
The theme is: "${input}"

Generate 10 outrageous, edgy, or absurd phrases that could be printed on cards related to this theme.
Keep them short, punchy, and hilarious.`,

      "Fill In The Bleep!": `You're writing a short, hilarious Mad Libs-style story.
The show theme is: "${input}"
The audience has submitted the following words to fill in:
- Noun
- Adjective
- Place
- Noun
- Verb
- Random Thing 1
- Random Thing 2

Use those placeholders and write a short, absurd, and comedically-timed story in 2-3 paragraphs.
Clearly highlight the filled-in words in **bold** so the cast can read it aloud with dramatic flair.`
    };

    const prompt = promptMap[format];

    if (!prompt) {
      return new Response(JSON.stringify({ result: "Invalid format selected." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const stream = await OpenRouterStream({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        {
          role: "system",
          content: "You are a creative improv and party game generator. Respond in a casual, funny tone unless otherwise directed."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      apiKey: process.env.OPENROUTER_API_KEY
    });

    return new Response(stream);
  } catch (err) {
    return new Response(JSON.stringify({ result: "Something went wrong." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export default handler;
