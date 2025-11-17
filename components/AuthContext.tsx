"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

type Profile = {
  full_name?: string;
  username?: string;
  avatar_url?: string;
};

type AuthContextType = {
  user: User | null;
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
let cachedUser: User | null = null;
let cachedProfile: Profile | null = null;
let isFetchingProfile = false;
let profilePromise: Promise<void> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [profile, setProfile] = useState<Profile | null>(cachedProfile);
  const [isLoading, setIsLoading] = useState(!cachedUser); // ✅ Nếu có cache thì không loading
  const isInitialized = useRef(false);

  const fetchProfile = async (userId: string, retries = 3) => {
    // ✅ Nếu đang fetch, đợi promise hiện tại
    if (isFetchingProfile && profilePromise) {
      await profilePromise;
      return;
    }

    // ✅ Nếu đã có profile cho user này, skip
    if (cachedProfile && cachedUser?.id === userId) {
      return;
    }

    isFetchingProfile = true;
    
    profilePromise = (async () => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name, username, avatar_url")
            .eq("id", userId)
            .maybeSingle();

          if (!error && data) {
            cachedProfile = data; // ✅ Cache
            setProfile(data);
            return;
          }

          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        } catch (err) {
          console.error(`Profile fetch attempt ${attempt}/${retries} failed:`, err);
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
      cachedProfile = null;
      setProfile(null);
    })();

    await profilePromise;
    isFetchingProfile = false;
    profilePromise = null;
  };

  const refreshProfile = async () => {
    if (user) {
      cachedProfile = null; // ✅ Clear cache để force refresh
      await fetchProfile(user.id);
    }
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
          return;
        }

        // Retry getting session
        let session = null;
        for (let i = 0; i < 3; i++) {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            session = data.session;
            break;
          }
          if (i < 2) await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (!mounted) return;

        const currentUser = session?.user || null;
        cachedUser = currentUser; // ✅ Cache
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          cachedProfile = null;
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log("Auth event:", event);

        const currentUser = session?.user || null;
        
        // ✅ Chỉ update nếu user thực sự thay đổi
        if (currentUser?.id !== cachedUser?.id) {
          cachedUser = currentUser;
          setUser(currentUser);

          if (currentUser) {
            await fetchProfile(currentUser.id);
          } else {
            cachedProfile = null;
            setProfile(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // ✅ Empty deps - chỉ chạy một lần

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}