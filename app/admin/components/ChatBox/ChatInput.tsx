export default function ChatInput({ input, setInput, sendMessage }: any) {
  return (
    <div className="p-3 border-t border-gray-700 flex space-x-2">
      <textarea
        rows={1}
        className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 
                    focus:outline-none resize-none overflow-y-auto scrollbar-hide max-h-32"
        placeholder="Nhập tin nhắn..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
      />
      <button
        onClick={sendMessage}
        className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium"
      >
        Gửi
      </button>
    </div>
  );
}
