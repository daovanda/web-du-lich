// ai-worker/src/types.ts
/// <reference types="@cloudflare/workers-types" />

export interface Env {
  AI: Ai;
  VECTORIZE: VectorizeIndex;
  SIMILARITY_THRESHOLD: string;
  TOP_K: string;
  CHAT_HISTORY_TOP_K: string;
  WORKER_SECRET: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AiRequestBody {
  message: string;
  history: ChatMessage[];
  roomId: string;
  systemPrompt?: string;
}

export interface VectorizeMatch {
  id: string;
  score: number;
  metadata?: {
    type: "knowledge" | "chat";
    content: string;
    source?: string;
    roomId?: string;
    role?: string;
  };
}