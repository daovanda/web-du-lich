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
    <div className="flex items-center gap-6">
      {/* Avatar Section */}
      <div className="flex-shrink-0 relative group">
        <div className="relative">
          {(avatarFile || avatarUrl) && (
            <img
              src={
                avatarFile
                  ? URL.createObjectURL(avatarFile)
                  : avatarUrl ||
                    "https://via.placeholder.com/150/000000/FFFFFF?text=Avatar"
              }
              alt="Avatar"
              className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-2 border-neutral-800 group-hover:border-neutral-700 transition-colors duration-200"
            />
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <label className="cursor-pointer">
              <div className="flex flex-col items-center text-white">
                <svg 
                  className="w-6 h-6 mb-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
                <span className="text-xs font-medium">Đổi ảnh</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>
      </div>

      {/* User Info Section */}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl md:text-2xl font-semibold text-white truncate mb-1">
          {username || "username"}
        </h1>
        <p className="text-sm text-neutral-500 truncate mb-3">{email}</p>
        
        {/* Change Avatar Button (Mobile) */}
        <label className="inline-flex md:hidden items-center gap-2 cursor-pointer bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors duration-200">
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
          Đổi ảnh đại diện
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>
    </div>
  );
}