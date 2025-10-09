"use client";

type Props = {
  avatarFile: File | null;
  avatarUrl: string | null;
  username: string;
  email: string;
  setAvatarFile: (file: File | null) => void;
};

export default function ProfileHeader({
  avatarFile,
  avatarUrl,
  username,
  email,
  setAvatarFile,
}: Props) {
  return (
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
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>
      <div>
        <h1 className="text-2xl font-bold">{username || "username"}</h1>
        <p className="text-sm text-gray-400">{email}</p>
      </div>
    </div>
  );
}
