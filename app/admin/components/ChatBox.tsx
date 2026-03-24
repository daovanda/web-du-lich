"use client";

import { useEffect, useRef, useState, FC } from "react";
import { apiRequest } from "@/lib/apiClient";
import { supabase } from "@/lib/supabase";
import ChatMessages from "./ChatBox/ChatMessages";
import ChatInput from "./ChatBox/ChatInput";

type ChatBoxProps = {
  roomId: string;
  isPrivate?: boolean;
};

const ChatBox: FC<ChatBoxProps> = ({ roomId, isPrivate = false }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); 
  const [initialLoading, setInitialLoading] = useState(true);
  const [oldestMessageTime, setOldestMessageTime] = useState<string | null>(null);
  const [latestMessageTime, setLatestMessageTime] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authResolved, setAuthResolved] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const latestMessageTimeRef = useRef<string | null>(null);
  const userRef = useRef<any>(null);

  // 🧩 Lấy user hiện tại
  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest<{
          data: {
            user: { id: string; email: string | null } | null;
            profile: { role?: string | null; username?: string | null; avatar_url?: string | null } | null;
          };
        }>("/api/auth/me");
        if (res.data.user) {
          setUser({
            ...res.data.user,
            role: res.data.profile?.role || "user",
            profile: res.data.profile || null,
          });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setAuthResolved(true);
      }
    })();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🧩 Đánh dấu đã đọc
  const markAsRead = async () => {
    if (!user) return;
    try {
      await apiRequest("/api/chats/read", {
        method: "POST",
        body: JSON.stringify({ roomId }),
      });
    } catch {
      // ignore read errors
    }
  };

  useEffect(() => {
    latestMessageTimeRef.current = latestMessageTime;
  }, [latestMessageTime]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const getMessagesEndpoint = () =>
    isPrivate
      ? `/api/chats/private?room_id=${encodeURIComponent(roomId)}`
      : "/api/chats/public";

  // 🧩 Load 10 tin nhắn mới nhất
  const loadInitialMessages = async () => {
    setInitialLoading(true);
    try {
      const res = await apiRequest<{ data: any[] }>(
        `${getMessagesEndpoint()}&limit=20`.replace("?&", "?")
      );
      const initial = res.data || [];
      setMessages(initial);
      setOldestMessageTime(initial[0]?.created_at || null);
      setLatestMessageTime(initial[initial.length - 1]?.created_at || null);
      setHasMore(initial.length >= 20);
      setTimeout(() => {
        scrollToBottom();
        void markAsRead();
      }, 100);
    } catch {
      setMessages([]);
      setHasMore(false);
    } finally {
      setInitialLoading(false);
    }
  };

  // 🧩 Load thêm tin nhắn cũ
  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || !oldestMessageTime) return;
    setLoadingMore(true);

    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;

    try {
      const res = await apiRequest<{ data: any[] }>(
        `${getMessagesEndpoint()}&limit=20&before=${encodeURIComponent(oldestMessageTime)}`.replace(
          "?&",
          "?"
        )
      );
      const older = res.data || [];
      if (older.length > 0) {
        setMessages((prev) => [...older, ...prev]);
        setOldestMessageTime(older[0]?.created_at || oldestMessageTime);
      }
      if (older.length < 20) setHasMore(false);
      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }
      }, 50);
    } finally {
      setLoadingMore(false);
    }
  };

  const syncNewMessages = async () => {
    const latest = latestMessageTimeRef.current;
    if (!latest) return;
    try {
      const res = await apiRequest<{ data: any[] }>(
        `${getMessagesEndpoint()}&limit=50&since=${encodeURIComponent(latest)}`.replace(
          "?&",
          "?"
        )
      );
      const next = res.data || [];
      if (next.length === 0) return;
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        for (const m of next) {
          if (!ids.has(m.id)) merged.push(m);
        }
        return merged;
      });
      setLatestMessageTime(next[next.length - 1]?.created_at || latest);
      const hasFromOthers = next.some((m) => m.sender_id !== userRef.current?.id);
      if (hasFromOthers) {
        void markAsRead();
      }
      setTimeout(scrollToBottom, 100);
    } catch {
      // ignore polling errors
    }
  };

  useEffect(() => {
    void loadInitialMessages();
  }, [roomId, isPrivate]);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`chat-messages-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          if (!latestMessageTimeRef.current) {
            void loadInitialMessages();
            return;
          }
          void syncNewMessages();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [roomId, isPrivate]);

  // 🧩 Scroll để load thêm
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (container.scrollTop === 0) loadMoreMessages();
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [oldestMessageTime, hasMore, loadingMore]);

  // 🧩 Gửi tin nhắn
  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    try {
      const endpoint = isPrivate ? "/api/chats/private" : "/api/chats/public";
      const payload = isPrivate ? { room_id: roomId, content: input } : { content: input };
      const res = await apiRequest<{ data: any }>(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = res.data;
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setLatestMessageTime(data.created_at || latestMessageTime);
      if (!oldestMessageTime) setOldestMessageTime(data.created_at || null);
      setInput("");
      setTimeout(() => {
        scrollToBottom();
        void markAsRead();
      }, 100);
    } catch {
      // ignore send error in this pass
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
        initialLoading={initialLoading}
      />

      {isPrivate && !user && authResolved ? (
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