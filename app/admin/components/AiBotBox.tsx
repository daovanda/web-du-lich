// components/chat/AiBotBox.tsx
"use client";

import { useEffect, useRef, useState, FC } from "react";
import { apiRequest } from "@/lib/apiClient";
import { supabase } from "@/lib/supabase";
import { Loader2, StopCircle, Send } from "lucide-react";

type Message = {
  id: string;
  sender_id: string | null;
  content: string;
  from_admin: boolean;
  created_at: string;
  profiles?: { username?: string; avatar_url?: string } | null;
  metadata?: { role?: string; source?: string; is_rag?: boolean } | null;
  isStreaming?: boolean;
};

type AiBotBoxProps = { roomId: string };

const STREAMING_ID = "__streaming__";

const AiBotBox: FC<AiBotBoxProps> = ({ roomId }) => {
  const [messages, setMessages]           = useState<Message[]>([]);
  const [input, setInput]                 = useState("");
  const [hasMore, setHasMore]             = useState(true);
  const [loadingMore, setLoadingMore]     = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isGenerating, setIsGenerating]   = useState(false);
  const [oldestTime, setOldestTime]       = useState<string | null>(null);
  const [user, setUser]                   = useState<any>(null);

  const containerRef  = useRef<HTMLDivElement>(null);
  const endRef        = useRef<HTMLDivElement>(null);
  const abortRef      = useRef<AbortController | null>(null);

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: "smooth" });

  // ── Lấy user ──
  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest<{
          data: {
            user: { id: string; email: string | null } | null;
            profile: { username?: string | null; avatar_url?: string | null } | null;
          };
        }>("/api/auth/me");
        setUser(res.data.user ? { ...res.data.user, profile: res.data.profile } : null);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  // ── Load tin nhắn ban đầu ──
  const loadInitial = async () => {
    setInitialLoading(true);
    try {
      const res = await apiRequest<{ data: Message[] }>(
        `/api/chats/ai/messages?room_id=${encodeURIComponent(roomId)}&limit=20`
      );
      const data = res.data ?? [];
      setMessages(data);
      setOldestTime(data[0]?.created_at ?? null);
      setHasMore(data.length >= 20);
      setTimeout(scrollToBottom, 100);
    } catch {
      setMessages([]);
    } finally {
      setInitialLoading(false);
    }
  };

  // ── Load thêm tin nhắn cũ ──
  const loadMore = async () => {
    if (!hasMore || loadingMore || !oldestTime) return;
    setLoadingMore(true);
    const prev = containerRef.current?.scrollHeight ?? 0;
    try {
      const res = await apiRequest<{ data: Message[] }>(
        `/api/chats/ai/messages?room_id=${encodeURIComponent(roomId)}&limit=20&before=${encodeURIComponent(oldestTime)}`
      );
      const older = res.data ?? [];
      if (older.length > 0) {
        setMessages((m) => [...older, ...m]);
        setOldestTime(older[0]?.created_at ?? oldestTime);
      }
      if (older.length < 20) setHasMore(false);
      setTimeout(() => {
        if (containerRef.current)
          containerRef.current.scrollTop = containerRef.current.scrollHeight - prev;
      }, 50);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => { void loadInitial(); }, [roomId]);

  // ── Realtime: nhận message bot sau khi stream xong ──
  useEffect(() => {
    const ch = supabase
      .channel(`ai-bot-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.sender_id === null) {
            setMessages((prev) => {
              const filtered = prev.filter((m) => m.id !== STREAMING_ID);
              if (filtered.some((m) => m.id === msg.id)) return filtered;
              return [...filtered, msg];
            });
          }
        }
      )
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [roomId]);

  // ── Scroll trigger để load thêm ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => { if (el.scrollTop === 0) void loadMore(); };
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, [oldestTime, hasMore, loadingMore]);

  // ── Gửi tin nhắn + stream ──
  const sendMessage = async () => {
    if (!input.trim() || !user || isGenerating) return;

    const text = input.trim();
    setInput("");
    setIsGenerating(true);

    const history = messages
      .filter((m) => !m.isStreaming)
      .slice(-10)
      .map((m) => ({
        role: (m.sender_id !== null ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      }));

    // Optimistic user message
    setMessages((prev) => [
      ...prev,
      {
        id: `opt-${Date.now()}`,
        sender_id: user.id,
        content: text,
        from_admin: false,
        created_at: new Date().toISOString(),
        profiles: user.profile ?? null,
        metadata: { role: "user" },
      },
      // Streaming placeholder
      {
        id: STREAMING_ID,
        sender_id: null,
        content: "",
        from_admin: false,
        created_at: new Date().toISOString(),
        metadata: { role: "assistant", source: "ai_bot" },
        isStreaming: true,
      },
    ]);
    setTimeout(scrollToBottom, 50);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chats/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, roomId, history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") break;
          try {
            const parsed = JSON.parse(raw) as { response?: string };
            if (parsed.response) {
              accumulated += parsed.response;
              setMessages((prev) =>
                prev.map((m) => m.id === STREAMING_ID ? { ...m, content: accumulated } : m)
              );
              scrollToBottom();
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== STREAMING_ID),
        {
          id: `err-${Date.now()}`,
          sender_id: null,
          content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.",
          from_admin: false,
          created_at: new Date().toISOString(),
          metadata: { role: "assistant", source: "ai_bot" },
        },
      ]);
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const stopGenerating = () => {
    abortRef.current?.abort();
    setMessages((prev) => prev.filter((m) => m.id !== STREAMING_ID));
    setIsGenerating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  // ── Render ──
  return (
    <div className="flex flex-col h-full bg-black">

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
        {loadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
          </div>
        )}

        {initialLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Trợ lý AI</p>
            <p className="text-xs text-neutral-500">Hỏi bất cứ điều gì, tôi luôn sẵn sàng hỗ trợ bạn.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender_id !== null;
            return (
              <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white rounded-br-sm"
                    : "bg-neutral-900 text-neutral-100 rounded-bl-sm border border-neutral-800"
                }`}>
                  {msg.content}
                  {msg.isStreaming && msg.content === "" && (
                    <span className="inline-flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-800 p-3 bg-black">
        <div className="flex items-end gap-2 bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-2 focus-within:border-neutral-700 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhắn tin với AI..."
            disabled={isGenerating}
            rows={1}
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-neutral-600 resize-none max-h-24 scrollbar-hide disabled:opacity-50"
            style={{ lineHeight: "1.5" }}
          />
          {isGenerating ? (
            <button
              onClick={stopGenerating}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
              aria-label="Dừng"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => void sendMessage()}
              disabled={!input.trim()}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              aria-label="Gửi"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-[10px] text-neutral-600 text-center mt-1.5">
          AI có thể mắc lỗi. Kiểm tra thông tin quan trọng.
        </p>
      </div>

    </div>
  );
};

export default AiBotBox;