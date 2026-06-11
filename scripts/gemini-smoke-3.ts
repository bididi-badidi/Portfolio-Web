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
    console.log("Testing gemini-3-flash-preview...");
    const response = await generateText({
      model: google("gemini-3-flash-preview"),
      prompt: "Hello, who are you?",
    });
    console.log("Response Text:", response.text);
  } catch (error) {
    console.error("Error Message:", error instanceof Error ? error.message : error);
    // Log more details if available
    if (error && typeof error === "object") {
      try {
        console.error("Full Error:", JSON.stringify(error, null, 2));
      } catch {
        console.error("Could not stringify error");
      }
    }
  }
}

test();
