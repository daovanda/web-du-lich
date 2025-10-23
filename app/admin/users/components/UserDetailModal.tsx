"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Profile, UserHistory } from "../types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { X, Calendar, Clock, Star, Package, MapPin } from "lucide-react";

export default function UserDetailModal({
  user,
  onClose,
}: {
  user: Profile | null;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<UserHistory>({
    services: [],
    bookings: [],
    service_reviews: [],
    location_reviews: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchHistory(user.id);
    }
  }, [user?.id]); // Chỉ theo dõi user.id

  async function fetchHistory(id: string) {
    setLoading(true);
    try {
      const [servicesRes, bookingsRes, serviceReviewsRes, locationReviewsRes] = await Promise.all([
        supabase.from("services").select("id, title, type, created_at").eq("owner_id", id),
        supabase.from("bookings").select("id, service_id, status, date_from, date_to, created_at").eq("user_id", id),
        supabase.from("service_reviews").select("id, rating, comment, created_at, service_id").eq("user_id", id),
        supabase.from("reviews").select("id, rating, comment, created_at, location_id").eq("user_id", id),
      ]);

      setHistory({
        services: servicesRes.data ?? [],
        bookings: bookingsRes.data ?? [],
        service_reviews: serviceReviewsRes.data ?? [],
        location_reviews: locationReviewsRes.data ?? [],
      });
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  // Hàm format an toàn với null/undefined
  const formatDate = (date: string | null | undefined): string => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: vi });
    } catch {
      return "-";
    }
  };

  const formatDateTime = (date: string | null | undefined): string => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "-";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Chi tiết người dùng</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || "User"} // Sửa lỗi 2322
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gray-500">User</span>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {user.full_name || "Không tên"}
              </h3>
              <p className="text-sm text-gray-400">@{user.username}</p>
              <p className="text-sm text-gray-400">Phone: {user.phone || "-"}</p>

              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1 text-gray-400">
                  <Package className="w-4 h-4" />
                  Role: <span className="text-white font-medium">{user.role}</span>
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  Tạo: <span className="text-white">{formatDate(user.created_at)}</span> {/* Sửa lỗi 2345 */}
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-4 h-4" />
                  Login: <span className="text-white">{formatDateTime(user.last_login_at)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Lịch sử hoạt động */}
          <div className="space-y-6">
            {/* Dịch vụ */}
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-500" />
                Dịch vụ đã thêm ({history.services.length})
              </h4>
              {loading ? (
                <SkeletonList count={2} />
              ) : history.services.length > 0 ? (
                <div className="space-y-2">
                  {history.services.map((s: any) => (
                    <div
                      key={s.id}
                      className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex justify-between items-center text-sm"
                    >
                      <span className="text-white">{s.title}</span>
                      <span className="text-gray-400 text-xs">
                        {s.type} • {formatDate(s.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Chưa đăng dịch vụ nào</p>
              )}
            </div>

            {/* Booking */}
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                Booking ({history.bookings.length})
              </h4>
              {loading ? (
                <SkeletonList count={2} />
              ) : history.bookings.length > 0 ? (
                <div className="space-y-2">
                  {history.bookings.map((b: any) => (
                    <div
                      key={b.id}
                      className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex justify-between items-center text-sm"
                    >
                      <span className="text-white">Mã: {b.service_id}</span>
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            b.status === "confirmed"
                              ? "bg-green-900 text-green-300"
                              : b.status === "pending"
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {b.status}
                        </span>
                        <span className="text-gray-400">
                          {formatDate(b.date_from)} → {formatDate(b.date_to)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Chưa đặt dịch vụ</p>
              )}
            </div>

            {/* Đánh giá dịch vụ */}
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Đánh giá dịch vụ ({history.service_reviews.length})
              </h4>
              {loading ? (
                <SkeletonList count={1} />
              ) : history.service_reviews.length > 0 ? (
                <div className="space-y-2">
                  {history.service_reviews.map((r: any) => (
                    <div
                      key={r.id}
                      className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < r.rating ? "fill-current" : ""}`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-400 text-xs">
                          {formatDateTime(r.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-300">{r.comment || "(Không có bình luận)"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Chưa đánh giá dịch vụ</p>
              )}
            </div>

            {/* Đánh giá địa điểm */}
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                Đánh giá địa điểm ({history.location_reviews.length})
              </h4>
              {loading ? (
                <SkeletonList count={1} />
              ) : history.location_reviews.length > 0 ? (
                <div className="space-y-2">
                  {history.location_reviews.map((r: any) => (
                    <div
                      key={r.id}
                      className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < r.rating ? "fill-current" : ""}`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-400 text-xs">
                          {formatDateTime(r.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-300">{r.comment || "(Không có bình luận)"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Chưa đánh giá địa điểm</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component con: Skeleton khi loading
function SkeletonList({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-900 border border-gray-800 rounded-lg p-3 animate-pulse"
        >
          <div className="h-4 bg-gray-800 rounded w-3/4"></div>
          <div className="h-3 bg-gray-800 rounded w-1/2 mt-2"></div>
        </div>
      ))}
    </div>
  );
}