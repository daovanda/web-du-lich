"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@supabase/auth-helpers-react";

type ChatBoxProps = {
  roomId: string;
  isPrivate?: boolean;
};

export default function ChatBox({ roomId, isPrivate = false }: ChatBoxProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<string | null>(null);
  const user = useUser();

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load 10 tin nhắn mới nhất
  const loadInitialMessages = async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select(
        "id, content, sender_id, from_admin, created_at, profiles ( username, avatar_url )"
      )
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      const reversed = data.reverse();
      setMessages(reversed);
      if (reversed.length > 0) {
        setLastMessageTime(reversed[0].created_at);
      }
      if (data.length < 10) setHasMore(false);

      setTimeout(scrollToBottom, 100);
    }
  };

  // Load thêm 10 tin nhắn cũ
  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || !lastMessageTime) return;
    setLoadingMore(true);

    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;

    const { data, error } = await supabase
      .from("chat_messages")
      .select(
        "id, content, sender_id, from_admin, created_at, profiles ( username, avatar_url )"
      )
      .eq("room_id", roomId)
      .lt("created_at", lastMessageTime)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      const reversed = data.reverse();
      setMessages((prev) => [...reversed, ...prev]);
      if (reversed.length > 0) {
        setLastMessageTime(reversed[0].created_at);
      }
      if (data.length < 10) setHasMore(false);

      // giữ nguyên vị trí scroll sau khi load thêm
      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }
      }, 50);
    }

    setLoadingMore(false);
  };

  // Lắng nghe realtime tin nhắn mới
  useEffect(() => {
    loadInitialMessages();

    const channel = supabase
      .channel("chat-room-" + roomId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Bắt sự kiện scroll để load thêm
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0) {
        loadMoreMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [lastMessageTime, hasMore, loadingMore]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        room_id: roomId,
        sender_id: user.id,
        content: input,
        from_admin: user.user_metadata?.role === "admin" || false,
      })
      .select(
        "id, content, sender_id, from_admin, created_at, profiles ( username, avatar_url )"
      )
      .single();

    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      setInput("");
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-3 min-h-0"
      >
        {loadingMore && (
          <div className="flex justify-center items-center py-2">
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center">
            Chưa có tin nhắn nào
          </p>
        )}

        {messages.map((msg) => {
          const isMine =
            (!isPrivate && msg.sender_id === user?.id) ||
            (isPrivate &&
              msg.from_admin &&
              user?.user_metadata?.role === "admin") ||
            (isPrivate && !msg.from_admin && msg.sender_id === user?.id);

          const senderName = msg.profiles?.username || "Người dùng";
          const avatarUrl = msg.profiles?.avatar_url;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isMine ? "items-end" : "items-start"
              }`}
            >
              {!isMine && (
                <span className="text-xs text-gray-400 mb-1 ml-1">
                  {senderName}
                </span>
              )}
              <div
                className={`flex items-end space-x-2 ${
                  isMine ? "justify-end space-x-reverse" : "justify-start"
                }`}
              >
                {!isMine && (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={senderName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      senderName.charAt(0).toUpperCase()
                    )}
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[70%] break-words ${
                    isMine
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-gray-800 text-gray-100 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700 flex space-x-2">
        <textarea
          rows={1}
          className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 
                    focus:outline-none resize-none overflow-y-auto scrollbar-hide max-h-32"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
