import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

async function getRole(supabase: Awaited<ReturnType<typeof createServerSupabase>>, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return data?.role || "user";
}

async function canAccessRoom(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  roomId: string,
  userId: string
) {
  const role = await getRole(supabase, userId);
  if (role === "admin") return true;
  const { data: room } = await supabase
    .from("chat_rooms")
    .select("id, user_id, type")
    .eq("id", roomId)
    .maybeSingle();
  return !!room && room.type === "private" && room.user_id === userId;
}

export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("room_id");
  if (!roomId) return NextResponse.json({ error: "Missing room_id" }, { status: 400 });

  const allowed = await canAccessRoom(supabase, roomId, user.id);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const before = searchParams.get("before");
  const since = searchParams.get("since");
  const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

  let query = supabase
    .from("chat_messages")
    .select(
      "id, room_id, sender_id, content, from_admin, created_at, profiles(username, avatar_url)"
    )
    .eq("room_id", roomId)
    .limit(limit);

  if (since) {
    query = query.gt("created_at", since).order("created_at", { ascending: true });
  } else if (before) {
    query = query.lt("created_at", before).order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const normalized = since ? data || [] : (data || []).slice().reverse();
  return NextResponse.json({ data: normalized });
}

// POST: gửi tin nhắn private
export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { room_id, content } = await req.json();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!room_id) {
    return NextResponse.json({ error: "Missing room_id" }, { status: 400 });
  }

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Thiếu nội dung tin nhắn" }, { status: 400 });
  }

  const allowed = await canAccessRoom(supabase, room_id, user.id);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const role = await getRole(supabase, user.id);
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      room_id,
      sender_id: user.id,
      content: content.trim(),
      from_admin: role === "admin",
    })
    .select(
      "id, room_id, sender_id, content, from_admin, created_at, profiles(username, avatar_url)"
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
