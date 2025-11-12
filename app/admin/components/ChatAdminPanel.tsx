"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import ChatBox from "./ChatBox";
import { Loader2, MessageCircle, ArrowLeft, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  // Hiển thị thời gian tương đối dạng Messenger
  const formatRelativeTime = (iso?: string) => {
    if (!iso) return "";
    const now = new Date();
    const t = new Date(iso);
    const diffMs = now.getTime() - t.getTime();
    const sec = Math.max(1, Math.floor(diffMs / 1000));
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);

    if (sec < 60) return "Vừa xong";
    if (min < 60) return `${min} phút`;
    if (hr < 24) return `${hr} giờ`;
    if (day === 1) return "Hôm qua";
    if (day < 7) return `${day} ngày`;

    const d = t.getDate().toString().padStart(2, "0");
    const m = (t.getMonth() + 1).toString().padStart(2, "0");
    return `${d}/${m}`;
  };

  // 🧩 Lấy user hiện tại
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

  // 🧩 Lấy danh sách phòng chat (có tin nhắn mới nhất)
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
          console.warn("⚠️ Supabase query error:", error);
          setRooms([]);
          return;
        }

        // ✅ Lấy thêm tin nhắn mới nhất của mỗi phòng
        const roomsWithDetails = await Promise.all(
          data.map(async (r) => {
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

        // ✅ Phòng Public cố định đầu tiên (GHIM)
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
          last_message_time:
            lastPublicMsg?.created_at || new Date().toISOString(),
        };

        // ✅ Gộp + sắp xếp, nhưng public luôn ở đầu
        const privateRooms = roomsWithDetails.filter(Boolean) as any[];
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
        console.error("🔥 Lỗi fetchRooms:", err?.message || err);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [user, supabase]);

  // 🧩 Theo dõi realtime tin nhắn mới
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("admin-realtime-chats")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const { room_id, sender_id, content, created_at } = payload.new;
          if (sender_id === user.id) return;
          setRooms((prev) =>
            prev.map((r) =>
              r.room_id === room_id
                ? {
                    ...r,
                    unread: (r.unread || 0) + 1,
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
  }, [user, supabase]);

  // 🧩 Đánh dấu đã đọc
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
      setRooms((prev) =>
        prev.map((r) =>
          r.room_id === activeRoom ? { ...r, unread: 0 } : r
        )
      );
    })();
  }, [activeRoom, user, supabase]);

  // 🧩 Lọc theo từ khóa tìm kiếm
  const filteredRooms = rooms.filter((r) =>
    r.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  // ===================== UI =====================
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 bg-black">
        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 rounded-full border border-neutral-800">
          <Loader2 className="animate-spin w-4 h-4 text-purple-400" />
          <span className="text-sm text-neutral-400">Đang tải...</span>
        </div>
      </div>
    );

  if (!user || user.role !== "admin")
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-black">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm text-neutral-400">
          Bạn không có quyền truy cập trang quản trị chat
        </p>
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
      <AnimatePresence mode="wait">
        {!activeRoom ? (
          <motion.div
            key="room-list"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col h-full bg-black"
          >
            {/* 🔍 Thanh tìm kiếm */}
            <div className="p-3 border-b border-neutral-800 bg-black">
              <div className="relative flex items-center bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-2.5 focus-within:border-neutral-700 transition-colors">
                <Search className="w-4 h-4 text-neutral-500 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm placeholder-neutral-600 text-white"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="ml-2 p-1 hover:bg-neutral-800 rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-neutral-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Danh sách phòng */}
            <div className="flex-1 overflow-y-auto bg-black scrollbar-hide">
              {filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3">
                    <MessageCircle className="w-6 h-6 text-neutral-600" />
                  </div>
                  <p className="text-sm text-neutral-500">
                    {search ? "Không tìm thấy kết quả" : "Chưa có cuộc trò chuyện"}
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {filteredRooms.map((r) => (
                    <button
                      key={r.room_id}
                      onClick={() => {
                        setActiveRoom(r.room_id);
                        setActiveUser(r);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-950 transition-colors group"
                    >
                      {/* Avatar with gradient ring if unread */}
                      <div className="relative flex-shrink-0">
                        {r.unread > 0 ? (
                          <div className="p-[2px] rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                            <img
                              src={r.avatar_url || "/default-avatar.png"}
                              alt="avatar"
                              className="w-12 h-12 rounded-full object-cover border-2 border-black"
                            />
                          </div>
                        ) : (
                          <img
                            src={r.avatar_url || "/default-avatar.png"}
                            alt="avatar"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        {/* Online indicator for public room */}
                        {r.room_id === PUBLIC_ROOM_ID && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-black"></div>
                        )}
                      </div>

                      {/* Message preview */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-medium text-sm ${r.unread > 0 ? 'text-white' : 'text-neutral-300'}`}>
                            {r.display_name}
                          </p>
                          <span className="text-[11px] text-neutral-500">
                            {formatRelativeTime(r.last_message_time)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate ${r.unread > 0 ? 'text-white font-medium' : 'text-neutral-500'}`}>
                            {r.last_message || (r.room_id === PUBLIC_ROOM_ID ? "Thảo luận chung" : "Bắt đầu trò chuyện")}
                          </p>
                          {r.unread > 0 && (
                            <span className="ml-2 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                              {r.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat-box"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col h-full bg-black"
          >
            {/* Header với nút back */}
            <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-black">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveRoom(null);
                    setActiveUser(null);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-neutral-900 flex items-center justify-center transition-colors text-neutral-400 hover:text-white"
                  aria-label="Quay lại"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                  src={activeUser?.avatar_url || "/default-avatar.png"}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-white text-sm">
                    {activeUser?.display_name}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {activeRoom === PUBLIC_ROOM_ID ? "Cộng đồng" : "Hỗ trợ khách hàng"}
                  </p>
                </div>
              </div>
            </div>

            {/* Nội dung chat */}
            <div className="flex-1 bg-black overflow-hidden">
              <ChatBox
                key={activeRoom}
                roomId={activeRoom}
                isPrivate={activeRoom !== PUBLIC_ROOM_ID}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}