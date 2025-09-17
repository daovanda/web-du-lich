"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        setEmail(user.email || "");

        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, username, phone, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (profileData) {
          setFullName(profileData.full_name || "");
          setUsername(profileData.username || "");
          setPhone(profileData.phone || "");
          setAvatarUrl(
            profileData.avatar_url ||
              "https://via.placeholder.com/150/000000/FFFFFF?text=Avatar"
          );
        } else {
          setAvatarUrl(
            "https://via.placeholder.com/150/000000/FFFFFF?text=Avatar"
          );
        }

        const { data: history } = await supabase
          .from("bookings")
          .select("id, created_at, status, services(title, type, image_url)")
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
        return "text-green-400";
      case "cancelled":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const validatePhoneNumber = (phone: string) => {
    const regex = /^(\+84|0)[0-9]{9}$/;
    return regex.test(phone);
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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

    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      setLoading(false);
      return;
    }

    if (email !== (user?.email || "")) {
      const { error: updateEmailError } = await supabase.auth.updateUser({
        email,
      });

      if (updateEmailError) {
        if (updateEmailError.message.includes("already registered")) {
          setError("Email này đã được đăng ký, vui lòng chọn email khác");
        } else {
          setError("Không thể cập nhật email: " + updateEmailError.message);
        }
        setLoading(false);
        return;
      }

      setSuccess(
        "Đổi email thành công! Vui lòng kiểm tra hộp thư để xác nhận email mới."
      );
    }

    let avatarUrlToUpdate = avatarUrl;
    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) {
        setError("Lỗi khi tải ảnh đại diện: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      if (publicUrlData) {
        avatarUrlToUpdate = publicUrlData.publicUrl;
        setAvatarUrl(avatarUrlToUpdate);
      }
    }

    const updates = {
      full_name: fullName,
      username,
      phone,
      avatar_url: avatarUrlToUpdate,
      updated_at: new Date().toISOString(),
    };

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (updateProfileError) {
      setError(updateProfileError.message);
    } else if (!success) {
      setSuccess("Cập nhật hồ sơ thành công");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {user ? (
          <>
            {/* Header */}
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-center">
                {(avatarFile || avatarUrl) && (
                  <img
                    src={
                      avatarFile
                        ? URL.createObjectURL(avatarFile)
                        : avatarUrl ||
                          "https://via.placeholder.com/150/000000/FFFFFF?text=Avatar"
                    }
                    alt="Avatar"
                    className="w-24 h-24 rounded-full border border-gray-700 object-cover"
                  />
                )}

                <label className="mt-3 cursor-pointer border border-blue-500 text-blue-500 px-3 py-1 rounded-lg text-sm hover:bg-blue-500 hover:text-white transition">
                  Đổi ảnh
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setAvatarFile(e.target.files?.[0] || null)
                    }
                  />
                </label>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{username || "username"}</h1>
                <p className="text-sm text-gray-400">{email}</p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-neutral-900 rounded-xl p-6 shadow">
              <h2 className="text-lg font-semibold mb-6">Chỉnh sửa hồ sơ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={handleUpdateProfile}
                className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition"
                disabled={loading}
              >
                {loading ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
              </button>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              {success && (
                <p className="text-green-400 text-sm mt-2">{success}</p>
              )}
            </div>

            {/* Service History */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Lịch sử sử dụng dịch vụ
              </h2>
              {serviceHistory.length === 0 ? (
                <p className="text-gray-400 text-center">
                  Chưa có dịch vụ nào được sử dụng.
                </p>
              ) : (
                <div className="space-y-6">
                  {serviceHistory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-neutral-900 rounded-xl overflow-hidden shadow hover:shadow-lg transition"
                    >
                      {item.services?.image_url && (
                        <img
                          src={item.services.image_url}
                          alt={item.services.title}
                          className="w-full h-56 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">
                          {item.services?.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Loại: {item.services?.type}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleString()} –{" "}
                          <span
                            className={`font-medium ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logout button cuối trang */}
            <div className="pt-6">
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="w-full border border-red-500 text-red-500 py-2 rounded-lg text-sm font-semibold hover:bg-red-500 hover:text-white transition"
              >
                Đăng xuất
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
        )}
      </main>
    </div>
  );
}
