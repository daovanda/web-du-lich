"use client";

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
  return (
    <div className="bg-neutral-900 rounded-xl p-6 shadow">
      <h2 className="text-lg font-semibold mb-6">Chỉnh sửa hồ sơ</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Họ và tên</label>
          <input
            type="text"
            className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Username</label>
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
        onClick={handleUpdateProfile}
        className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition"
        disabled={loading}
      >
        {loading ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
      </button>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      {success && <p className="text-green-400 text-sm mt-2">{success}</p>}
    </div>
  );
}
