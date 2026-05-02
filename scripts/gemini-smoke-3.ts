import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set");
  process.exit(1);
}

const client = new GoogleGenAI({
  apiKey: apiKey,
});

async function test() {
  try {
    console.log("Testing gemini-3-flash-preview...");
    // @google/genai SDK might have different method names depending on version
    // Based on the package.json it is ^0.8.0
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: "Hello, who are you?" }] }],
    });
    console.log("Response Text:", response.text);
  } catch (error) {
    console.error("Error Message:", error instanceof Error ? error.message : error);
    // Log more details if available
    if (error && typeof error === 'object') {
        try {
            console.error("Full Error:", JSON.stringify(error, null, 2));
        } catch (e) {
            console.error("Could not stringify error");
        }
    }
  }
}

test();
