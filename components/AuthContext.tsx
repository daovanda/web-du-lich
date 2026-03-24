"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { apiRequest } from "@/lib/apiClient";

type Profile = {
  full_name?: string;
  username?: string;
  avatar_url?: string;
};

type AuthUser = {
  id: string;
  email: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// ✅ In-memory cache để tránh re-fetch mỗi lần mount
let cachedUser: AuthUser | null = null;
let cachedProfile: Profile | null = null;
let isFetchingProfile = false;
let profilePromise: Promise<void> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(cachedUser);
  const [profile, setProfile] = useState<Profile | null>(cachedProfile);
  const [isLoading, setIsLoading] = useState(!cachedUser); // ✅ Nếu có cache thì không loading
  const isInitialized = useRef(false);

  const fetchAuthState = async (retries = 3) => {
    // ✅ Nếu đang fetch, đợi promise hiện tại
    if (isFetchingProfile && profilePromise) {
      await profilePromise;
      return;
    }

    isFetchingProfile = true;
    
    profilePromise = (async () => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await apiRequest<{
            data: { user: AuthUser | null; profile: Profile | null };
          }>("/api/auth/me", {
            fallbackMessage: "Không thể tải thông tin đăng nhập",
          });
          cachedUser = response.data.user;
          cachedProfile = response.data.profile;
          setUser(response.data.user);
          setProfile(response.data.profile);
          return;
        } catch (err) {
          console.error(`Profile fetch attempt ${attempt}/${retries} failed:`, err);
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
      cachedUser = null;
      cachedProfile = null;
      setUser(null);
      setProfile(null);
    })();

    await profilePromise;
    isFetchingProfile = false;
    profilePromise = null;
  };

  const refreshProfile = async () => {
    cachedProfile = null; // ✅ Clear cache để force refresh
    await fetchAuthState();
  };

  useEffect(() => {
    // ✅ Chỉ initialize một lần
    if (isInitialized.current) {
      return;
    }
    isInitialized.current = true;

    let mounted = true;

    const initAuth = async () => {
      try {
        // ✅ Nếu đã có cache, dùng luôn
        if (cachedUser) {
          setUser(cachedUser);
          setProfile(cachedProfile);
          setIsLoading(false);
        }
        await fetchAuthState();
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    // Khi quay lại tab thì đồng bộ lại session/profile từ server
    const onFocus = () => {
      void fetchAuthState();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []); // ✅ Empty deps - chỉ chạy một lần

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}