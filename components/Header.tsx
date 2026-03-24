"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/apiClient";

type AuthUser = {
  id: string;
  email: string | null;
};

export default function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getMe = async () => {
      try {
        const response = await apiRequest<{ data: { user: AuthUser | null } }>("/api/auth/me", {
          fallbackMessage: "Không thể tải thông tin người dùng",
        });
        setUser(response.data.user);
      } catch {
        setUser(null);
      }
    };
    getMe();
  }, []);

  const handleSignOut = async () => {
    try {
      await apiRequest<{ success: boolean }>("/api/auth/logout", {
        method: "POST",
        fallbackMessage: "Đăng xuất thất bại",
      });
    } finally {
      setUser(null);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <h1 className="text-xl font-bold text-blue-600">Travel Việt Nam</h1>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/stay" // Sửa từ /services/stay thành /stay
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base"
          >
            Chỗ ở
          </Link>
          <Link
            href="/car" // Sửa từ /services/car thành /car
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base"
          >
            Xe di chuyển
          </Link>
          <Link
            href="/motorbike" // Sửa từ /services/motorbike thành /motorbike
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base"
          >
            Thuê xe máy
          </Link>
          {user ? (
            <>
              <span className="text-sm text-gray-700">
                Xin chào, {user.email}
              </span>
              <Link
                href="/profile"
                className="text-sm text-gray-700 hover:text-blue-600"
              >
                Hồ sơ
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-700 hover:text-blue-600"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-700 hover:text-blue-600"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="text-sm text-gray-700 hover:text-blue-600"
              >
                Đăng ký
              </Link>
            </>
          )}
        </nav>
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>
      {isMenuOpen && (
        <nav className="md:hidden bg-white px-4 py-2 border-t">
          <div className="flex flex-col gap-3">
            <Link
              href="/stay" // Sửa từ /services/stay thành /stay
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Chỗ ở
            </Link>
            <Link
              href="/car" // Sửa từ /services/car thành /car
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Xe di chuyển
            </Link>
            <Link
              href="/motorbike" // Sửa từ /services/motorbike thành /motorbike
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Thuê xe máy
            </Link>
            {user ? (
              <>
                <span className="text-sm text-gray-700">
                  Xin chào, {user.email}
                </span>
                <Link
                  href="/profile"
                  className="text-sm text-gray-700 hover:text-blue-600 text-left"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hồ sơ
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-700 hover:text-blue-600 text-left"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="text-sm text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
