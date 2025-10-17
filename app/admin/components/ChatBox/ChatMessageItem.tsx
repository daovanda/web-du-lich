// ChatMessageItem.tsx
export default function ChatMessageItem({ msg, user, isPrivate }: any) {
  const isMine =
    (!isPrivate && msg.sender_id === user?.id) ||
    (isPrivate && msg.from_admin && user?.user_metadata?.role === "admin") ||
    (isPrivate && !msg.from_admin && msg.sender_id === user?.id);

  const senderName = msg.profiles?.username || "Người dùng";
  const avatarUrl = msg.profiles?.avatar_url;

  // --- Sanitization: loại bỏ các ký tự vô hình / đặc biệt có thể gây lỗi hiển thị ---
  const sanitizeContent = (s?: string) => {
    if (!s) return "";
    // Loại các zero-width và BOM, và các ký tự separator kỳ lạ.
    // Giữ lại \n để user vẫn có thể xuống dòng.
    return s
      .replace(/\u200B|\u200C|\u200D|\uFEFF/g, "") // zero-width spaces, ZWNJ, ZWJ, BOM
      .replace(/\u2028|\u2029/g, "\n") // line/paragraph separator -> chuẩn hoá thành \n
      .replace(/\r\n/g, "\n") // chuẩn hoá CRLF -> LF
      .replace(/\t/g, "    "); // thay tab bằng 4 spaces (tuỳ ý)
  };

  const content = sanitizeContent(msg.content);

  // --- Debug helper: bật trong dev khi cần để in ra mã ký tự ---
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    // Tùy bạn có muốn bật console log hay không
    console.debug("msg.content raw:", msg.content);
     console.debug("msg.content sanitized:", content);
     console.debug("char codes:", Array.from(content).map((c) => c.charCodeAt(0)));
  }

  return (
    <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
      {!isMine && (
        <span className="text-xs text-gray-400 mb-1 ml-1">{senderName}</span>
      )}

      {/* Hàng chứa avatar + bong bóng */}
      <div
        className={`flex items-end ${isMine ? "justify-end" : "justify-start"} gap-2`}
      >
        {/* Bên trái: avatar nếu không phải tin của tôi */}
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

        {/* Bong bóng */}
        <div
          // dùng block + max-w + self-end để giữ alignment, kèm sanitize content
           className={`block px-4 py-2 rounded-2xl text-sm leading-relaxed not-prose 
              whitespace-pre-wrap break-words ${
              isMine
                ? "bg-indigo-600 text-white rounded-br-none self-end"
                : "bg-gray-800 text-gray-100 rounded-bl-none"
            }`}
            style={{
              maxWidth: "24ch", // ✅ Giới hạn 15 ký tự mỗi dòng
              writingMode: "horizontal-tb",
              textOrientation: "mixed",
              minWidth: 0,
              WebkitFontSmoothing: "antialiased",
            }}
        >
          {content}
        </div>

        {/* Nếu là của tôi, avatar (tuỳ bạn muốn hiện hay không) */}
        {isMine && null}
      </div>
    </div>
  );
}
