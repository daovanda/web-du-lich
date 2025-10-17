import ChatMessageItem from "./ChatMessageItem";

export default function ChatMessages({
  messages,
  user,
  isPrivate,
  messagesContainerRef,
  messagesEndRef,
  loadingMore,
}: any) {
  if (!messages) return null; // tránh lỗi khi messages chưa load

  return (
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

      {messages.map((msg: any) => (
        <ChatMessageItem
          key={msg.id}
          msg={msg}
          user={user}
          isPrivate={isPrivate}
        />
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
}
