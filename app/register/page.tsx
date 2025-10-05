"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ResizableLayout from "@/components/ResizableLayout";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Kiểm tra phiên đăng nhập khi tải trang
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        router.push("/"); // Redirect nếu đã đăng nhập
      }
    };
    checkUser();
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu và nhập lại mật khẩu không khớp");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        if (error.message.includes("Password should be at least")) {
          setError("Mật khẩu phải có ít nhất 6 ký tự");
        } else {
          setError("Đã xảy ra lỗi: " + error.message);
        }
      } else if (data.user) {
        // Kiểm tra identities để xác định email đã tồn tại chưa
        if (data.user.identities && data.user.identities.length === 0) {
          setError("Email này đã được đăng ký");
        } else {
          setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");
          setTimeout(() => router.push("/login"), 2000);
        }
      }
    } catch (err) {
      setError("Lỗi hệ thống, vui lòng thử lại sau");
    }
    setLoading(false);
  };

  const handleOAuthLogin = async (
    provider: "google" | "facebook" | "apple"
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        setError("Lỗi đăng ký với " + provider + ": " + error.message);
      }
    } catch (err) {
      setError("Lỗi hệ thống, vui lòng thử lại sau");
    }
    setLoading(false);
  };

  return (
    <ResizableLayout>
      <div className="flex flex-col min-h-screen bg-black text-white">
        <div className="flex-grow flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-md bg-gray-900 p-6 sm:p-8 rounded-lg shadow-lg border border-gray-700">
            <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
              Đăng ký tài khoản
            </h1>

            {error && (
              <div className="mb-4 text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 text-green-400 text-sm text-center">
                {success}
              </div>
            )}

            <form onSubmit={handleRegister}>
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
              <div className="relative mb-4">
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
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>

              <label className="block text-sm font-semibold mb-2">
                Nhập lại mật khẩu
              </label>
              <div className="relative mb-6">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full border border-gray-700 px-3 py-2 rounded-lg bg-gray-900 focus:outline-none focus:border-gray-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50 mb-4 transition duration-200"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng ký"}
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
                <img
                  src="/google-icon.svg"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Google
              </button>
              <button
                onClick={() => handleOAuthLogin("facebook")}
                className="flex items-center justify-center bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                disabled={loading}
              >
                <img
                  src="/facebook-icon.svg"
                  alt="Facebook"
                  className="w-5 h-5 mr-2"
                />
                Facebook
              </button>
              <button
                onClick={() => handleOAuthLogin("apple")}
                className="flex items-center justify-center bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                disabled={loading}
              >
                <img
                  src="/apple-icon.svg"
                  alt="Apple"
                  className="w-5 h-5 mr-2"
                />
                Apple
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-400">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-blue-400 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </ResizableLayout>
  );
}
