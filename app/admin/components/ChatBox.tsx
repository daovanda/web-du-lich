"use client";

import { useEffect, useRef, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";

type ChatBoxProps = {
  roomId: string;
  isPrivate?: boolean;
};

type Profile = {
  username: string | null;
  avatar_url: string | null;
};

type ChatMessage = {
  id: string;
  content: string;
  sender_id: string;
  from_admin: boolean;
  created_at: string; // ISO
  profiles?: Profile | null;
};

export default function ChatBox({ roomId, isPrivate = false }: ChatBoxProps) {
  const supabase = useSupabase();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [oldestCursorAt, setOldestCursorAt] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUser(user);
    })();
  }, [supabase]);

  const isNearBottom = (thresholdPx = 80): boolean => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom <= thresholdPx;
  };

  const scrollToBottom = (smooth = true) => {
    if (smooth) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      messagesEndRef.current?.scrollIntoView();
    }
  };

  const SELECT_COLUMNS =
    "id, content, sender_id, from_admin, created_at, profiles ( username, avatar_url )";

  // Load latest 10 messages
  const loadInitialMessages = async () => {
    setLoadingInitial(true);
    const { data, error } = await supabase
      .from("chat_messages")
      .select(SELECT_COLUMNS)
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(10);

    if (!error && data) 
    {
      const orderedOldestFirst = [...data].reverse() as ChatMessage[];
      setMessages(orderedOldestFirst);
      if (orderedOldestFirst.length > 0) {
        setOldestCursorAt(orderedOldestFirst[0].created_at);
      } else {
        setOldestCursorAt(null);
      }
      setHasMore(data.length === 10);
      // Only auto-scroll if near bottom (initial mount counts as near-bottom)
      setTimeout(() => scrollToBottom(false), 0);
    }
    setLoadingInitial(false);
  };

  // Load older messages
  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || !oldestCursorAt) return;
    setLoadingMore(true);

    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;

    const { data, error } = await supabase
      .from("chat_messages")
      .select(SELECT_COLUMNS)
      .eq("room_id", roomId)
      .lt("created_at", oldestCursorAt)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(10);

    if (!error && data) {
      const olderOrderedOldestFirst = [...data].reverse() as ChatMessage[];
      setMessages((prev) => [...olderOrderedOldestFirst, ...prev]);
      if (olderOrderedOldestFirst.length > 0) {
        setOldestCursorAt(olderOrderedOldestFirst[0].created_at);
      }
      if (data.length < 10) setHasMore(false);

      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }
      }, 0);
    }

    setLoadingMore(false);
  };

  const fetchMessageById = async (id: string): Promise<ChatMessage | null> => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select(SELECT_COLUMNS)
      .eq("id", id)
      .single();
    if (error) return null;
    return data as unknown as ChatMessage;
  };

  // Realtime new messages
  useEffect(() => {
    loadInitialMessages();

    const channel = supabase
      .channel(`chat-room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const shouldStickToBottom = isNearBottom();

          const fullMessage = await fetchMessageById(payload.new.id);
          if (!fullMessage) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === fullMessage.id)) return prev;
            return [...prev, fullMessage];
          });

          if (shouldStickToBottom) setTimeout(() => scrollToBottom(), 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabase]);

  // Infinite scroll: load older when reaching top
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0) {
        void loadMoreMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [oldestCursorAt, hasMore, loadingMore]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const wasNearBottom = isNearBottom();

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        room_id: roomId,
        sender_id: user.id,
        content: input,
        from_admin: user.user_metadata?.role === "admin" || false,
      })
      .select(SELECT_COLUMNS)
      .single();

    if (!error && data) {
      setMessages((prev) => [...prev, data as unknown as ChatMessage]);
      setInput("");
      if (wasNearBottom) setTimeout(() => scrollToBottom(), 0);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-3 min-h-0"
      >
        {loadingInitial && (
          <div className="flex justify-center items-center py-2">
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {messages.length === 0 && !loadingInitial && (
          <p className="text-gray-500 text-sm text-center">Chưa có tin nhắn nào</p>
        )}

        {messages.map((msg) => {
          const isMine =
            (!isPrivate && msg.sender_id === user?.id) ||
            (isPrivate && msg.from_admin && user?.user_metadata?.role === "admin") ||
            (isPrivate && !msg.from_admin && msg.sender_id === user?.id);

        const senderName = msg.profiles?.username || "Người dùng";
        const avatarUrl = msg.profiles?.avatar_url || null;

          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              {!isMine && (
                <span className="text-xs text-gray-400 mb-1 ml-1">{senderName}</span>
              )}
              <div className={`flex items-end space-x-2 ${isMine ? "justify-end space-x-reverse" : "justify-start"}`}>
                {!isMine && (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm overflow-hidden">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt={senderName} className="w-full h-full object-cover" />
                    ) : (
                      senderName.charAt(0).toUpperCase()
                    )}
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[70%] break-words ${
                    isMine ? "bg-indigo-600 text-white rounded-br-none" : "bg-gray-800 text-gray-100 rounded-bl-none"
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

      <div className="p-3 border-t border-gray-700 flex space-x-2">
        <textarea
          rows={1}
          className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none resize-none overflow-y-auto scrollbar-hide max-h-32"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void sendMessage();
            }
          }}
        />
        <button onClick={sendMessage} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
          Gửi
        </button>
      </div>
    </div>
  );
}
