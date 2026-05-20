import { GoogleGenAI } from "@google/genai"
import dotenv from "dotenv";

dotenv.config();

const client = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

const stream_response = await client.models.generateContentStream({
    model: "gemini-2.5-flash-lite",
    contents: [
        "Write a very long bedtime story about a unicorn. I want to use this to demonstrate streaming so it should be very very long",
    ]
});


for await (const part of stream_response) {
    process.stdout.write(part.text);
}
