"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import ChatBox from "./ChatBox";
import { Loader2, MessageCircle, ArrowLeft, Search } from "lucide-react";

export default function ChatAdminPanel() {
  const supabase = useSupabase();
  const [user, setUser] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const PUBLIC_ROOM_ID = "00000000-0000-0000-0000-000000000001";
  const PUBLIC_AVATAR_URL = "/group-chat.png";

  // Fetch current user with role
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, avatar_url, email")
        .eq("id", data.user.id)
        .maybeSingle();

      setUser({
        ...data.user,
        email: profile?.email || data.user.email,
        role: profile?.role || data.user.user_metadata?.role || "user",
        avatar_url: profile?.avatar_url || "/default-avatar.png",
      });
    })();
  }, [supabase]);

  // Fetch rooms with derived details
  useEffect(() => {
    if (!user) return;

    const fetchRooms = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("user_chats_view")
          .select("room_id, type, user_id, user_name, user_email, created_at")
          .neq("room_id", PUBLIC_ROOM_ID);

        if (error) {
          console.warn("Supabase query error:", error);
          setRooms([]);
          return;
        }

        const roomsWithDetails = await Promise.all(
          (data || []).map(async (r: any) => {
            if (!r?.user_id) return null;

            const [{ data: profile }, { data: lastMsg }, { data: unread }] =
              await Promise.all([
                supabase
                  .from("profiles")
                  .select("avatar_url, email")
                  .eq("id", r.user_id)
                  .maybeSingle(),
                supabase
                  .from("chat_messages")
                  .select("content, created_at")
                  .eq("room_id", r.room_id)
                  .order("created_at", { ascending: false })
                  .limit(1)
                  .maybeSingle(),
                supabase.rpc("count_unread_in_room", {
                  p_user_id: user.id,
                  p_room_id: r.room_id,
                }),
              ]);

            return {
              ...r,
              unread: unread || 0,
              avatar_url: profile?.avatar_url || "/default-avatar.png",
              display_name:
                r.user_name || profile?.email || r.user_email || "Người dùng",
              last_message: lastMsg?.content || "",
              last_message_time: lastMsg?.created_at || r.created_at,
            };
          })
        );

        const { data: unreadPublic } = await supabase.rpc(
          "count_unread_in_room",
          {
            p_user_id: user.id,
            p_room_id: PUBLIC_ROOM_ID,
          }
        );

        const { data: lastPublicMsg } = await supabase
          .from("chat_messages")
          .select("content, created_at")
          .eq("room_id", PUBLIC_ROOM_ID)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const publicRoom = {
          room_id: PUBLIC_ROOM_ID,
          type: "public",
          display_name: "Phòng chung",
          avatar_url: PUBLIC_AVATAR_URL,
          unread: unreadPublic || 0,
          last_message: lastPublicMsg?.content || "",
          last_message_time: lastPublicMsg?.created_at || new Date().toISOString(),
        };

        const privateRooms = (roomsWithDetails || []).filter(Boolean) as any[];
        privateRooms.sort((a, b) => {
          const timeA = a?.last_message_time
            ? new Date(a.last_message_time).getTime()
            : 0;
          const timeB = b?.last_message_time
            ? new Date(b.last_message_time).getTime()
            : 0;
          return timeB - timeA;
        });

        const cleanRooms = [publicRoom, ...privateRooms];
        setRooms(cleanRooms);
      } catch (err: any) {
        console.error("fetchRooms error:", err?.message || err);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchRooms();
  }, [user, supabase]);

  // Realtime increments + last message, but zero out if active
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("admin-realtime-chats")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        async (payload) => {
          const { room_id, sender_id, content, created_at } = payload.new as any;
          if (sender_id === user.id) return;

          const isActive = room_id === activeRoom;
          if (isActive) {
            await supabase.from("chat_reads").upsert(
              {
                room_id,
                user_id: user.id,
                last_read_at: new Date().toISOString(),
              },
              { onConflict: "room_id,user_id" }
            );
          }

          setRooms((prev) =>
            prev.map((r) =>
              r.room_id === room_id
                ? {
                    ...r,
                    unread: isActive ? 0 : (r.unread || 0) + 1,
                    last_message: content,
                    last_message_time: created_at,
                  }
                : r
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeRoom, supabase]);

  // Mark active room as read
  useEffect(() => {
    if (!activeRoom || !user) return;
    (async () => {
      await supabase.from("chat_reads").upsert(
        {
          room_id: activeRoom,
          user_id: user.id,
          last_read_at: new Date().toISOString(),
        },
        { onConflict: "room_id,user_id" }
      );
      setRooms((prev) => prev.map((r) => (r.room_id === activeRoom ? { ...r, unread: 0 } : r)));
    })();
  }, [activeRoom, user, supabase]);

  const filteredRooms = rooms.filter((r) =>
    (r.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
      </div>
    );

  if (!user || user.role !== "admin")
    return (
      <div className="p-4 text-gray-400 text-sm">
        Bạn không có quyền truy cập trang quản trị chat.
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden">
      {!activeRoom ? (
        <div className="flex flex-col h-full bg-gray-900">
          <div className="p-3 font-semibold text-sm flex items-center gap-2 bg-gray-900">
            <MessageCircle className="w-4 h-4" />
            Danh sách phòng chat
          </div>

          <div className="p-2 border-b border-gray-800 flex items-center gap-2 bg-gray-900">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-900">
            {filteredRooms.map((r) => (
              <button
                key={r.room_id}
                onClick={() => {
                  setActiveRoom(r.room_id);
                  setActiveUser(r);
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-800 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.avatar_url || "/default-avatar.png"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover mr-3"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.display_name}</p>
                  <p className="text-xs text-gray-400 truncate">{r.last_message}</p>
                </div>
                {r.unread > 0 && (
                  <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full ml-2">{r.unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full bg-gray-900">
          <div className="p-2 border-b border-gray-700 flex items-center gap-2 bg-gray-900">
            <button
              onClick={() => {
                setActiveRoom(null);
                setActiveUser(null);
              }}
              className="p-1 hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeUser?.avatar_url || "/default-avatar.png"}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="ml-2 font-medium text-sm truncate">{activeUser?.display_name}</div>
          </div>

          <div className="flex-1 min-h-0">
            <ChatBox key={activeRoom} roomId={activeRoom!} isPrivate={activeRoom !== PUBLIC_ROOM_ID} />
          </div>
        </div>
      )}
    </div>
  );
}
