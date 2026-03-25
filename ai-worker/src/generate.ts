// ai-worker/src/generate.ts
/// <reference types="@cloudflare/workers-types" />
import type { ChatMessage, VectorizeMatch } from "./types";

const GENERATE_MODEL = "@cf/meta/llama-3-8b-instruct" as const;

function buildRagSystemPrompt(
  knowledgeDocs: VectorizeMatch[],
  chatHistory: VectorizeMatch[],
  baseSystemPrompt: string
): string {
  const knowledgeSection =
    knowledgeDocs.length > 0
      ? `\n\n## Tài liệu tham khảo\nDưới đây là thông tin liên quan đến câu hỏi của người dùng. Ưu tiên sử dụng thông tin này khi trả lời:\n\n${knowledgeDocs
          .map((d, i) => {
            const source = d.metadata?.source ? ` (Nguồn: ${d.metadata.source})` : "";
            return `[${i + 1}]${source}\n${d.metadata?.content ?? ""}`;
          })
          .join("\n\n")}`
      : "";

  const chatHistorySection =
    chatHistory.length > 0
      ? `\n\n## Ngữ cảnh cuộc trò chuyện trước\n${chatHistory
          .map((h) => `${h.metadata?.role === "assistant" ? "Bot" : "User"}: ${h.metadata?.content ?? ""}`)
          .join("\n")}`
      : "";

  return `${baseSystemPrompt}${knowledgeSection}${chatHistorySection}`;
}

function buildFallbackSystemPrompt(baseSystemPrompt: string): string {
  return `${baseSystemPrompt}\n\nLưu ý: Không tìm thấy thông tin cụ thể trong tài liệu. Hãy trả lời dựa trên kiến thức chung và gợi ý người dùng liên hệ hỗ trợ trực tiếp nếu cần thiết.`;
}

export interface GenerateOptions {
  message: string;
  history: ChatMessage[];
  knowledgeDocs: VectorizeMatch[];
  chatHistory: VectorizeMatch[];
  isRag: boolean;
  baseSystemPrompt: string;
}

export async function generateStream(
  options: GenerateOptions,
  env: { AI: Ai }
): Promise<ReadableStream> {
  const { message, history, knowledgeDocs, chatHistory, isRag, baseSystemPrompt } = options;

  const systemPrompt = isRag
    ? buildRagSystemPrompt(knowledgeDocs, chatHistory, baseSystemPrompt)
    : buildFallbackSystemPrompt(baseSystemPrompt);

  const recentHistory = history.slice(-10);

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: message },
  ];

  const stream = (await env.AI.run(GENERATE_MODEL, {
    messages,
    stream: true,
    max_tokens: 1024,
    temperature: 0.7,
  })) as ReadableStream;

  return stream;
}

export { GENERATE_MODEL };