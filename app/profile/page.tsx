"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ResizableLayout from "@/components/ResizableLayout";
import ProfileHeader from "./components/ProfileHeader";
import ProfileForm from "./components/ProfileForm";
import ServiceHistory from "./components/ServiceHistory";
import UserPostsTable from "../posts/components/UserPostsTable";
import { UserPost } from "../posts/types/index";

type TabType = "posts" | "profile" | "orders";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedPost, setSelectedPost] = useState<UserPost | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  /* ---------------------- Fetch user data ---------------------- */
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
      }
      
      setTimeout(() => {
        setIsInitialLoad(false);
      }, 200);
    };
    fetchUser();
  }, []);

  /* ---------------------- Validation ---------------------- */
  const validatePhoneNumber = (phone: string) => /^(\+84|0)[0-9]{9}$/.test(phone);
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* ---------------------- Update Profile ---------------------- */
  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!validatePhoneNumber(phone)) {
      setError("Số điện thoại không hợp lệ. (+84xxxxxxxxx hoặc 0xxxxxxxxx)");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      setLoading(false);
      return;
    }

    if (email !== (user?.email || "")) {
      const { error: updateEmailError } = await supabase.auth.updateUser({ email });
      if (updateEmailError) {
        setError(
          updateEmailError.message.includes("already registered")
            ? "Email này đã được đăng ký, vui lòng chọn email khác"
            : "Không thể cập nhật email: " + updateEmailError.message
        );
        setLoading(false);
        return;
      }
      setSuccess("Đổi email thành công! Vui lòng xác nhận email mới.");
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
      avatarUrlToUpdate = publicUrlData?.publicUrl || avatarUrlToUpdate;
      setAvatarUrl(avatarUrlToUpdate);
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

    if (updateProfileError) setError(updateProfileError.message);
    else if (!success) setSuccess("Cập nhật hồ sơ thành công");

    setLoading(false);
  };

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

  const handleOpenPost = (post: UserPost) => {
    setSelectedPost(post);
    console.log("Open post:", post);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "posts", label: "Bài đăng" },
    { id: "profile", label: "Hồ sơ" },
    { id: "orders", label: "Đơn hàng" },
  ];

  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black text-white">
        <main 
          className={`max-w-3xl mx-auto px-4 py-6 space-y-8 pt-24 md:pt-6 transition-all duration-1000 ease-out ${
            isInitialLoad 
              ? 'opacity-0 translate-y-8' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          {user ? (
            <>
              {/* Header Profile */}
              <div 
                className={`transition-all duration-700 ease-out delay-300 ${
                  isInitialLoad 
                    ? 'opacity-0 translate-y-6' 
                    : 'opacity-100 translate-y-0'
                }`}
              >
                <ProfileHeader
                  avatarFile={avatarFile}
                  avatarUrl={avatarUrl}
                  username={username}
                  email={email}
                  setAvatarFile={setAvatarFile}
                />
              </div>

              {/* Tab Navigation */}
              <div 
                className={`transition-all duration-700 ease-out delay-500 ${
                  isInitialLoad 
                    ? 'opacity-0 translate-y-6' 
                    : 'opacity-100 translate-y-0'
                }`}
              >
                <div className="bg-neutral-900 rounded-xl shadow overflow-hidden">
                  <div className="flex border-b border-neutral-800">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-300 ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            : "text-gray-400 hover:text-white hover:bg-neutral-800"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {/* Bài đăng Tab */}
                    {activeTab === "posts" && (
                      <div className="animate-fadeIn">
                        <UserPostsTable 
                          currentUserId={user.id} 
                          onOpenPost={handleOpenPost}
                        />
                      </div>
                    )}

                    {/* Hồ sơ Tab */}
                    {activeTab === "profile" && (
                      <div className="animate-fadeIn">
                        <ProfileForm
                          fullName={fullName}
                          username={username}
                          phone={phone}
                          email={email}
                          loading={loading}
                          error={error}
                          success={success}
                          setFullName={setFullName}
                          setUsername={setUsername}
                          setPhone={setPhone}
                          setEmail={setEmail}
                          handleUpdateProfile={handleUpdateProfile}
                        />
                      </div>
                    )}

                    {/* Đơn hàng Tab */}
                    {activeTab === "orders" && (
                      <div className="animate-fadeIn">
                        <ServiceHistory getStatusColor={getStatusColor} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Nút đăng xuất */}
              <div 
                className={`pt-6 transition-all duration-700 ease-out delay-700 ${
                  isInitialLoad 
                    ? 'opacity-0 translate-y-4' 
                    : 'opacity-100 translate-y-0'
                }`}
              >
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                  className="w-full border border-red-500 text-red-500 py-2 rounded-lg text-sm font-semibold hover:bg-red-500 hover:text-white transition-all duration-300 ease-out"
                >
                  Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <p 
              className={`text-center text-gray-500 transition-all duration-700 ease-out ${
                isInitialLoad 
                  ? 'opacity-0 translate-y-4' 
                  : 'opacity-100 translate-y-0'
              }`}
            >
              Đang tải dữ liệu...
            </p>
          )}
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </ResizableLayout>
  );
}