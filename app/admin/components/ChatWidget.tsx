"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatBox from "./ChatBox";
import { useSupabase } from "@/components/SupabaseProvider";

export default function ChatWidget() {
  const supabase = useSupabase();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"public" | "private">("public");
  const [privateRoomId, setPrivateRoomId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const PUBLIC_ROOM_ID = "00000000-0000-0000-0000-000000000001";

  // 🧩 Lấy user hiện tại
  useEffect(() => {
    (async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user) setUser(user);
      else setUser(null);
    })();
  }, [supabase]);

  // 🧩 Tự động lấy hoặc tạo phòng riêng (private room)
  useEffect(() => {
    const fetchOrCreatePrivateRoom = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("chat_rooms")
          .select("id")
          .eq("type", "private")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          setPrivateRoomId(data.id);
          return;
        }

        // Nếu chưa có thì tạo mới
        const { data: newRoom, error: insertErr } = await supabase
          .from("chat_rooms")
          .insert({ type: "private", user_id: user.id })
          .select("id")
          .single();

        if (!insertErr && newRoom) {
          setPrivateRoomId(newRoom.id);
        } else if (insertErr) {
          console.error("Lỗi tạo private room:", insertErr);
        }
      } catch (e) {
        console.error("fetchOrCreatePrivateRoom exception:", e);
      }
    };

    fetchOrCreatePrivateRoom();
  }, [user, supabase]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="bg-gray-900 text-white rounded-2xl shadow-lg w-80 h-96 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <div className="flex space-x-3">
              <button
                onClick={() => setTab("public")}
                className={`text-sm font-medium ${
                  tab === "public" ? "text-indigo-400" : "text-gray-400"
                }`}
              >
                Chung
              </button>
              <button
                onClick={() => setTab("private")}
                className={`text-sm font-medium ${
                  tab === "private" ? "text-indigo-400" : "text-gray-400"
                }`}
              >
                Hỗ trợ
              </button>
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Nội dung chat */}
          <div className="flex-1 min-h-0">
            {tab === "public" ? (
              <ChatBox roomId={PUBLIC_ROOM_ID} isPrivate={false} />
            ) : (
              privateRoomId && (
                <ChatBox roomId={privateRoomId} isPrivate={true} />
              )
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-full shadow-lg"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
