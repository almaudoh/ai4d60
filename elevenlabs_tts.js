import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { config } from "dotenv";
import { createWriteStream } from "fs";

config();

const elevenlabs = new ElevenLabsClient();

const audioStream = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
    text: "Hello, this is a test of the ElevenLabs text-to-speech API.",
    modelId: "eleven_v3",
});

const fileStream = createWriteStream("output.mp3");
for await (const chunk of audioStream) {
    fileStream.write(chunk);
}

fileStream.end();
