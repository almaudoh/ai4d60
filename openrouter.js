import { OpenRouter } from '@openrouter/sdk';
import { config } from 'dotenv';

config();

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
//   httpReferer: process.env.YOUR_SITE_URL, // Optional. Site URL for rankings on openrouter.ai.
  appTitle: "Testing app", // Optional. Site title for rankings on openrouter.ai.
});

const completion = await client.chat.send({
    chatRequest: {
        model: process.env.MODEL_NAME,
        messages: [
            {
            role: 'user',
            content: 'What is the meaning of life? In a sentence or two.',
            },
        ],
    },
});

console.log(completion.choices[0].message.content);
