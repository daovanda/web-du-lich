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

  return (
    <div className="flex flex-col h-full">
      <ChatMessages
        messages={messages}
        user={user}
        isPrivate={isPrivate}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
        loadingMore={loadingMore}
      />
      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
      />
    </div>
  );
};

export default ChatBox;