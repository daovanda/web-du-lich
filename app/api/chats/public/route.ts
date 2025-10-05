import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const PUBLIC_ROOM_ID = "00000000-0000-0000-0000-000000000001";

// GET: lấy tất cả tin nhắn public
export async function GET() {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, sender_id, content, from_admin, created_at")
    .eq("room_id", PUBLIC_ROOM_ID)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: gửi tin nhắn public
export async function POST(req: Request) {
  const { sender_id, content, from_admin } = await req.json();

  const { data, error } = await supabase.from("chat_messages").insert({
    room_id: PUBLIC_ROOM_ID,
    sender_id,
    content,
    from_admin,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
