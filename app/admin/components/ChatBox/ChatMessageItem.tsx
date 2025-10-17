export default function ChatMessageItem({ msg, user, isPrivate }: any) {
  const isMine =
    (!isPrivate && msg.sender_id === user?.id) ||
    (isPrivate &&
      msg.from_admin &&
      user?.user_metadata?.role === "admin") ||
    (isPrivate && !msg.from_admin && msg.sender_id === user?.id);

  const senderName = msg.profiles?.username || "Người dùng";
  const avatarUrl = msg.profiles?.avatar_url;

  return (
    <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
      {!isMine && (
        <span className="text-xs text-gray-400 mb-1 ml-1">{senderName}</span>
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
}
