"use server";

import { getErrorMessage } from "@/app/utils/handleReport";
import { fetchWithRetry } from "@/app/utils/fetchWithRetry";
import { envClient } from "@/app/env/client";
import { SEARCH_QUERY_SYN_PROMPT } from "./config";
import { QueryStructure } from "./types";
import { z } from "zod";
import { generateChatbotObject } from "./aiSdk";

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

const queryStructureSchema = z.object({
  synthesisQuery: z.string().describe("The synthesized query based on the user current request."),
  needSearch: z
    .boolean()
    .describe("Indicate whether searching for information is needed based on the user question."),
  searchQueryLimit: z
    .union([z.enum(["3", "5", "7"]), z.number()])
    .optional()
    .describe("Indicate the number of search query limit for information retrieval."),
});

export async function fetchStructQueryPrompt(
  conversationHistoryString: string,
  fallbackQuery: string,
): Promise<QueryStructure> {
  try {
    const queryModel = process.env.NEXT_PUBLIC_GEMINI_MODEL_QUERY
      || envClient.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT;
    const result = await generateChatbotObject({
      model: queryModel,
      prompt: `instruction: ${SEARCH_QUERY_SYN_PROMPT}\n[Conversation]\n${conversationHistoryString}`,
      system: "You are a helpful assistant that helps with query synthesis.", // Generic system instruction as the main one is in the prompt
      schema: queryStructureSchema,
    });
    const raw = result.object as QueryStructure & { searchQueryLimit?: string | number };
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
  const searchBaseUrl = process.env.TXTAI_BASE_URL;
  if (!searchBaseUrl) {
    return [];
  }

  const res = await fetchWithRetry(searchBaseUrl, {
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
