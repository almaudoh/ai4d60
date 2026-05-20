import { config } from 'dotenv';

config();

// Call LLM API
const API_KEY = process.env.API_KEY;
const BASE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/"
const MODEL_NAME = "gemini-2.5-flash"

const callApi = async (prompt) => {
  const response = await fetch(`${BASE_API_URL}${MODEL_NAME}:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        contents: [
            {
                parts: [ { text: prompt } ]
            }
        ],
    }),
  });
  const result = await response.json();
  if (result.error) {
    console.log(result);
    throw new Error(result.error.message);
  }
  return result.candidates?.[0]?.content?.parts?.[0]?.text;
}

const promptChain = async (user_complaint) => {
// We are building a customer care app that will respond to any complaints from customers.
// Split into a chain of 4 steps.
// 1. Extract the intent of the user.
  const step1Prompt = `
  You are a customer care agent for a bank. Your job is to listen to a clients complaints and determine the intent in a few words.

  I want you to determine the intent of this complaint. Use a maximum of 3 or 4 words.

  Here is the complaint:
  ${user_complaint}
  `;

  const step1Response = await callApi(step1Prompt);
  console.log("Customer intent: ", step1Response);

// 2. Extract key information about the complaint.
const step2Prompt = `
Extract any useful information from the complaint that can help us resolve the issue. This can include things like dates, amounts, names of people or places, etc. Use a JSON format to return the information.

Here is the complaint:
${user_complaint}
`;

const step2Response = await callApi(step2Prompt);
console.log("Extracted information: ", step2Response);

// 3. Determine the department that the complaint should go to based on a fixed list.
const departments = ["billing", "technical support", "account management", "general inquiries"];

const step3Prompt = `
Based on the following list of departments: ${departments.join(", ")}, determine which department the complaint should be sent to. Use the extracted information from the previous step to help you make this decision.

Extracted information:
${step2Response}


Original complaint:
${user_complaint}
`;

const step3Response = await callApi(step3Prompt);
console.log("Department: ", step3Response);

// 4. Compose a short friendly response to the user based on information gathered.
const step4Prompt = `
Based on the extracted information and the department determined, compose a short friendly response to the user.

Extracted information:
${step2Response}

Department:
${step3Response}

Original complaint:
${user_complaint}
`;

const step4Response = await callApi(step4Prompt);
console.log("Final response: ", step4Response);

return step4Response;
}

promptChain("I have been charged a fee that I don't understand and I want to know why.");
