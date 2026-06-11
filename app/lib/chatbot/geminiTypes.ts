export enum Type {
  STRING = "STRING",
  NUMBER = "NUMBER",
  INTEGER = "INTEGER",
  BOOLEAN = "BOOLEAN",
  ARRAY = "ARRAY",
  OBJECT = "OBJECT",
}

export interface FunctionCall {
  name?: string;
  args?: Record<string, unknown>;
}

export interface FunctionDeclaration {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
}

export interface GenerateContentConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  responseSchema?: Record<string, unknown>;
  systemInstruction?: string;
  tools?: Array<{
    functionDeclarations?: FunctionDeclaration[];
  }>;
}

export interface GenerateContentResponse {
  text?: string | null;
  functionCalls?: FunctionCall[];
}
