"use client";

import { useState } from "react";

type Props = {
  fullName: string;
  username: string;
  phone: string;
  email: string;
  loading: boolean;
  error: string | null;
  success: string | null;
  setFullName: (v: string) => void;
  setUsername: (v: string) => void;
  setPhone: (v: string) => void;
  setEmail: (v: string) => void;
  handleUpdateProfile: () => void;
};

export default function ProfileForm({
  fullName,
  username,
  phone,
  email,
  loading,
  error,
  success,
  setFullName,
  setUsername,
  setPhone,
  setEmail,
  handleUpdateProfile,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const handleToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    handleUpdateProfile();
    // Có thể tự động đóng form sau khi lưu thành công
    // setIsEditing(false);
  };

  return (
    <div className="bg-neutral-900 rounded-xl shadow overflow-hidden">
      {/* Header - Always visible */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Hồ sơ</h2>
          <button
            onClick={handleToggle}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            {isEditing ? "Hủy" : "Chỉnh sửa hồ sơ"}
          </button>
        </div>
      </div>

      {/* Expandable form section */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isEditing
            ? "max-h-[800px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-6">
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
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
          </button>
          
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-400 text-sm mt-2">{success}</p>}
        </div>
      </div>
    </div>
  );
}