import { InferenceClient } from "@huggingface/inference"
import { config } from "dotenv";
import path from "path";
import fs from "fs/promises";

config();


// Create a new InferenceClient instance
const client = new InferenceClient(process.env.HF_TOKEN);

console.log("process", process.env.HF_TOKEN)

async function fetchImageFromHF(prompt) {
    try {
        const blob = await client.textToImage({
            model: "black-forest-labs/FLUX.1-schnell",
            inputs: prompt
        });
        return blob;
    } catch (error) {
        // Error handling.
        throw new Error(`HF API error: ${error.message}`);
    }
}

const blob = await fetchImageFromHF("A cat sitting on a bench in a park next to a little dog");

// Save to file.
const dir = path.resolve("./generated");
await fs.writeFile(path.join(dir, "cat_dog.png"), Buffer.from(await blob.arrayBuffer()));

console.log(`Image saved to: ${path.join(dir, "cat_dog.png")}`);


client.textToSpeech()
