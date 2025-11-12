"use client";

import ChatMessageItem from "./ChatMessageItem";

export default function ChatMessages({
  messages,
  user,
  isPrivate,
  messagesContainerRef,
  messagesEndRef,
  loadingMore,
}: any) {
  if (!messages) return null;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    } else {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return `${day}/${month}`;
    }
  };

  // Group messages by date
  const groupedMessages: { [key: string]: any[] } = {};
  messages.forEach((msg: any) => {
    const dateKey = formatDate(msg.created_at);
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = [];
    }
    groupedMessages[dateKey].push(msg);
  });

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-black scrollbar-hide min-h-0"
    >
      {loadingMore && (
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 rounded-full border border-neutral-800">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "75ms" }}></div>
            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></div>
          </div>
        </div>
      )}

      {messages.length === 0 && !loadingMore && (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-400">
              {isPrivate ? "Bắt đầu cuộc trò chuyện" : "Chưa có tin nhắn nào"}
            </p>
            <p className="text-xs text-neutral-600">
              {isPrivate
                ? "Đội ngũ hỗ trợ sẽ phản hồi bạn sớm nhất"
                : "Hãy là người đầu tiên gửi tin nhắn"}
            </p>
          </div>
        </div>
      )}

      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date} className="space-y-3">
          {/* Date divider */}
          <div className="flex items-center justify-center">
            <div className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full">
              <span className="text-[10px] font-medium text-neutral-500">
                {date}
              </span>
            </div>
          </div>

          {/* Messages for this date */}
          {msgs.map((msg: any) => (
            <ChatMessageItem
              key={msg.id}
              msg={msg}
              user={user}
              isPrivate={isPrivate}
            />
          ))}
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
}