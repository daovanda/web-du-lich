// ai-worker/src/vectorize.ts
/// <reference types="@cloudflare/workers-types" />
import type { Env, VectorizeMatch } from "./types";

const EMBEDDING_MODEL = "@cf/baai/bge-m3" as const;

export async function embedText(
  text: string,
  env: Env
): Promise<number[]> {
  const result = await env.AI.run(EMBEDDING_MODEL, {
    text: [text],
  });
  const vectors = (result as { data: number[][] }).data;
  if (!vectors?.[0]) throw new Error("Embedding failed: no vector returned");
  return vectors[0];
}

export async function searchVectorize(
  queryVector: number[],
  env: Env,
  options: {
    topK: number;
    namespace?: string;
    filter?: Record<string, string>;
  }
): Promise<VectorizeMatch[]> {
  const results = await env.VECTORIZE.query(queryVector, {
    topK: options.topK,
    returnMetadata: "all",
    namespace: options.namespace,
  });

  return (results.matches ?? []) as unknown as VectorizeMatch[];
}

export async function upsertVector(
  id: string,
  vector: number[],
  metadata: Record<string, string>,
  env: Env,
  namespace?: string
): Promise<void> {
  await env.VECTORIZE.upsert([
    {
      id,
      values: vector,
      metadata,
      namespace,
    },
  ]);
}