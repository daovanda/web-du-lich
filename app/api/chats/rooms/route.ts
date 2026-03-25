// app/api/chats/rooms/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

const PUBLIC_ROOM_ID = "00000000-0000-0000-0000-000000000001";
const PUBLIC_AVATAR_URL = "/group-chat.png";

type RoomItem = {
  room_id: string;
  type: "public" | "private" | "ai_bot";
  display_name: string;
  avatar_url: string;
  unread: number;
  last_message: string;
  last_message_time: string | null;
  user_id?: string | null;
};

async function getUnreadCount(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  userId: string,
  roomId: string
) {
  const { data } = await supabase.rpc("count_unread_in_room", {
    p_user_id: userId,
    p_room_id: roomId,
  });
  return Number(data || 0);
}

async function getLastMessage(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  roomId: string
) {
  const { data } = await supabase
    .from("chat_messages")
    .select("content, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data || null;
}

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role || "user";
    const publicLast = await getLastMessage(supabase, PUBLIC_ROOM_ID);
    const publicUnread = await getUnreadCount(supabase, user.id, PUBLIC_ROOM_ID);

    const publicRoom: RoomItem = {
      room_id: PUBLIC_ROOM_ID,
      type: "public",
      display_name: "Phòng chung",
      avatar_url: PUBLIC_AVATAR_URL,
      unread: publicUnread,
      last_message: publicLast?.content || "",
      last_message_time: publicLast?.created_at || null,
    };

    // ── Admin: public + tất cả private (không có ai_bot) ──
    if (role === "admin") {
      const { data: rawRooms, error } = await supabase
        .from("user_chats_view")
        .select("room_id, type, user_id, user_name, user_email, created_at")
        .neq("room_id", PUBLIC_ROOM_ID)
        .eq("type", "private");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const privateRooms = await Promise.all(
        (rawRooms || []).map(async (room) => {
          const [{ data: userProfile }, last, unread] = await Promise.all([
            supabase
              .from("profiles")
              .select("avatar_url, email")
              .eq("id", room.user_id)
              .maybeSingle(),
            getLastMessage(supabase, room.room_id),
            getUnreadCount(supabase, user.id, room.room_id),
          ]);

          return {
            room_id: room.room_id,
            type: "private" as const,
            display_name:
              room.user_name || userProfile?.email || room.user_email || "Người dùng",
            avatar_url: userProfile?.avatar_url || "/default-avatar.png",
            unread,
            last_message: last?.content || "",
            last_message_time: last?.created_at || room.created_at || null,
            user_id: room.user_id,
          };
        })
      );

      privateRooms.sort(
        (a, b) =>
          new Date(b.last_message_time || 0).getTime() -
          new Date(a.last_message_time || 0).getTime()
      );

      return NextResponse.json({
        data: {
          role,
          user: { id: user.id, email: user.email || null },
          rooms: [publicRoom, ...privateRooms],
        },
      });
    }

    // ── User thường: public + private + ai_bot ──

    // Lấy hoặc tạo private room
    const { data: privateRoom } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("type", "private")
      .eq("user_id", user.id)
      .maybeSingle();

    let finalPrivateRoomId = privateRoom?.id || null;
    if (!finalPrivateRoomId) {
      const { data: createdRoom, error: createError } = await supabase
        .from("chat_rooms")
        .insert({ type: "private", user_id: user.id })
        .select("id")
        .single();
      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
      finalPrivateRoomId = createdRoom.id;
    }

    // Lấy hoặc tạo ai_bot room
    const { data: aiBotRoom } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("type", "ai_bot")
      .eq("user_id", user.id)
      .maybeSingle();

    let finalAiBotRoomId = aiBotRoom?.id || null;
    if (!finalAiBotRoomId) {
      const { data: createdAiRoom, error: createAiError } = await supabase
        .from("chat_rooms")
        .insert({ type: "ai_bot", user_id: user.id })
        .select("id")
        .single();
      if (createAiError) {
        return NextResponse.json({ error: createAiError.message }, { status: 500 });
      }
      finalAiBotRoomId = createdAiRoom.id;
    }

    // Lấy last message + unread cho cả 3 rooms song song
    const [privateLast, privateUnread, aiBotLast, aiBotUnread] = await Promise.all([
      getLastMessage(supabase, finalPrivateRoomId),
      getUnreadCount(supabase, user.id, finalPrivateRoomId),
      getLastMessage(supabase, finalAiBotRoomId),
      getUnreadCount(supabase, user.id, finalAiBotRoomId),
    ]);

    const privateRoomItem: RoomItem = {
      room_id: finalPrivateRoomId,
      type: "private",
      display_name: "Hỗ trợ",
      avatar_url: "/support-avatar.png",
      unread: privateUnread,
      last_message: privateLast?.content || "",
      last_message_time: privateLast?.created_at || null,
      user_id: user.id,
    };

    const aiBotRoomItem: RoomItem = {
      room_id: finalAiBotRoomId,
      type: "ai_bot",
      display_name: "Trợ lý AI",
      avatar_url: "/ai-avatar.png",
      unread: aiBotUnread,
      last_message: aiBotLast?.content || "",
      last_message_time: aiBotLast?.created_at || null,
      user_id: user.id,
    };

    return NextResponse.json({
      data: {
        role,
        user: { id: user.id, email: user.email || null },
        rooms: [publicRoom, privateRoomItem, aiBotRoomItem],
      },
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}