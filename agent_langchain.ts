import { createAgent, initChatModel } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "dotenv";


config();

const tools: any[] = [
    
];

// const agent = createAgent({ model: "google-genai:gemini-3.5-flash", tools });
const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.7,
    maxOutputTokens: 512,
});
const agent = createAgent({ model: llm, tools });


// New API that is easier for model routing.
const llm2 = initChatModel("google-genai:gemini-2.5-flash");
// const llm3 = initChatModel("openrouter:nvidia/nemotron-");


const agent2 = createAgent({ model: "google-genai:gemini-2.5-flash", tools });

const callAgent = async () => {
    const response = await agent2.invoke({
        messages: ["What is the capital of France?"],
    });

    console.log(response.messages);
};

callAgent();
