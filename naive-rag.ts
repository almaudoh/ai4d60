// 1. Ingestion starts with a simple text file

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { InferenceClient } from '@huggingface/inference';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';

// Pattern to split sentences based on punctuation marks
const DELIM_REGEX = /[.!?]\s+/;

// Load environment variables from .env file
dotenv.config();

// Function to read and split text from a file into sentences
// 1. Load the document.
function readAndSplitText(filePath: string): string[] {
    const absolutePath = path.resolve(filePath);
    const text = fs.readFileSync(absolutePath, 'utf-8');
    return text.split(DELIM_REGEX).filter(sentence => sentence.trim().length > 0);
}

// 2. Chunk the document.
const paragraphChunking = (filePath: string, chunkSize: number): string[] => {
  const sentences = readAndSplitText(filePath);
  const chunks: string[] = [];
  let currentChunk: string[] = [];

  for (const sentence of sentences) {
    if (currentChunk.length > 0 && (currentChunk.join(' ').length + sentence.length + 1) > chunkSize) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }
    currentChunk.push(sentence);
  }

  // Check if there are leftover sentences in current chunk.
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
};



// 2. Embedding the chunks.
// Using HuggingFace Inference API.
const client = new InferenceClient({ accessToken: process.env.HF_TOKEN || '' });

const embedChunks = async (chunks: string[]): Promise<number[][]> => {
  const embeddings: number[][] = [];

  try {
    const response = await client.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: chunks,
    });

    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error during embedding:', error);
    return [];
  }
};

// 4. Storage in the Vector database.
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' });
pinecone.listIndexes().then(indexes => {
  console.log('Existing indexes:', indexes);
}).catch(error => {
  console.error('Error listing indexes:', error);
});

const storeEmbeddingsInPinecone = async (chunks: string[], embeddings: number[][], indexName: string) => {
  try {
    const index = pinecone.Index(indexName);
    const vectors = embeddings.map((embedding, idx) => ({
      id: `chunk-${idx}`,
      values: embedding,
      metadata: {
        source: `chunk-${idx}`,
        content: chunks[idx]
      },
    }));

    await index.upsert({ vectors });
    console.log(`Successfully stored ${vectors.length} embeddings in Pinecone index "${indexName}".`);
  } catch (error) {
    console.error('Error storing embeddings in Pinecone:', error);
  }
};

// 5. Retrieval
const retrieveFromPinecone = async (queryEmbedding: number[], indexName: string, topK: number) => {
  try {
    const index = pinecone.Index(indexName);
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: topK,
      includeMetadata: true,
    });
    
    return queryResponse.matches || [];
  } catch (error) {
    console.error('Error retrieving from Pinecone:', error);
    return [];
  }
};

// 6. Augmentation and generation.
const RAG_PROMPT = `
You are a helpful assistant that provides answers based on the context provided. Use the context to answer the user's question. If the context does not contain the answer, respond with "I don't know.".

User's question:
{userQuery}

Retrieved Context:
{context}
`;
const llmClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
const generateResponse = async (retrievedChunks: any[], userQuery: string): Promise<string> => {
  const context = retrievedChunks.map(chunk => chunk.metadata.content).join('\n');

  const prompt = RAG_PROMPT.replace('{userQuery}', userQuery).replace('{context}', context);

  try {
    const response = await llmClient.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message?.content || "I don't know. I was not able to get information.";
  } catch (error) {
    console.error('Error generating response:', error);
    return "I don't know. I was not able to get information.";
  }
};

// Run ingestion of the document.
const runIngestion = async (filePath: string, chunkSize: number, indexName: string) => {
  const chunks = paragraphChunking(filePath, chunkSize);
  console.log(`Document split into ${chunks.length} chunks.`);

  const embeddings = await embedChunks(chunks);
  console.log(`Generated embeddings for ${embeddings.length} chunks.`);

  await storeEmbeddingsInPinecone(chunks, embeddings, indexName);
};

// Example usage
const filePath = './textfile.txt'; // Path to your text file
const chunkSize = 5000; // Adjust chunk size as needed
const indexName = 'my-text-index'; // Name of the Pinecone index


const rag = async (userQuery = 'What is the main topic of the document?') => {
  try {
    await runIngestion(filePath, chunkSize, indexName);
    console.log('Ingestion completed.');

    // Run a simple query.
    const [ embedding ] = await embedChunks([userQuery]);
    const retrievedChunks = await retrieveFromPinecone(embedding, indexName, 3);
    const response = await generateResponse(retrievedChunks, userQuery);
    console.log('Generated Response:', response);


  } catch (error) {
    console.error('Error during ingestion:', error);
  }
};

// rag("What is the main topic of the document?");
// rag("Who coined the name Artificial Intelligence and in what year?");
