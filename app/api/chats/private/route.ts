import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: lấy tin nhắn trong private room
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("room_id");
  if (!roomId) return NextResponse.json({ error: "Missing room_id" }, { status: 400 });

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, sender_id, content, from_admin, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: gửi tin nhắn private
export async function POST(req: Request) {
  const { room_id, sender_id, content, from_admin } = await req.json();

  const { data, error } = await supabase.from("chat_messages").insert({
    room_id,
    sender_id,
    content,
    from_admin,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
