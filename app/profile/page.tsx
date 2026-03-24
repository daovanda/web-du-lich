"use client";

import { useEffect, useState } from "react";
import { apiFormRequest, apiRequest } from "@/lib/apiClient";
import ResizableLayout from "@/components/ResizableLayout";
import ProfileHeader from "./components/ProfileHeader";
import ProfileForm from "./components/ProfileForm";
import ServiceHistory from "@/app/profile/components/service-history/ServiceHistory";
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
      const res = await apiRequest<{ user: any; profile: any }>("/api/profile/me", {
        fallbackMessage: "Không thể tải thông tin người dùng",
      }).catch(() => ({ user: null, profile: null }));
      const user = res.user;

      if (user) {
        setUser(user);
        setEmail(user.email || "");

        const profileData = res.profile;

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
      try {
        await apiRequest("/api/profile/email", {
          method: "PATCH",
          body: JSON.stringify({ email }),
          fallbackMessage: "Không thể cập nhật email",
        });
      } catch (err: any) {
        setError(
          String(err?.message || "").includes("already registered")
            ? "Email này đã được đăng ký, vui lòng chọn email khác"
            : "Không thể cập nhật email: " + (err?.message || "lỗi không xác định")
        );
        setLoading(false);
        return;
      }
      setSuccess("Đổi email thành công! Vui lòng xác nhận email mới.");
    }

    let avatarUrlToUpdate = avatarUrl;
    if (avatarFile) {
      const formData = new FormData();
      formData.append("bucketName", "avatars");
      formData.append("folderPath", user.id);
      formData.append("files", avatarFile);
      let uploadPayload: { data: string[] };
      try {
        uploadPayload = await apiFormRequest<{ data: string[] }>("/api/uploads/images", {
          method: "POST",
          formData,
          fallbackMessage: "Upload ảnh đại diện thất bại",
        });
      } catch (err: any) {
        setError("Lỗi khi tải ảnh đại diện: " + (err?.message || "upload thất bại"));
        setLoading(false);
        return;
      }
      if (!uploadPayload?.data?.[0]) {
        setError("Lỗi khi tải ảnh đại diện: upload thất bại");
        setLoading(false);
        return;
      }
      avatarUrlToUpdate = uploadPayload.data[0] || avatarUrlToUpdate;
      setAvatarUrl(avatarUrlToUpdate);
    }

    const updates = {
      full_name: fullName,
      username,
      phone,
      avatar_url: avatarUrlToUpdate,
      updated_at: new Date().toISOString(),
    };

    try {
      await apiRequest("/api/profile/me", {
        method: "PATCH",
        body: JSON.stringify(updates),
        fallbackMessage: "Không thể cập nhật hồ sơ",
      });
      if (!success) setSuccess("Cập nhật hồ sơ thành công");
    } catch (err: any) {
      setError(err?.message || "Không thể cập nhật hồ sơ");
    }

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

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "posts", label: "Bài đăng", icon: "" },
    { id: "profile", label: "Hồ sơ", icon: "👤" },
    { id: "orders", label: "Dịch vụ của bạn", icon: "" },
  ];

  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black text-white">
        <main 
          className={`max-w-4xl mx-auto px-4 py-6 space-y-6 pt-24 md:pt-8 transition-all duration-1000 ease-out ${
            isInitialLoad 
              ? 'opacity-0 translate-y-8' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          {user ? (
            <>
              {/* Profile Header Section */}
              <div 
                className={`transition-all duration-700 ease-out delay-200 ${
                  isInitialLoad 
                    ? 'opacity-0 translate-y-6' 
                    : 'opacity-100 translate-y-0'
                }`}
              >
                <div className="bg-neutral-950 border border-neutral-800/50 rounded-xl p-6 backdrop-blur-sm">
                  <ProfileHeader
                    avatarFile={avatarFile}
                    avatarUrl={avatarUrl}
                    username={username}
                    email={email}
                    setAvatarFile={setAvatarFile}
                  />
                </div>
              </div>

              {/* Minimalist Tab Navigation */}
              <div 
                className={`transition-all duration-700 ease-out delay-400 ${
                  isInitialLoad 
                    ? 'opacity-0 translate-y-6' 
                    : 'opacity-100 translate-y-0'
                }`}
              >
                <div className="flex items-center justify-center gap-1 p-1 bg-neutral-950 border border-neutral-800/50 rounded-full backdrop-blur-sm">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-white text-black shadow-lg"
                          : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                      }`}
                    >
                      <span className="text-base">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div 
                className={`transition-all duration-700 ease-out delay-600 ${
                  isInitialLoad 
                    ? 'opacity-0 translate-y-6' 
                    : 'opacity-100 translate-y-0'
                }`}
              >
                <div className="bg-neutral-950 border border-neutral-800/50 rounded-xl overflow-hidden backdrop-blur-sm">
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

              {/* Logout Button */}
              <div 
                className={`pt-2 transition-all duration-700 ease-out delay-700 ${
                  isInitialLoad 
                    ? 'opacity-0 translate-y-4' 
                    : 'opacity-100 translate-y-0'
                }`}
              >
                <button
                  onClick={async () => {
                    await apiRequest("/api/auth/logout", {
                      method: "POST",
                      fallbackMessage: "Đăng xuất thất bại",
                    });
                    window.location.href = "/";
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800/50 text-neutral-400 py-3 rounded-xl text-sm font-medium hover:bg-neutral-900 hover:text-white hover:border-neutral-700 transition-all duration-300 ease-out backdrop-blur-sm"
                >
                  Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-neutral-700 border-t-white rounded-full animate-spin"></div>
                <p className="text-neutral-500 text-sm">Đang tải dữ liệu...</p>
              </div>
            </div>
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

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </ResizableLayout>
  );
}