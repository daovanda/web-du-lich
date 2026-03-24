// app/api/chats/ai-message/route.ts
// Lưu message AI bot vào chat_messages
// sender_id = user.id nếu senderType = "user"
// sender_id = NULL nếu senderType = "bot"
// Chỉ được ghi vào room type='ai_bot' thuộc về user hiện tại

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupa    = createClient(SUPABASE_URL, SERVICE_KEY);

export async function POST(req: NextRequest) {
  // 1. Auth
  const cookieStore = cookies();
  const userSupa = createServerClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data: { user } } = await userSupa.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Parse body
  const { roomId, content, senderType, metadata } = await req.json() as {
    roomId: string;
    content: string;
    senderType: "user" | "bot";
    metadata?: Record<string, unknown>;
  };

  if (!roomId || !content?.trim()) {
    return NextResponse.json({ error: "Missing roomId or content" }, { status: 400 });
  }

  // 3. Kiểm tra room thuộc user và đúng type ai_bot
  const { data: room } = await adminSupa
    .from("chat_rooms")
    .select("id, user_id, type")
    .eq("id", roomId)
    .single();

  if (!room || room.type !== "ai_bot" || room.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Insert
  const { data: msg, error } = await adminSupa
    .from("chat_messages")
    .insert({
      room_id:   roomId,
      sender_id: senderType === "user" ? user.id : null,
      content:   content.trim(),
      metadata:  metadata ?? null,
    })
    .select("id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: msg });
}