export interface ChatInstance {
  id: string;
  message: string;
  role: string;
  isError?: boolean;
  rateLimitResetAt?: number;
}
