"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import ResizableLayout from "@/components/ResizableLayout";
import { useSupabase } from "@/components/SupabaseProvider";

export default function LoginPage() {
  const supabase = useSupabase();
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
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role === "admin") router.push("/admin");
      else router.push("/");
    }

    setLoading(false);
  };

  // 🔹 Đăng nhập OAuth
  const handleOAuthLogin = async (provider: "google" | "facebook" | "apple") => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* ✨ Logo & Hero Section */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 mb-6 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </motion.div>
            
            <motion.h1
              className="text-2xl font-bold mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Chào mừng trở lại
            </motion.h1>
            
            <motion.p
              className="text-sm text-neutral-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Đăng nhập để tiếp tục hành trình của bạn
            </motion.p>
          </div>

          {/* 🎨 Login Card */}
          <motion.div
            className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-5"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {/* ⚠️ Error Message */}
            {error && (
              <motion.div
                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* 📧 Email Input */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Nhập email của bạn"
                />
              </div>

              {/* 🔒 Password Input */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors duration-200 pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-500 hover:text-neutral-300 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* 🔗 Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-neutral-500 hover:text-white transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* 🚀 Login Button */}
              <button
                type="submit"
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  loading
                    ? "bg-neutral-800 cursor-not-allowed text-neutral-500"
                    : "bg-white text-black hover:bg-neutral-200 active:scale-[0.98]"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>

            {/* 📱 Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-neutral-950 px-3 text-neutral-600 uppercase tracking-wide">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            {/* 🌐 OAuth Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleOAuthLogin("google")}
                className="w-full flex items-center justify-center gap-3 bg-black border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/50 py-3 rounded-lg transition-all duration-200 group"
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium">Tiếp tục với Google</span>
              </button>

              <button
                onClick={() => handleOAuthLogin("facebook")}
                className="w-full flex items-center justify-center gap-3 bg-black border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/50 py-3 rounded-lg transition-all duration-200 group"
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium">Tiếp tục với Facebook</span>
              </button>

              <button
                onClick={() => handleOAuthLogin("apple")}
                className="w-full flex items-center justify-center gap-3 bg-black border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/50 py-3 rounded-lg transition-all duration-200 group"
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="text-sm font-medium">Tiếp tục với Apple</span>
              </button>
            </div>
          </motion.div>

          {/* 📝 Sign Up Link */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <p className="text-sm text-neutral-500">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-white font-semibold hover:text-neutral-300 transition-colors"
              >
                Đăng ký ngay
              </Link>
            </p>
          </motion.div>

          {/* 🔒 Security Note */}
          <motion.div
            className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Được bảo mật bởi SSL/TLS encryption</span>
          </motion.div>
        </motion.div>
      </div>

      {/* ✨ Custom CSS */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </ResizableLayout>
  );
}