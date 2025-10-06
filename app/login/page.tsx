"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ResizableLayout from "@/components/ResizableLayout";
import { useSupabase } from "@/components/SupabaseProvider"; // ✅ dùng client chung với middleware

export default function LoginPage() {
  const supabase = useSupabase(); // ✅ lấy supabase client từ provider
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 🔹 Đăng nhập bằng email + password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      // 🔹 Lấy role trong bảng profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }

    setLoading(false);
  };

  // 🔹 Đăng nhập OAuth (Google, Facebook, Apple)
  const handleOAuthLogin = async (provider: "google" | "facebook" | "apple") => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <ResizableLayout>
      <div className="flex flex-col min-h-screen bg-black text-white">
        <div className="flex-grow flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-md bg-gray-900 p-6 sm:p-8 rounded-lg shadow-lg border border-gray-700">
            <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
              Đăng nhập
            </h1>

            {error && (
              <div className="mb-4 text-red-400 text-sm text-center">{error}</div>
            )}

            <form onSubmit={handleLogin}>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                className="w-full border border-gray-700 px-3 py-2 rounded-lg bg-gray-900 focus:outline-none focus:border-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Nhập email của bạn"
              />

              <label className="block text-sm font-semibold mb-2 mt-4">
                Mật khẩu
              </label>
              <div className="relative mb-6">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border border-gray-700 px-3 py-2 rounded-lg bg-gray-900 focus:outline-none focus:border-gray-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50 mb-4 transition duration-200"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-900 px-2 text-gray-400">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleOAuthLogin("google")}
                className="flex items-center justify-center bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                disabled={loading}
              >
                <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
                Google
              </button>
              <button
                onClick={() => handleOAuthLogin("facebook")}
                className="flex items-center justify-center bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                disabled={loading}
              >
                <img src="/facebook-icon.svg" alt="Facebook" className="w-5 h-5 mr-2" />
                Facebook
              </button>
              <button
                onClick={() => handleOAuthLogin("apple")}
                className="flex items-center justify-center bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                disabled={loading}
              >
                <img src="/apple-icon.svg" alt="Apple" className="w-5 h-5 mr-2" />
                Apple
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-400">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-blue-400 hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </ResizableLayout>
  );
}
