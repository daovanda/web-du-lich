"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, ArrowLeft } from "lucide-react";
import ChatBox from "./ChatBox";
import ChatAdminPanel from "./ChatAdminPanel";
import { useSupabase } from "@/components/SupabaseProvider";

export default function ChatWidget() {
  const supabase = useSupabase();
  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [privateRoomId, setPrivateRoomId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>("user");

  const [unreadPublic, setUnreadPublic] = useState(0);
  const [unreadPrivate, setUnreadPrivate] = useState(0);

  // Preview tin nhắn gần nhất
  const [lastPublicMsg, setLastPublicMsg] = useState<string>("");
  const [lastPrivateMsg, setLastPrivateMsg] = useState<string>("");

  // Thời điểm tin nhắn gần nhất
  const [lastPublicTime, setLastPublicTime] = useState<string | null>(null);
  const [lastPrivateTime, setLastPrivateTime] = useState<string | null>(null);

  const PUBLIC_ROOM_ID = "00000000-0000-0000-0000-000000000001";
  const PUBLIC_AVATAR_URL = "/group-chat.png";

  // Helper: Thời gian tương đối dạng Messenger
  const formatRelativeTime = (iso?: string | null) => {
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

  // Tick mỗi 60s để cập nhật label thời gian tương đối
  const [nowTick, setNowTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNowTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // Lấy user hiện tại + role
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

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role || user.user_metadata?.role || "user");
    })();
  }, [supabase]);

  // Tự động lấy hoặc tạo phòng riêng
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

  // Lấy last message + time cho Public
  useEffect(() => {
    const fetchLastPublic = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("content, created_at")
        .eq("room_id", PUBLIC_ROOM_ID)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setLastPublicMsg(data?.content || "");
      setLastPublicTime(data?.created_at || null);
    };
    fetchLastPublic();
  }, [supabase]);

  // Lấy last message + time cho Private
  useEffect(() => {
    if (!privateRoomId) return;
    const fetchLastPrivate = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("content, created_at")
        .eq("room_id", privateRoomId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setLastPrivateMsg(data?.content || "");
      setLastPrivateTime(data?.created_at || null);
    };
    fetchLastPrivate();
  }, [privateRoomId, supabase]);

  // Hàm lấy số tin chưa đọc
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

  // Đánh dấu đã đọc khi mở
  useEffect(() => {
    if (!user || !open || !selectedRoom) return;

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

    markAsRead(selectedRoom);
    
    if (selectedRoom === PUBLIC_ROOM_ID) {
      setUnreadPublic(0);
    } else if (selectedRoom === privateRoomId) {
      setUnreadPrivate(0);
    }
  }, [open, selectedRoom, user, privateRoomId, supabase]);

  // Realtime
  useEffect(() => {
    if (!user) return;

    const handleNewMessage = async (roomId: string, senderId: string, content: string, createdAt: string) => {
      if (senderId === user.id) return;

      if (roomId === PUBLIC_ROOM_ID) {
        if (!open || selectedRoom !== PUBLIC_ROOM_ID) {
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
        setLastPublicMsg(content || "");
        setLastPublicTime(createdAt || null);
      } else if (roomId === privateRoomId) {
        if (!open || selectedRoom !== privateRoomId) {
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
        setLastPrivateMsg(content || "");
        setLastPrivateTime(createdAt || null);
      }
    };

    const channel = supabase
      .channel("realtime-chats")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) =>
          handleNewMessage(
            payload.new.room_id,
            payload.new.sender_id,
            payload.new.content,
            payload.new.created_at
          )
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, privateRoomId, open, selectedRoom, supabase]);

  const SUPPORT_PLACEHOLDER_ID = "__support__";

  // Tạo danh sách phòng chat cho user
  const userRooms = [
    {
      room_id: PUBLIC_ROOM_ID,
      display_name: "Phòng chung",
      avatar_url: PUBLIC_AVATAR_URL,
      unread: unreadPublic,
      type: "public",
      last_message: lastPublicMsg,
      last_time: lastPublicTime
    },
    {
      room_id: privateRoomId || SUPPORT_PLACEHOLDER_ID,
      display_name: "Hỗ trợ",
      avatar_url: "/support-avatar.png",
      unread: privateRoomId ? unreadPrivate : 0,
      type: "private",
      last_message: privateRoomId ? lastPrivateMsg : "",
      last_time: privateRoomId ? lastPrivateTime : null
    }
  ];

  return (
    // ✅ Responsive positioning: bottom-20 on mobile, bottom-6 on desktop
    // ✅ Desktop: right-[220px] to avoid overlapping with right sidebar
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-[70px] z-40">
      {!open ? (
        // Floating button - Instagram style
        <button
          onClick={() => setOpen(true)}
          className="relative group"
        >
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-[2px] rounded-full shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all duration-300">
            <div className="bg-black rounded-full p-4 group-hover:bg-neutral-950 transition-colors">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          {(unreadPublic > 0 || unreadPrivate > 0) && role !== "admin" && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-pink-500 text-white text-xs font-semibold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5 shadow-lg animate-pulse">
              {unreadPublic + unreadPrivate}
            </span>
          )}
        </button>
      ) : (
        // Chat window - Instagram dark mode style
        // ✅ Responsive width: full width on small mobile, 380px on larger screens
        <div className="bg-black border border-neutral-800 rounded-3xl shadow-2xl w-[calc(100vw-2rem)] max-w-[380px] h-[600px] max-h-[calc(100vh-10rem)] flex flex-col overflow-hidden">
          {!selectedRoom ? (
            // Room list
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-semibold text-white text-base">
                    {role === "admin" ? "Quản trị chat" : "Tin nhắn"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    setSelectedRoom(null);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-neutral-900 flex items-center justify-center transition-colors text-neutral-400 hover:text-white"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Room list */}
              <div className="flex-1 overflow-y-auto">
                {role === "admin" ? (
                  <div className="p-4">
                    <ChatAdminPanel />
                  </div>
                ) : (
                  <div className="py-2">
                    {userRooms.map((room, idx) => (
                      <button
                        key={room.room_id}
                        onClick={() => setSelectedRoom(room.room_id)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-neutral-950 transition-colors group"
                      >
                        {/* Avatar with gradient ring if unread */}
                        <div className="relative flex-shrink-0">
                          {room.unread > 0 ? (
                            <div className="p-[2px] rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                              <img
                                src={room.avatar_url || "/default-avatar.png"}
                                alt="avatar"
                                className="w-14 h-14 rounded-full object-cover border-2 border-black"
                              />
                            </div>
                          ) : (
                            <img
                              src={room.avatar_url || "/default-avatar.png"}
                              alt="avatar"
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          )}
                        </div>

                        {/* Message preview */}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`font-medium text-sm ${room.unread > 0 ? 'text-white' : 'text-neutral-300'}`}>
                              {room.display_name}
                            </p>
                            <span className="text-[11px] text-neutral-500">
                              {formatRelativeTime(room.last_time)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`text-xs truncate ${room.unread > 0 ? 'text-white font-medium' : 'text-neutral-500'}`}>
                              {room.last_message?.trim()
                                ? room.last_message
                                : (room.type === "public" ? "Thảo luận chung" : "Hỗ trợ trực tiếp")}
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
          ) : (
            // Chat interface
            <div className="flex flex-col h-full">
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="w-8 h-8 rounded-full hover:bg-neutral-900 flex items-center justify-center transition-colors text-neutral-400 hover:text-white"
                    aria-label="Quay lại"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img
                    src={
                      selectedRoom === PUBLIC_ROOM_ID 
                        ? PUBLIC_AVATAR_URL 
                        : "/support-avatar.png"
                    }
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {selectedRoom === PUBLIC_ROOM_ID ? "Phòng chung" : "Hỗ trợ"}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {selectedRoom === PUBLIC_ROOM_ID ? "Cộng đồng" : "Luôn sẵn sàng"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    setSelectedRoom(null);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-neutral-900 flex items-center justify-center transition-colors text-neutral-400 hover:text-white"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat messages */}
              <div className="flex-1 min-h-0">
                <ChatBox 
                  roomId={selectedRoom} 
                  isPrivate={selectedRoom !== PUBLIC_ROOM_ID} 
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}