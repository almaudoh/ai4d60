import { config } from "dotenv";
import path from "path";
import fs from "fs/promises";

config();


async function fetchImageFromHF(model, payload) {
    const url = `${process.env.HF_API_BASE}/${model}`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        // Error handling.
        const errorText = await response.text();
        throw new Error(`HF API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    // Response is raw image blob.
    return response.blob();
    
}

const blob = await fetchImageFromHF("black-forest-labs/FLUX.1-schnell", {
    inputs: "A cat sitting on a bench in a park",
});

// Save to file.
const dir = path.resolve("./generated");
await fs.writeFile(path.join(dir, "cat.png"), Buffer.from(await blob.arrayBuffer()));

console.log(`Image saved to: ${path.join(dir, "cat.png")}`);
