import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { config } from "dotenv";
import fs from "fs/promises";

config();

const elevenlabs = new ElevenLabsClient();
// const response = await fetch(
//   "https://storage.googleapis.com/eleven-public-cdn/audio/marketing/nicole.mp3"
// );

// Local file.
const buffer = await fs.readFile("./output.mp3");

// const audioBlob = new Blob([await response.arrayBuffer()], { type: "audio/mp3" });
const audioBlob = new Blob([buffer], { type: "audio/mp3" });

const transcription = await elevenlabs.speechToText.convert({
  file: audioBlob,
  modelId: "scribe_v2",
  tagAudioEvents: true,
  languageCode: "eng",
  diarize: true
});

console.log(transcription);
