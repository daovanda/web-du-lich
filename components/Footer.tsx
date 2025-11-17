import Link from "next/link";
// đồnh hành cùng hành trình của bạn
export default function Footer() {
  return (
    <div className="px-3 py-2 text-xs text-gray-500 space-y-1 text-center">
      <p>© 2025 chagmihaydi </p>
      <div className="flex items-center justify-center gap-2">
        <Link 
          href="/about" 
          className="hover:text-gray-300 hover:underline transition-colors"
        >
          Thông tin
        </Link>
        <span>•</span>
        <Link 
          href="/about" 
          className="hover:text-gray-300 hover:underline transition-colors"
        >
          Liên hệ
        </Link>
        <span>•</span>
        <Link 
          href="/privacy" 
          className="hover:text-gray-300 hover:underline transition-colors"
        >
          Chính sách
        </Link>
      </div>
    </div>
  );
}