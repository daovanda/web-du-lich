// ai-worker/src/index.ts
/// <reference types="@cloudflare/workers-types" />
import type { Env, AiRequestBody } from "./types";
import { embedText, searchVectorize, upsertVector } from "./vectorize";
import { generateStream } from "./generate";

const DEFAULT_SYSTEM_PROMPT = `Bạn là trợ lý AI hỗ trợ khách hàng. Hãy trả lời thân thiện, ngắn gọn và chính xác bằng tiếng Việt.
Nếu không biết câu trả lời, hãy nói thẳng và gợi ý người dùng liên hệ với đội ngũ hỗ trợ.
Không bịa đặt thông tin.`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const auth = request.headers.get("Authorization");
    if (!auth || auth !== `Bearer ${env.WORKER_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);

    try {
      if (request.method === "POST" && url.pathname === "/chat") {
        return await handleChat(request, env);
      }
      if (request.method === "POST" && url.pathname === "/embed") {
        return await handleEmbed(request, env);
      }
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Worker error:", err);
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
} satisfies ExportedHandler<Env>;

async function handleChat(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as AiRequestBody;
  const { message, history, roomId, systemPrompt } = body;

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: "Missing message" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const threshold = parseFloat(env.SIMILARITY_THRESHOLD ?? "0.55");
  const topK      = parseInt(env.TOP_K ?? "5");
  const chatTopK  = parseInt(env.CHAT_HISTORY_TOP_K ?? "3");

  const queryVector = await embedText(message, env);

  const [knowledgeMatches, chatMatches] = await Promise.all([
    searchVectorize(queryVector, env, { topK, namespace: "knowledge" }),
    searchVectorize(queryVector, env, { topK: chatTopK, namespace: `chat:${roomId}` }),
  ]);

  const relevantKnowledge = knowledgeMatches.filter((m) => m.score >= threshold);
  const relevantChat      = chatMatches.filter((m) => m.score >= threshold * 0.9);
  const isRag             = relevantKnowledge.length > 0;

  const userVectorId = `chat:${roomId}:user:${Date.now()}`;
  upsertVector(
    userVectorId,
    queryVector,
    { type: "chat", content: message.slice(0, 1000), roomId, role: "user" },
    env,
    `chat:${roomId}`
  ).catch(console.error);

  const stream = await generateStream(
    {
      message,
      history,
      knowledgeDocs: relevantKnowledge,
      chatHistory: relevantChat,
      isRag,
      baseSystemPrompt: systemPrompt ?? DEFAULT_SYSTEM_PROMPT,
    },
    env
  );

  return new Response(stream, {
    headers: {
      ...corsHeaders(),
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Is-Rag": isRag ? "1" : "0",
    },
  });
}

async function handleEmbed(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as { id: string; content: string; source?: string };

  if (!body.id || !body.content) {
    return new Response(JSON.stringify({ error: "Missing id or content" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const vector = await embedText(body.content, env);
  await upsertVector(
    `doc:${body.id}`,
    vector,
    { type: "knowledge", content: body.content.slice(0, 1000), source: body.source ?? body.id },
    env,
    "knowledge"
  );

  return new Response(JSON.stringify({ ok: true, id: body.id }), {
    headers: { "Content-Type": "application/json" },
  });
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}