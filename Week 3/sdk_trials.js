import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE_URL,
});

// Basic API chat completion call.
const response = await client.chat.completions.create({
    model: "nvidia/nemotron-3-nano-30b-a3b:free",
    messages: [
        {
            role: "user",
            content: "Write a short bedtime story about a unicorn",
        },
    ],
});

console.log(response);
console.log();
console.log("Response content:", response.choices[0].message.content);
