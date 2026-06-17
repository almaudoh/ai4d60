import OpenAI from 'openai';
import { config } from 'dotenv';

config();

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    // 'HTTP-Referer': process.env.YOUR_SITE_URL, // Optional. Site URL for rankings on openrouter.ai.
    // 'X-OpenRouter-Title': process.env.YOUR_SITE_NAME, // Optional. Site title for rankings on openrouter.ai.
  },
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: process.env.MODEL_NAME,
    messages: [
      {
        role: 'user',
        content: 'What is the meaning of life?',
      },
    ],
    stream: true,
  });

  for await (const part of completion) {
    process.stdout.write(part.choices[0].delta.content);
  }
//   console.log(completion.choices[0].message);
}

main();
