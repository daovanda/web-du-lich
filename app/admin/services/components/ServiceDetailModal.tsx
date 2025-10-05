"use client";

import { Service } from "../types";

type Props = {
  open: boolean;
  service: Service | null;
  onClose: () => void;
};

export default function ServiceDetailModal({ open, service, onClose }: Props) {
  if (!open || !service) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-neutral-900 text-white w-full max-w-2xl rounded-2xl p-8 space-y-6 relative shadow-xl border border-neutral-800">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold tracking-tight">
          {service.title}
        </h2>

        {/* Basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
          <div className="space-y-2">
            <p>
              <span className="block text-gray-400 text-xs uppercase">Loại dịch vụ</span>
              {service.type}
            </p>
            <p>
              <span className="block text-gray-400 text-xs uppercase">Địa điểm</span>
              {service.location || "—"}
            </p>
            <p>
              <span className="block text-gray-400 text-xs uppercase">Giá</span>
              {service.price || "—"}
            </p>
            <p>
              <span className="block text-gray-400 text-xs uppercase">Đánh giá trung bình</span>
              {service.average_rating || "0.0"}
            </p>
            <p>
              <span className="block text-gray-400 text-xs uppercase">Số đánh giá</span>
              {service.reviews_count || 0}
            </p>
          </div>

          <div className="space-y-2">
            <p>
              <span className="block text-gray-400 text-xs uppercase">Ngày tạo</span>
              {service.created_at?.slice(0, 10)}
            </p>
            <p>
              <span className="block text-gray-400 text-xs uppercase">Trạng thái</span>
              {service.status || "—"}
            </p>
            <p>
              <span className="block text-gray-400 text-xs uppercase">Chủ dịch vụ</span>
              {service.owner_name || "—"}
            </p>
            <p>
              <span className="block text-gray-400 text-xs uppercase">Số điện thoại</span>
              {service.phone || "—"}
            </p>
            <p>
              <span className="block text-gray-400 text-xs uppercase">Email</span>
              {service.email || "—"}
            </p>
          </div>
        </div>

        {/* Images */}
        {service.images && service.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
            {service.images.map((img, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-neutral-800">
                <img
                  src={img}
                  alt=""
                  className="w-full h-32 object-cover hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        {service.description && (
          <div className="mt-6 text-sm leading-relaxed text-gray-300 border-t border-neutral-800 pt-4">
            {service.description}
          </div>
        )}
      </div>
    </div>
  );
}
