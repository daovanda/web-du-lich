"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatBox from "./ChatBox";
import ChatAdminPanel from "./ChatAdminPanel";
import { useSupabase } from "@/components/SupabaseProvider";

export default function ChatWidget() {
  const supabase = useSupabase();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"public" | "private">("public");
  const [privateRoomId, setPrivateRoomId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>("user"); // 👈 thêm role

  const [unreadPublic, setUnreadPublic] = useState(0);
  const [unreadPrivate, setUnreadPrivate] = useState(0);

  const PUBLIC_ROOM_ID = "00000000-0000-0000-0000-000000000001";

  // 🧩 Lấy user hiện tại + role
  useEffect(() => {
    (async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        setUser(null);
        return;
      }
      setUser(user);

      // Lấy role từ bảng profiles (ưu tiên)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role || user.user_metadata?.role || "user");
    })();
  }, [supabase]);

  // 🧩 Tự động lấy hoặc tạo phòng riêng (private room)
  useEffect(() => {
    const fetchOrCreatePrivateRoom = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("type", "private")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setPrivateRoomId(data.id);
        return;
      }

      const { data: newRoom } = await supabase
        .from("chat_rooms")
        .insert({ type: "private", user_id: user.id })
        .select("id")
        .single();

      if (newRoom) setPrivateRoomId(newRoom.id);
    };

    fetchOrCreatePrivateRoom();
  }, [user, supabase]);

  // 🧩 Hàm lấy số tin chưa đọc
  const fetchUnreadCounts = async () => {
    if (!user) return;

    const { data: publicData } = await supabase.rpc("count_unread_in_room", {
      p_user_id: user.id,
      p_room_id: PUBLIC_ROOM_ID,
    });

    let privateCount = 0;
    if (privateRoomId) {
      const { data: privateData } = await supabase.rpc("count_unread_in_room", {
        p_user_id: user.id,
        p_room_id: privateRoomId,
      });
      privateCount = privateData || 0;
    }

    setUnreadPublic(publicData || 0);
    setUnreadPrivate(privateCount);
  };

  useEffect(() => {
    if (user && privateRoomId) fetchUnreadCounts();
  }, [user, privateRoomId]);

  // 🧩 Đánh dấu đã đọc khi mở
  useEffect(() => {
    if (!user || !open) return;

    const markAsRead = async (roomId: string) => {
      await supabase.from("chat_reads").upsert(
        {
          room_id: roomId,
          user_id: user.id,
          last_read_at: new Date().toISOString(),
        },
        { onConflict: "room_id,user_id" }
      );
    };

    if (tab === "public") {
      markAsRead(PUBLIC_ROOM_ID);
      setUnreadPublic(0);
    } else if (privateRoomId) {
      markAsRead(privateRoomId);
      setUnreadPrivate(0);
    }
  }, [open, tab, user, privateRoomId, supabase]);

  // 🧩 Realtime
  useEffect(() => {
    if (!user) return;

    const handleNewMessage = async (roomId: string, senderId: string) => {
      if (senderId === user.id) return;

      if (roomId === PUBLIC_ROOM_ID) {
        if (!open || tab !== "public") {
          setUnreadPublic((p) => p + 1);
        } else {
          await supabase.from("chat_reads").upsert(
            {
              room_id: PUBLIC_ROOM_ID,
              user_id: user.id,
              last_read_at: new Date().toISOString(),
            },
            { onConflict: "room_id,user_id" }
          );
        }
      } else if (roomId === privateRoomId) {
        if (!open || tab !== "private") {
          setUnreadPrivate((p) => p + 1);
        } else {
          await supabase.from("chat_reads").upsert(
            {
              room_id: privateRoomId!,
              user_id: user.id,
              last_read_at: new Date().toISOString(),
            },
            { onConflict: "room_id,user_id" }
          );
        }
      }
    };

    const channel = supabase
      .channel("realtime-chats")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => handleNewMessage(payload.new.room_id, payload.new.sender_id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, privateRoomId, open, tab, supabase]);

  // 🧩 Giao diện chính
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Nút mở/đóng */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="relative bg-indigo-600 hover:bg-indigo-700 p-4 rounded-full shadow-lg"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {(unreadPublic > 0 || unreadPrivate > 0) && role !== "admin" && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadPublic + unreadPrivate}
            </span>
          )}
        </button>
      ) : (
        <div className="bg-gray-900 text-white rounded-2xl shadow-lg w-80 h-96 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <div className="flex space-x-3">
              {role !== "admin" && (
                <>
                  <button
                    onClick={() => setTab("public")}
                    className={`text-sm font-medium relative ${
                      tab === "public" ? "text-indigo-400" : "text-gray-400"
                    }`}
                  >
                    Chung
                    {unreadPublic > 0 && (
                      <span className="absolute -top-2 -right-4 bg-red-500 text-xs rounded-full px-2">
                        {unreadPublic}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setTab("private")}
                    className={`text-sm font-medium relative ${
                      tab === "private" ? "text-indigo-400" : "text-gray-400"
                    }`}
                  >
                    Hỗ trợ
                    {unreadPrivate > 0 && (
                      <span className="absolute -top-2 -right-5 bg-red-500 text-xs rounded-full px-2">
                        {unreadPrivate}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Nội dung chat */}
          <div className="flex-1 min-h-0">
            {role === "admin" ? (
              <ChatAdminPanel />
            ) : tab === "public" ? (
              <ChatBox roomId={PUBLIC_ROOM_ID} isPrivate={false} />
            ) : (
              privateRoomId && (
                <ChatBox roomId={privateRoomId} isPrivate={true} />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
