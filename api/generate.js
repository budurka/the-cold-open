import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { format, input } = req.body;

  let prompt = "";

  if (format === "Taboops!") {
    prompt = `You are a creative AI used in a live improv comedy show. Your job is to generate a hilarious setup for the game Taboops! using the provided taboo word. Only respond with a single scene idea that follows this structure:

**Title: [Funny Scene Name]**

Welcome to **Taboops!** The hilarious show where the performers have to avoid the word '[TABOO WORD]'. The cast must perform a series of scenes where this word is forbidden. If someone says it, a punishment happens (like interpretive dance, weird noise, or buzzers). Here's your scene idea:

Taboo Word: ${input}`;
  } else if (format === "Buzzwords & Bullsh*t") {
    prompt = `You are a creative AI designing cards for a party game like Cards Against Humanity or Apples to Apples. Your goal is to create 10 outrageous, funny, or clever cards based on the user's input. Each card should be one line and reflect the theme.

User Prompt: ${input}`;
  } else {
    prompt = `Generate a comedy improv idea based on: ${input}`;
  }

  try {
    const chat = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
    });

    res.status(200).json({ result: chat.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
