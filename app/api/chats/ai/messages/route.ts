import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("room_id");
  if (!roomId) return NextResponse.json({ error: "Missing room_id" }, { status: 400 });

  // Kiểm tra quyền: chỉ chủ phòng mới được đọc
  const { data: room } = await supabase
    .from("chat_rooms")
    .select("id, type, user_id")
    .eq("id", roomId)
    .maybeSingle();

  if (!room || room.type !== "ai_bot" || room.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const before = searchParams.get("before");
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

  let query = supabase
    .from("chat_messages")
    .select("id, room_id, sender_id, content, from_admin, created_at, metadata, profiles(username, avatar_url)")
    .eq("room_id", roomId)
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before).order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: (data ?? []).slice().reverse() });
}