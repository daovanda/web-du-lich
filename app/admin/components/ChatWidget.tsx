"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatBox from "./ChatBox";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"public" | "private">("public");
  const [privateRoomId, setPrivateRoomId] = useState<string | null>(null);
  const user = useUser();

  const PUBLIC_ROOM_ID = "00000000-0000-0000-0000-000000000001";

  useEffect(() => {
    const fetchOrCreatePrivateRoom = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("chat_rooms")
          .select("id")
          .eq("type", "private")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setPrivateRoomId(data.id);
          return;
        }

        // tạo mới nếu chưa có
        const { data: newRoom, error: insertErr } = await supabase
          .from("chat_rooms")
          .insert({ type: "private", user_id: user.id })
          .select("id")
          .single();

        if (!insertErr && newRoom) {
          setPrivateRoomId(newRoom.id);
        } else {
          console.error("Lỗi tạo private room:", insertErr);
        }
      } catch (e) {
        console.error("fetchOrCreatePrivateRoom exception:", e);
      }
    };

    fetchOrCreatePrivateRoom();
  }, [user]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        // LƯU Ý: đặt height cố định ở đây để layout con hoạt động ổn định
        <div className="bg-gray-900 text-white rounded-2xl shadow-lg w-80 h-96 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <div className="flex space-x-3">
              <button
                onClick={() => setTab("public")}
                className={`text-sm font-medium ${tab === "public" ? "text-indigo-400" : "text-gray-400"}`}
              >
                Chung
              </button>
              <button
                onClick={() => setTab("private")}
                className={`text-sm font-medium ${tab === "private" ? "text-indigo-400" : "text-gray-400"}`}
              >
                Hỗ trợ
              </button>
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Chat content */}
          <div className="flex-1 min-h-0"> {/* đảm bảo min-h-0 ở đây */}
            {tab === "public" ? (
              <ChatBox roomId={PUBLIC_ROOM_ID} isPrivate={false} />
            ) : (
              privateRoomId && <ChatBox roomId={privateRoomId} isPrivate={true} />
            )}
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-full shadow-lg">
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
