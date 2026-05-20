import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE_URL,
});


// Basic API chat completion call.
const response_stream = await client.chat.completions.create({
    model: "nvidia/nemotron-3-nano-30b-a3b:free",
    messages: [
        {
            role: "user",
            content: "Write a very long bedtime story about a unicorn. I want to use this to demonstrate streaming so it should be very very long",
        },
    ],
    stream: true,
});

console.log("Response content:");

for await (const chunk of response_stream) {
    const part = chunk.choices[0].delta?.content;
    if (part) {
        process.stdout.write(part);
    }
}
console.log();
