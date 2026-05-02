export interface KnowledgeItem {
  id: string;
  category: "general" | "skills" | "project" | "experience" | string;
  title: string;
  date: string;
  tech_stack: string[];
  content: string;
  summary: string;
  importance_score: number;
}

export interface ChatInstance {
  id: string;
  message: string;
  role: string;
  isError?: boolean;
}
