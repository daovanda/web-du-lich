// app/api/chats/ai-room/route.ts
// Trả về room_id của AI bot room cho user hiện tại
// Nếu chưa có (edge case) thì tạo mới — idempotent

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client (bypass RLS) — chỉ dùng server-side
const adminSupabase = createClient(SUPABASE_URL, SERVICE_KEY);

export async function GET(req: NextRequest) {
  // 1. Lấy user từ session
  const cookieStore = cookies();
  const userSupabase = createServerClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authError } = await userSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Tìm ai_bot room của user
  const { data: existingRoom } = await adminSupabase
    .from("chat_rooms")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", "ai_bot")
    .single();

  if (existingRoom) {
    return NextResponse.json({ data: { room_id: existingRoom.id } });
  }

  // 3. Chưa có → tạo mới (edge case: trigger bị miss)
  const { data: newRoom, error: createError } = await adminSupabase
    .from("chat_rooms")
    .insert({ type: "ai_bot", user_id: user.id })
    .select("id")
    .single();

  if (createError || !newRoom) {
    return NextResponse.json({ error: "Cannot create AI room" }, { status: 500 });
  }

  // Tin nhắn chào mừng
  await adminSupabase.from("chat_messages").insert({
    room_id: newRoom.id,
    sender_id: null, // null = AI bot
    content: "Xin chào! Mình là trợ lý du lịch AI. Hỏi mình về homestay, đặt xe, hoặc gợi ý điểm đến nhé 🌴",
  });

  return NextResponse.json({ data: { room_id: newRoom.id } });
}