"use client";

import { useEffect, useRef, useState, FC } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import ChatMessages from "./ChatBox/ChatMessages";
import ChatInput from "./ChatBox/ChatInput";

type ChatBoxProps = {
  roomId: string;
  isPrivate?: boolean;
};

const ChatBox: FC<ChatBoxProps> = ({ roomId, isPrivate = false }) => {
  const supabase = useSupabase();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 🧩 Lấy user hiện tại
  useEffect(() => {
    (async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!error && user) {
        setUser(user);
      } else {
        setUser(null);
      }
    })();
  }, [supabase]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🧩 Đánh dấu đã đọc
  const markAsRead = async () => {
    if (!user) return;
    await supabase.from("chat_reads").upsert(
      {
        room_id: roomId,
        user_id: user.id,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: "room_id,user_id" }
    );
  };

  // 🧩 Load 10 tin nhắn mới nhất
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
      if (reversed.length > 0) setLastMessageTime(reversed[0].created_at);
      if (data.length < 10) setHasMore(false);

      setTimeout(() => {
        scrollToBottom();
        markAsRead();
      }, 100);
    }
  };

  // 🧩 Load thêm tin nhắn cũ
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
      if (reversed.length > 0) setLastMessageTime(reversed[0].created_at);
      if (data.length < 10) setHasMore(false);

      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }
      }, 50);
    }

    setLoadingMore(false);
  };

  // 🧩 Lắng nghe realtime
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
        async (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          if (payload.new.sender_id !== user?.id) await markAsRead();
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabase, user]);

  // 🧩 Scroll để load thêm
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (container.scrollTop === 0) loadMoreMessages();
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [lastMessageTime, hasMore, loadingMore]);

  // 🧩 Gửi tin nhắn
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
      setTimeout(() => {
        scrollToBottom();
        markAsRead();
      }, 100);
    }
  };

  // 🧩 Focus/click để đánh dấu đã đọc
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleFocus = () => markAsRead();
    container.addEventListener("click", handleFocus);
    window.addEventListener("focus", handleFocus);
    return () => {
      container.removeEventListener("click", handleFocus);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user]);

  // 🧩 Đăng nhập nhanh
  const handleLogin = async () => {
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <ChatMessages
        messages={messages}
        user={user}
        isPrivate={isPrivate}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
        loadingMore={loadingMore}
      />

      {isPrivate && !user ? (
        // Login prompt - Instagram style
        <div className="border-t border-neutral-800 p-4 bg-black">
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-4 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">
                Đăng nhập để nhận hỗ trợ
              </p>
              <p className="text-xs text-neutral-500">
                Kết nối với đội ngũ hỗ trợ 24/7
              </p>
            </div>
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] transition-all duration-300"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      ) : (
        <ChatInput
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
        />
      )}
    </div>
  );
};

export default ChatBox;