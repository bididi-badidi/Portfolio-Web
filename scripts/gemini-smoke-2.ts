import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set");
  process.exit(1);
}

const google = createGoogleGenerativeAI({ apiKey });

async function test() {
  try {
    console.log("Testing gemini-2.0-flash...");
    const response = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: "Hi",
    });
    console.log("Response:", response.text);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
  }
}
test();
