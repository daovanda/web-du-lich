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

  // Luôn hiển thị phòng Hỗ trợ:
  // - Nếu đã có privateRoomId: dùng id thật, hiển thị preview + time thật.
  // - Nếu chưa có (chưa đăng nhập): tạo entry với id giả "__support__" để vẫn cho người dùng bấm vào.
  const SUPPORT_PLACEHOLDER_ID = "__support__";

  // Tạo danh sách phòng chat cho user (có last_message + last_time)
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
    <div className="fixed bottom-4 right-4 z-50">
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
          {!selectedRoom ? (
            // Danh sách phòng chat
            <div className="flex flex-col h-full bg-gray-900">
              {/* Header với nút đóng */}
              <div className="p-3 font-semibold text-sm flex items-center justify-between bg-gray-900 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {role === "admin" ? "Quản trị chat" : "Phòng chat"}
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    setSelectedRoom(null);
                  }}
                  className="p-1 hover:text-indigo-400 transition-colors"
                  aria-label="Đóng"
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Danh sách phòng */}
              <div className="flex-1 overflow-y-auto bg-gray-900">
                {role === "admin" ? (
                  <ChatAdminPanel />
                ) : (
                  userRooms.map((room) => (
                    <button
                      key={room.room_id}
                      onClick={() => setSelectedRoom(room.room_id)}
                      className="w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-800 transition-colors"
                    >
                      <img
                        src={room.avatar_url || "/default-avatar.png"}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{room.display_name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {room.last_message?.trim()
                            ? room.last_message
                            : (room.type === "public" ? "Thảo luận chung" : "Hỗ trợ trực tiếp")}
                        </p>
                      </div>
                      <div className="ml-2 flex flex-col items-end shrink-0">
                        <span className="text-[10px] text-gray-500">
                          {formatRelativeTime(room.last_time)}
                        </span>
                        {room.unread > 0 && (
                          <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full mt-1">
                            {room.unread}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            // Giao diện chat
            <div className="flex flex-col h-full bg-gray-900">
              {/* Header với nút back + đóng */}
              <div className="p-2 border-b border-gray-800 flex items-center justify-between bg-gray-900">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="p-1 hover:text-indigo-400 transition-colors"
                    aria-label="Quay lại"
                    title="Quay lại"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <img
                    src={
                      selectedRoom === PUBLIC_ROOM_ID 
                        ? PUBLIC_AVATAR_URL 
                        : "/support-avatar.png"
                    }
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="ml-2 font-medium text-sm truncate">
                    {selectedRoom === PUBLIC_ROOM_ID ? "Phòng chung" : "Hỗ trợ"}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    setSelectedRoom(null);
                  }}
                  className="p-1 hover:text-indigo-400 transition-colors"
                  aria-label="Đóng"
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nội dung chat */}
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