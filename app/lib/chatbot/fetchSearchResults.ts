"use server";

import { envServer } from "@/app/env/server";
import { getErrorMessage } from "@/app/utils/handleReport";
import { Type } from "@google/genai";
import { fetchWithRetry } from "@/app/utils/fetchWithRetry";
import { envClient } from "@/app/env/client";
import { SEARCH_QUERY_SYN_PROMPT } from "./config";
import { GeminiService } from "./geminiService";
import { QueryStructure } from "./types";

export interface ResultInstance {
  id: string | null;
  text: string | null;
  answer: string | null;
  score: number | null;
}

interface SearchResponse {
  error: boolean | null;
  message: string | null;
  result: ResultInstance[] | null;
}

export async function fetchStructQueryPrompt(
  conversationHistoryString: string,
  fallbackQuery: string,
): Promise<QueryStructure> {
  try {
    const raw = await GeminiService.generateJSON<QueryStructure & { searchQueryLimit: string | number }>(
      envClient.NEXT_PUBLIC_GEMINI_MODEL_QUERY,
      `instruction: ${SEARCH_QUERY_SYN_PROMPT}\n[Conversation]\n${conversationHistoryString}`,
      "You are a helpful assistant that helps with query synthesis.", // Generic system instruction as the main one is in the prompt
      {
        type: Type.OBJECT,
        required: ["needSearch", "synthesisQuery"],
        properties: {
          synthesisQuery: {
            type: Type.STRING,
            description: "The synthesized query based on the user current request.",
          },
          needSearch: {
            type: Type.BOOLEAN,
            description: "Indicate whether searching for information is needed based on the user question.",
          },
          searchQueryLimit: {
            type: Type.STRING,
            enum: ["3", "5", "7"],
            description: "Indicate the number of search query limit for information retrieval.",
          },
        },
      }
    );
    return {
      ...raw,
      searchQueryLimit: Number(raw.searchQueryLimit) || 3,
    };
  } catch (err) {
    const errMsg = getErrorMessage(err);
    console.error(`fetchStructQueryPrompt error: ${errMsg}`);
    return {
      synthesisQuery: fallbackQuery,
      needSearch: false,
      searchQueryLimit: 3,
    };
  }
}

export async function fetchSearchResults(
  query: string,
  limit: number = 3,
): Promise<ResultInstance[]> {
  const res = await fetchWithRetry(envServer.TXTAI_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "query": query,
      "limit": limit,
    }),
  });

  if (!res.response || res.errMsg) {
    console.error(`Error while fetching search results: ${res.errMsg}`);
    return [];
  }

  const fetchData = res.response as unknown as SearchResponse;
  if (fetchData != null && fetchData.result != null) {
    return [...fetchData.result];
  }

  return [];
}
