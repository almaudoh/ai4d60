import { InferenceClient } from "@huggingface/inference"
import { config } from "dotenv";
import path from "path";
import fs from "fs/promises";

config();


// Create a new InferenceClient instance
const client = new InferenceClient(process.env.HF_TOKEN);

console.log("process", process.env.HF_TOKEN)

async function fetchAudioFromHF(prompt) {
    try {
        const blob = await client.textToSpeech({
            model: "Supertone/supertonic-3",
            inputs: prompt
        });
        return blob;
    } catch (error) {
        // Error handling.
        throw new Error(`HF API error: ${error.message}`);
    }
}

const blob = await fetchAudioFromHF("A cat sitting on a bench in a park next to a little dog");

// Save to file.
const dir = path.resolve("./generated");
await fs.writeFile(path.join(dir, "huggingface_tts.mp3"), Buffer.from(await blob.arrayBuffer()));

console.log(`Audio saved to: ${path.join(dir, "huggingface_tts.mp3")}`);


client.textToSpeech()
