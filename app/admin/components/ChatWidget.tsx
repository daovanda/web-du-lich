// components/chat/ChatWidget.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, ArrowLeft, Bot } from "lucide-react";
import ChatBox from "./ChatBox";
import AiBotBox from "./AiBotBox";
import ChatAdminPanel from "./ChatAdminPanel";
import { apiRequest } from "@/lib/apiClient";
import { supabase } from "@/lib/supabase";

type RoomItem = {
  room_id: string;
  type: "public" | "private" | "ai_bot";
  display_name: string;
  avatar_url: string;
  unread: number;
  last_message: string;
  last_message_time: string | null;
};

const PUBLIC_ROOM_ID = "00000000-0000-0000-0000-000000000001";
const PUBLIC_AVATAR  = "/group-chat.png";
const SUPPORT_AVATAR = "/support-avatar.png";
const AI_AVATAR      = "/ai-avatar.png";

function formatRelativeTime(iso?: string | null): string {
  if (!iso) return "";
  const now = new Date();
  const t   = new Date(iso);
  const sec = Math.max(1, Math.floor((now.getTime() - t.getTime()) / 1000));
  const min = Math.floor(sec / 60);
  const hr  = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (sec < 60) return "Vừa xong";
  if (min < 60) return `${min} phút`;
  if (hr  < 24) return `${hr} giờ`;
  if (day === 1) return "Hôm qua";
  if (day <   7) return `${day} ngày`;
  return `${String(t.getDate()).padStart(2,"0")}/${String(t.getMonth()+1).padStart(2,"0")}`;
}

function getRoomMeta(room: RoomItem | undefined) {
  if (!room) return { avatar: PUBLIC_AVATAR, name: "", subtitle: "" };
  if (room.type === "public")  return { avatar: PUBLIC_AVATAR,  name: "Phòng chung", subtitle: "Cộng đồng"      };
  if (room.type === "ai_bot")  return { avatar: AI_AVATAR,      name: "Trợ lý AI",   subtitle: "Luôn sẵn sàng" };
  return                              { avatar: SUPPORT_AVATAR, name: "Hỗ trợ",      subtitle: "Luôn sẵn sàng" };
}

function getPlaceholder(type: RoomItem["type"]): string {
  if (type === "public")  return "Thảo luận chung";
  if (type === "ai_bot")  return "Hỏi trợ lý AI...";
  return "Hỗ trợ trực tiếp";
}

export default function ChatWidget() {
  const [open, setOpen]                 = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [user, setUser]                 = useState<any>(null);
  const [role, setRole]                 = useState<string>("user");
  const [rooms, setRooms]               = useState<RoomItem[]>([]);
  const fetchTimerRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tick mỗi 60s để re-render relative time
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Fetch rooms ──
  const fetchRooms = async () => {
    try {
      const res = await apiRequest<{
        data: { role: string; user: { id: string; email: string | null }; rooms: RoomItem[] };
      }>("/api/chats/rooms", { fallbackMessage: "Không thể tải dữ liệu chat" });
      setRole(res.data.role || "user");
      setUser(res.data.user || null);
      setRooms(res.data.rooms || []);
    } catch {
      setRooms([]);
    }
  };

  // Debounce 800ms — tránh gọi liên tục khi Supabase realtime fire nhiều event
  const debouncedFetch = () => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => { void fetchRooms(); }, 800);
  };

  useEffect(() => { void fetchRooms(); }, []);

  // ── Realtime: CHỈ lắng nghe chat_reads + chat_rooms ──
  // Không lắng nghe chat_messages để tránh vòng lặp:
  //   AI insert message → fetchRooms → re-render → AI insert lại → ...
  // Last message preview sẽ được cập nhật lần sau khi user mở lại widget
  useEffect(() => {
    const channel = supabase
      .channel("chat-widget-room-events")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_reads" }, debouncedFetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_rooms" }, debouncedFetch)
      .subscribe();
    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
      void supabase.removeChannel(channel);
    };
  }, []);

  // ── Đánh dấu đã đọc khi chọn room ──
  useEffect(() => {
    if (!user || !open || !selectedRoom) return;
    apiRequest("/api/chats/read", {
      method: "POST",
      body: JSON.stringify({ roomId: selectedRoom }),
    })
      .then(() => setRooms((prev) =>
        prev.map((r) => r.room_id === selectedRoom ? { ...r, unread: 0 } : r)
      ))
      .catch(() => {});
  }, [open, selectedRoom, user]);

  // ── Refresh last_message khi đóng room (để preview cập nhật) ──
  useEffect(() => {
    if (!selectedRoom) void fetchRooms();
  }, [selectedRoom]);

  // Fallback rooms khi chưa load xong
  const displayRooms: RoomItem[] = rooms.length ? rooms : [
    { room_id: PUBLIC_ROOM_ID, type: "public",  display_name: "Phòng chung", avatar_url: PUBLIC_AVATAR,  unread: 0, last_message: "", last_message_time: null },
    { room_id: "__support__",  type: "private", display_name: "Hỗ trợ",      avatar_url: SUPPORT_AVATAR, unread: 0, last_message: "", last_message_time: null },
    { room_id: "__ai__",       type: "ai_bot",  display_name: "Trợ lý AI",   avatar_url: AI_AVATAR,      unread: 0, last_message: "", last_message_time: null },
  ];

  const totalUnread      = displayRooms.reduce((s, r) => s + (r.unread || 0), 0);
  const selectedRoomData = displayRooms.find((r) => r.room_id === selectedRoom);
  const { avatar, name, subtitle } = getRoomMeta(selectedRoomData);

  const closeWidget = () => { setOpen(false); setSelectedRoom(null); };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-[70px] z-40">

      {/* ── Floating button ── */}
      {!open && (
        <button onClick={() => setOpen(true)} className="relative group">
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-[2px] rounded-full shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all duration-300">
            <div className="bg-black rounded-full p-4 group-hover:bg-neutral-950 transition-colors">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          {totalUnread > 0 && role !== "admin" && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-pink-500 text-white text-xs font-semibold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5 shadow-lg animate-pulse">
              {totalUnread}
            </span>
          )}
        </button>
      )}

      {/* ── Chat window ── */}
      {open && (
        <div className="bg-black border border-neutral-800 rounded-3xl shadow-2xl w-[calc(100vw-2rem)] max-w-[380px] h-[600px] max-h-[calc(100vh-10rem)] flex flex-col overflow-hidden">

          {/* ── Room list ── */}
          {!selectedRoom && (
            <div className="flex flex-col h-full">
              <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-semibold text-white text-base">
                    {role === "admin" ? "Quản trị chat" : "Tin nhắn"}
                  </h2>
                </div>
                <button onClick={closeWidget} className="w-8 h-8 rounded-full hover:bg-neutral-900 flex items-center justify-center transition-colors text-neutral-400 hover:text-white" aria-label="Đóng">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {role === "admin" ? (
                  <div className="p-4"><ChatAdminPanel /></div>
                ) : (
                  <div className="py-2">
                    {displayRooms.map((room) => (
                      <button
                        key={room.room_id}
                        onClick={() => setSelectedRoom(room.room_id)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-neutral-950 transition-colors"
                      >
                        <div className="relative flex-shrink-0">
                          {room.unread > 0 ? (
                            <div className="p-[2px] rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                              <img src={room.avatar_url || "/default-avatar.png"} alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-black" />
                            </div>
                          ) : (
                            <img src={room.avatar_url || "/default-avatar.png"} alt="avatar" className="w-14 h-14 rounded-full object-cover" />
                          )}
                          {room.type === "ai_bot" && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-purple-600 rounded-full border-2 border-black flex items-center justify-center">
                              <Bot className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`font-medium text-sm ${room.unread > 0 ? "text-white" : "text-neutral-300"}`}>
                              {room.display_name}
                            </p>
                            <span className="text-[11px] text-neutral-500">
                              {formatRelativeTime(room.last_message_time)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`text-xs truncate ${room.unread > 0 ? "text-white font-medium" : "text-neutral-500"}`}>
                              {room.last_message?.trim() || getPlaceholder(room.type)}
                            </p>
                            {room.unread > 0 && (
                              <span className="ml-2 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                                {room.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Chat view ── */}
          {selectedRoom && (
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedRoom(null)} className="w-8 h-8 rounded-full hover:bg-neutral-900 flex items-center justify-center transition-colors text-neutral-400 hover:text-white" aria-label="Quay lại">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <img src={avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                    {selectedRoomData?.type === "ai_bot" && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-purple-600 rounded-full border-2 border-black flex items-center justify-center">
                        <Bot className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{name}</p>
                    <p className="text-[11px] text-neutral-500">{subtitle}</p>
                  </div>
                </div>
                <button onClick={closeWidget} className="w-8 h-8 rounded-full hover:bg-neutral-900 flex items-center justify-center transition-colors text-neutral-400 hover:text-white" aria-label="Đóng">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 min-h-0">
                {selectedRoomData?.type === "ai_bot" ? (
                  <AiBotBox key={selectedRoom} roomId={selectedRoom} />
                ) : (
                  <ChatBox
                    key={selectedRoom}
                    roomId={selectedRoom}
                    isPrivate={selectedRoomData?.type === "private"}
                  />
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}