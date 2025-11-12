import { Send } from "lucide-react";

export default function ChatInput({ input, setInput, sendMessage }: any) {
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border-t border-neutral-800 p-3 bg-black">
      <div className="flex items-end gap-2">
        {/* Text input */}
        <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-2.5 focus-within:border-neutral-700 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Aa"
            rows={1}
            className="w-full bg-transparent text-white text-sm placeholder-neutral-600 resize-none focus:outline-none max-h-24 overflow-y-auto scrollbar-hide"
            style={{
              minHeight: "20px",
              maxHeight: "96px",
            }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            input.trim()
              ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105"
              : "bg-neutral-900 border border-neutral-800 cursor-not-allowed"
          }`}
        >
          <Send
            className={`w-4 h-4 ${
              input.trim() ? "text-white" : "text-neutral-600"
            }`}
          />
        </button>
      </div>

      {/* Helper text */}
      <p className="text-[10px] text-neutral-600 mt-2 px-1">
        Nhấn Enter để gửi, Shift + Enter để xuống dòng
      </p>
    </div>
  );
}