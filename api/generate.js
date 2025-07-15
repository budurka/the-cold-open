// generate.js (Express backend route)
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/generate", async (req, res) => {
  const { format, input } = req.body;

  let prompt = "";

  switch (format) {
    case "Taboops!":
      prompt = `Create a high-energy, fast-paced improv game intro based on a taboo word. The word is: ${input}. Keep it short and engaging.`;
      break;

    case "Buzzwords & Bullsh*t":
      prompt = `Create a ridiculous corporate-themed improv scene start using the topic: ${input}. Include over-the-top buzzwords and jargon.`;
      break;

    case "Fill In The Bleep":
      prompt = `You're generating a MADLIBS-style scene. A user provided the following as a pretend story title and input list:\n\n${input}\n\nCreate a 4-6 sentence absurd short story based on that info, keeping it fun and theatrical.`;
      break;

    default:
      return res.status(400).json({ result: "Unknown format." });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemma-2b-it",
        messages: [
          {
            role: "system",
            content: "You are a clever, playful AI generating creative improv show openers in different formats. Be bold, brief, and original.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data || !data.choices || !data.choices.length) {
      return res.json({ result: "No response from model." });
    }

    const output = data.choices[0].message.content;
    res.json({ result: output });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ result: "Error generating response." });
  }
});

export default router;
