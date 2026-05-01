import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const client = new GoogleGenAI({ apiKey: apiKey! });

async function test() {
  try {
    console.log("Testing gemini-2.0-flash...");
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: "Hi" }] }],
    });
    console.log("Response:", response.text);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
  }
}
test();
