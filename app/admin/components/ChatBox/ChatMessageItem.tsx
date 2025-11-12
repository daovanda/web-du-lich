export default function ChatMessageItem({ msg, user, isPrivate }: any) {
  const isMine =
    (!isPrivate && msg.sender_id === user?.id) ||
    (isPrivate && msg.from_admin && user?.user_metadata?.role === "admin") ||
    (isPrivate && !msg.from_admin && msg.sender_id === user?.id);

  const senderName = msg.profiles?.username || "Người dùng";
  const avatarUrl = msg.profiles?.avatar_url;

  // Sanitization: loại bỏ các ký tự vô hình / đặc biệt
  const sanitizeContent = (s?: string) => {
    if (!s) return "";
    return s
      .replace(/\u200B|\u200C|\u200D|\uFEFF/g, "") // zero-width spaces, ZWNJ, ZWJ, BOM
      .replace(/\u2028|\u2029/g, "\n") // line/paragraph separator -> chuẩn hoá thành \n
      .replace(/\r\n/g, "\n") // chuẩn hoá CRLF -> LF
      .replace(/\t/g, "    "); // thay tab bằng 4 spaces
  };

  const content = sanitizeContent(msg.content);

  // Format time
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div
      className={`flex items-end gap-2 ${
        isMine ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar - only for others */}
      {!isMine && (
        <div className="w-7 h-7 flex-shrink-0 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={senderName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-neutral-400 font-medium">
              {senderName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`flex flex-col max-w-[75%] ${
          isMine ? "items-end" : "items-start"
        }`}
      >
        {/* Username + admin badge (only for others) */}
        {!isMine && (
          <div className="flex items-center gap-1 mb-1 px-3">
            <span className="text-[10px] font-medium text-neutral-500">
              {senderName}
            </span>
            {msg.from_admin && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium border border-blue-500/30">
                Admin
              </span>
            )}
          </div>
        )}

        {/* Message content with hover time */}
        <div className="group relative">
          <div
            className={`px-4 py-2.5 rounded-2xl ${
              isMine
                ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white rounded-br-md shadow-lg shadow-purple-500/20"
                : "bg-neutral-900 border border-neutral-800 text-white rounded-bl-md"
            }`}
          >
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {content}
            </p>
          </div>

          {/* Time tooltip on hover */}
          <div
            className={`absolute -bottom-5 text-[10px] text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity ${
              isMine ? "right-0" : "left-0"
            }`}
          >
            {formatTime(msg.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}