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
    <div className="space-y-5">
      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
            Họ và tên
          </label>
          <input
            type="text"
            className="w-full bg-black border border-neutral-800 px-4 py-3 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors duration-200"
            placeholder="Nhập họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
            Username
          </label>
          <input
            type="text"
            className="w-full bg-black border border-neutral-800 px-4 py-3 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors duration-200"
            placeholder="Nhập username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
            Số điện thoại
          </label>
          <input
            type="tel"
            className="w-full bg-black border border-neutral-800 px-4 py-3 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors duration-200"
            placeholder="+84 hoặc 0xxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            className="w-full bg-black border border-neutral-800 px-4 py-3 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors duration-200"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <span className="text-red-400 text-sm">⚠️</span>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <span className="text-green-400 text-sm">✓</span>
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleUpdateProfile}
        className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-neutral-200 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Đang cập nhật...
          </span>
        ) : (
          "Lưu thay đổi"
        )}
      </button>
    </div>
  );
}