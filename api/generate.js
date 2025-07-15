const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

function generatePrompt(format, input, options = {}) {
  const isAdult = options.tabooAfterDark || false;

  switch (format) {
    case "Taboops!":
      return isAdult
        ? `Create a Taboo-style adult party game card using the taboo word "${input}". Include sexual innuendo or adult humor. Provide the card in this format:

Main Word: [Your Taboo Word]  
Forbidden Words: [Five words or phrases that are closely associated with the main word, which cannot be used as clues]`
        : `Create a Taboo-style game card using the taboo word "${input}". Provide the card in this format:

Main Word: [Your Taboo Word]  
Forbidden Words: [Five words or phrases that are closely associated with the main word, which cannot be used as clues]`;

    case "Buzzwords & Bullsh*t":
      return `Write a short corporate-speak, buzzword-heavy speech or email about: ${input}. Use cliches and vague language.`;

    case "Fill In The Bleep!":
      return `You are a comedic writer creating a Mad Libs-style story. The user has titled the story: "${input.title}". Use their word submissions below in the story:

Noun: ${input.noun}
Adjective: ${input.adjective}
Place: ${input.place}
Second Noun: ${input.noun2}
Verb: ${input.verb}
Random Thing 1: ${input.random1}
Random Thing 2: ${input.random2}

Write a short, absurd, and funny Mad Libs-style story using these inputs. Make it under 200 words.`;

    default:
      return `Format not supported.`;
  }
}

app.post("/api/generate", async (req, res) => {
  const { format, input } = req.body;
  const tabooAfterDark = req.body.tabooAfterDark || false;

  let parsedInput = input;
  if (format === "Fill In The Bleep!") {
    try {
      parsedInput = JSON.parse(input);
    } catch (e) {
      return res.status(400).json({ result: "Invalid input format for Fill In The Bleep!" });
    }
  }

  const messages = [
    { role: "system", content: "You are a creative and funny game content generator." },
    { role: "user", content: generatePrompt(format, parsedInput, { tabooAfterDark }) },
  ];

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages,
      }),
    });

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content;
    res.json({ result: result || "No response from model." });
  } catch (error) {
    res.status(500).json({ result: "Something went wrong." });
  }
});

module.exports = app;
