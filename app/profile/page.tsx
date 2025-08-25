// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);

        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, username, phone")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setFullName(profileData.full_name || "");
          setUsername(profileData.username || "");
          setPhone(profileData.phone || "");
        }

        const { data: history } = await supabase
          .from("bookings")
          .select("id, created_at, status, services(title, type)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (history) setServiceHistory(history);
      }
    };
    fetchUser();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600";
      case "cancelled":
        return "text-red-600";
      case "pending":
      default:
        return "text-gray-500";
    }
  };

  const validatePhoneNumber = (phone: string) => {
    const regex = /^(\+84|0)[0-9]{9}$/;
    return regex.test(phone);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!validatePhoneNumber(phone)) {
      setError(
        "Số điện thoại không hợp lệ. Vui lòng nhập +84xxxxxxxxx hoặc 0xxxxxxxxx"
      );
      setLoading(false);
      return;
    }

    const updates = {
      full_name: fullName,
      username,
      phone,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Cập nhật hồ sơ thành công");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow px-4 py-6 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Hồ sơ người dùng
        </h1>

        {user && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium">Họ và tên</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Username</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full border px-3 py-2 rounded bg-gray-100"
                  value={user.email}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  className="w-full border px-3 py-2 rounded"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleUpdateProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mb-6"
              disabled={loading}
            >
              {loading ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
            </button>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            {success && (
              <p className="text-green-600 text-sm mb-4">{success}</p>
            )}
          </>
        )}

        <h2 className="text-xl font-semibold mb-4">Lịch sử sử dụng dịch vụ</h2>
        <ul className="space-y-3">
          {serviceHistory.length === 0 && (
            <li>Chưa có dịch vụ nào được sử dụng.</li>
          )}
          {serviceHistory.map((item) => (
            <li key={item.id} className="border p-3 rounded shadow-sm">
              <div className="font-semibold">{item.services?.title}</div>
              <div className="text-sm text-gray-500">
                Loại: {item.services?.type}
              </div>
              <div className="text-sm text-gray-400">
                {new Date(item.created_at).toLocaleString()} -
                <span
                  className={`ml-1 font-medium capitalize ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
