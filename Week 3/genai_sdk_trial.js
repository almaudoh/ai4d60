import { GoogleGenAI } from "@google/genai"
import dotenv from "dotenv";

dotenv.config();

const client = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

const response = await client.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [
        "Write a short bedtime story about a unicorn",
    ]
});

console.log(response.text);
