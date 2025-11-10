"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ServiceModal from "./ServiceModal";

type Service = {
  id: string;
  title: string;
  image_url?: string;
  location?: string;
  description?: string;
  type?: string;
};

type Props = {
  serviceId: string | null;
  setServiceId: (v: string | null) => void;
  customService: string;
  setCustomService: (v: string) => void;
};

export default function ServiceSelector({
  serviceId,
  setServiceId,
  customService,
  setCustomService,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Chuẩn hóa liên kết (tự thêm https:// nếu thiếu)
  const normalizeURL = (text: string) => {
    if (!text) return "";
    const trimmed = text.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return "https://" + trimmed;
    }
    return trimmed;
  };

  // ✅ Kiểm tra hợp lệ: có domain hợp lệ (.com, .net, .vn...)
  const isValidURL = (text: string) => {
    if (!text) return false;

    const input = text.trim();
    const normalized = /^https?:\/\//i.test(input)
      ? input
      : `https://${input}`;

    try {
      const url = new URL(normalized);
      return !!url.hostname && url.hostname.includes(".");
    } catch {
      return false;
    }
  };

  // 🧩 Tách ID thật từ serviceId (trường hợp dạng /service/{type}/{id})
  const extractServiceId = (value: string | null): string | null => {
    if (!value) return null;
    const parts = value.split("/");
    return parts[parts.length - 1] || null;
  };

  // 🔹 Lấy chi tiết dịch vụ khi có ID
  useEffect(() => {
    const fetchServiceDetail = async () => {
      const id = extractServiceId(serviceId);

      if (!id || serviceId === "custom") {
        setSelectedService(null);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select("id, title, image_url, location, description, type")
        .eq("id", id)
        .single();

      if (!error && data) setSelectedService(data);
      setLoading(false);
    };
    fetchServiceDetail();
  }, [serviceId]);

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide">
        Liên kết dịch vụ
      </label>

      {/* 📘 Nút mở modal */}
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 bg-black hover:bg-neutral-900 border border-neutral-800 rounded-lg text-white font-medium transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        {serviceId ? "Thay đổi liên kết" : "Thêm liên kết"}
      </button>

      {/* 🖼 Preview phần đã chọn */}
      {loading ? (
        <div className="flex items-center gap-2 p-3 bg-black border border-neutral-800 rounded-lg">
          <div className="w-4 h-4 border-2 border-neutral-700 border-t-white rounded-full animate-spin"></div>
          <p className="text-neutral-500 text-sm">Đang tải dịch vụ...</p>
        </div>
      ) : selectedService ? (
        // 🔹 Preview dịch vụ có sẵn – có thể click để xem chi tiết
        <a
          href={`/services/${selectedService.type || "unknown"}/${selectedService.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block border border-neutral-800 bg-black rounded-lg overflow-hidden hover:border-neutral-600 transition-colors duration-200 group"
        >
          <div className="flex gap-3 p-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0 border border-neutral-800">
              <img
                src={
                  selectedService.image_url ||
                  "https://via.placeholder.com/100x100.png?text=No+Image"
                }
                alt={selectedService.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate group-hover:text-neutral-300 transition-colors">
                {selectedService.title}
              </p>
              {selectedService.location && (
                <div className="flex items-center gap-1 mt-1">
                  <svg className="w-3 h-3 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-xs text-neutral-500 truncate">
                    {selectedService.location}
                  </p>
                </div>
              )}
              {selectedService.description && (
                <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                  {selectedService.description}
                </p>
              )}
            </div>
          </div>
        </a>
      ) : serviceId === "custom" ? (
        // 🔹 Preview liên kết của bạn
        customService ? (
          <div
            className={`border rounded-lg p-3 ${
              isValidURL(customService)
                ? "border-neutral-800 bg-black"
                : "border-red-500/20 bg-red-500/5"
            }`}
          >
            {isValidURL(customService) ? (
              <a
                href={normalizeURL(customService)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white hover:text-neutral-300 transition-colors break-all group"
              >
                <svg className="w-4 h-4 flex-shrink-0 text-neutral-500 group-hover:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {normalizeURL(customService)}
              </a>
            ) : (
              <>
                <p className="text-sm text-neutral-400 break-all mb-1">{customService}</p>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-red-400">
                    Liên kết không hợp lệ
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-3 bg-black border border-neutral-800 rounded-lg">
            <p className="text-neutral-600 text-sm">
              Chưa nhập liên kết nào.
            </p>
          </div>
        )
      ) : (
        <div className="p-3 bg-black border border-neutral-800 rounded-lg">
          <p className="text-neutral-600 text-sm">
            Chưa liên kết dịch vụ nào.
          </p>
        </div>
      )}

      {/* 🪟 Modal chọn dịch vụ */}
      {open && (
        <ServiceModal
          open={open}
          onClose={() => setOpen(false)}
          serviceId={serviceId}
          setServiceId={setServiceId}
          customService={customService}
          setCustomService={setCustomService}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}