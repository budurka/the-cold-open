// api/generate.js
export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST requests allowed' }), { status: 405 });
  }

  const body = await req.json();
  const { format, ...inputs } = body;

  if (!format) {
    return new Response(JSON.stringify({ error: 'Missing format' }), { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = "models/gemini-1.5-pro-002";

  let prompt = '';

  switch (format) {
    case 'taboops':
      if (!inputs.word) return err('Missing "word" for Taboops!');
      prompt = `The user provided the word: "${inputs.word}". Create a Taboo-style game card using that word. Respond only with:\n\n**Taboo Word**: <the word>\n**Forbidden Words**:\n- word1\n- word2\n- word3\n- word4\n- word5\n**Comedic Challenge**: <optional rule performers must follow>\n\nUnder 50 words.`;
      break;

    case 'pailot':
      if (!inputs.location || !inputs.object || !inputs.emotion) return err('Missing inputs for P-AI-lot Episode');
      prompt = `Generate a sitcom pilot based on:\nLocation: ${inputs.location}\nObject: ${inputs.object}\nEmotion/Goal: ${inputs.emotion}\nRespond with:\n**Sitcom Title**\n**Setting**\n**3 Character Archetypes**\n**Pilot Conflict**\n**Final Line**: “P-AI-lot Episode generated. And… ACTION!”`;
      break;

    case 'trailer':
      if (!inputs.concept) return err('Missing concept for Trailer Trash');
      prompt = `Create a fake movie trailer based on: ${inputs.concept}. Return:\n**Movie Title**\n**Genre**\n**Tagline**\n**Characters or Tropes**\n**Premise**\n**Final line**: “Here is a first and final exclusive look at MOVIE NAME HERE.”`;
      break;

    case 'gameshow':
      if (!inputs.classic) return err('Missing classic game name for Game Show Mayhem');
      prompt = `Reimagine the classic game "${inputs.classic}" as a syndicated game show. Include:\n**Game Show Title**\n**Premise**\n**Signature Challenges**\n**Ridiculous Prize**\n**Optional Catchphrase**`;
      break;

    case 'reality':
      if (!inputs.setting) return err('Missing setting for Real Drama');
      prompt = `Create a reality show using this setting: ${inputs.setting}. Include:\n**Reality Show Title**\n**Setting**\n**3 Featured Contestants**\n**Hook/Twist**\n**Final line**: “Welcome to the season premiere of NAME HERE… where everything’s unscripted. Except the drama.”`;
      break;

    case 'buzzwords':
      if (!inputs.topic || !inputs.quantity) return err('Missing topic or quantity for Buzzwords & Bullsh*t');
      prompt = `Generate ${inputs.quantity} ridiculous, exaggerated or fake buzzwords/phrases related to: ${inputs.topic}.\nRespond with:\n**Theme**: <label>\n**List**:\n1. ...\n2. ...\n**Optional Challenge**: how to use them in a scene.`;
      break;

    default:
      return err('Unknown format');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const result = await response.json();

  if (result.error) return new Response(JSON.stringify({ error: result.error.message }), { status: 500 });

  const output = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
  return new Response(JSON.stringify({ output }), { status: 200 });

  function err(msg) {
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
}
