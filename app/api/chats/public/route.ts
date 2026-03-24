import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

const PUBLIC_ROOM_ID = "00000000-0000-0000-0000-000000000001";

export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(req.url);
  const before = searchParams.get("before");
  const since = searchParams.get("since");
  const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

  let query = supabase
    .from("chat_messages")
    .select(
      "id, room_id, sender_id, content, from_admin, created_at, profiles(username, avatar_url)"
    )
    .eq("room_id", PUBLIC_ROOM_ID)
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

// POST: gửi tin nhắn public
export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { content } = await req.json();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Thiếu nội dung tin nhắn" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      room_id: PUBLIC_ROOM_ID,
      sender_id: user.id,
      content: content.trim(),
      from_admin: isAdmin,
    })
    .select(
      "id, room_id, sender_id, content, from_admin, created_at, profiles(username, avatar_url)"
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
