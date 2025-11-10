"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";

type Service = {
  id: string;
  title: string;
  image_url?: string;
  location?: string;
  description?: string;
  type?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  serviceId: string | null;
  setServiceId: (v: string | null) => void;
  customService: string;
  setCustomService: (v: string) => void;
};

export default function ServiceModal({
  open,
  onClose,
  serviceId,
  setServiceId,
  customService,
  setCustomService,
}: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Đảm bảo component đã mount (cho portal)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Fetch danh sách dịch vụ
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select("id, title, image_url, location, description, type")
        .order("title", { ascending: true });

      if (!error && data) setServices(data);
      setLoading(false);
    };
    fetchServices();
  }, []);

  // Khóa scroll khi modal mở
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const filtered = services.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const selectedService = services.find(
    (s) =>
      s.id === serviceId ||
      `/services/${s.type}/${s.id}` === serviceId
  );

  // Chuẩn hóa liên kết
  const normalizeURL = (text: string) => {
    if (!text) return "";
    const trimmed = text.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return "https://" + trimmed;
    }
    return trimmed;
  };

  // Kiểm tra liên kết hợp lệ
  const isValidDomain = (text: string) => {
    if (!text) return false;
    const domainRegex =
      /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}([\/?#].*)?$/i;
    return domainRegex.test(text.trim());
  };

  const handleDone = () => {
    if (serviceId === "custom") {
      if (!customService.trim()) {
        setError("Vui lòng nhập liên kết trước khi hoàn tất.");
        return;
      }
      if (!isValidDomain(customService)) {
        setError("Liên kết không hợp lệ. Hãy kiểm tra lại.");
        return;
      }
    }
    setError("");
    onClose();
  };

  if (!open || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-md max-h-[80vh] shadow-2xl flex flex-col animate-modalIn">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">
            Chọn dịch vụ liên kết
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors p-1.5 hover:bg-neutral-900 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-gray-200">
          {/* Thanh tìm kiếm */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          {/* Danh sách dịch vụ */}
          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-700 border-t-white rounded-full animate-spin"></div>
                  <p className="text-neutral-500 text-sm">Đang tải dịch vụ...</p>
                </div>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((s) => {
                const isSelected = serviceId === s.id || serviceId === `/services/${s.type}/${s.id}`;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      const fullPath = s.type
                        ? `/services/${s.type}/${s.id}`
                        : `/services/${s.id}`;
                      setServiceId(fullPath);
                      setShowCustomInput(false);
                      setError("");
                      onClose();
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-white bg-neutral-900"
                        : "border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0 border border-neutral-800">
                      <img
                        src={
                          s.image_url ||
                          "https://via.placeholder.com/60x60.png?text=No+Image"
                        }
                        alt={s.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">
                        {s.title}
                      </p>
                      {s.location && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-xs text-neutral-500 truncate">
                            {s.location}
                          </p>
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-neutral-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-neutral-500 text-sm">
                  Không tìm thấy dịch vụ nào.
                </p>
              </div>
            )}
          </div>

          {/* Preview dịch vụ đã chọn */}
          {selectedService && serviceId !== "custom" && (
            <div className="border border-neutral-800 bg-black rounded-lg p-3 flex gap-3 items-start">
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
                <p className="font-semibold text-white text-sm">
                  {selectedService.title}
                </p>
                {selectedService.location && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {selectedService.location}
                  </p>
                )}
                {selectedService.description && (
                  <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                    {selectedService.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-800 flex flex-col gap-2.5 flex-shrink-0">
          {/* Không thêm liên kết */}
          <button
            onClick={() => {
              setServiceId(null);
              setShowCustomInput(false);
              setError("");
              onClose();
            }}
            className="w-full py-2.5 border border-neutral-800 rounded-lg text-sm text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900 hover:text-white transition-all font-medium"
          >
            Không thêm liên kết
          </button>

          {/* Liên kết của bạn */}
          <button
            onClick={() => {
              setServiceId("custom");
              setShowCustomInput((prev) => !prev);
              setError("");
            }}
            className={`w-full py-2.5 border rounded-lg text-sm font-medium transition-all ${
              showCustomInput
                ? "bg-neutral-900 border-neutral-700 text-white"
                : "border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            Liên kết của bạn
          </button>

          {/* Input + Preview */}
          {showCustomInput && (
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập URL của bạn..."
                  value={customService}
                  onChange={(e) => {
                    setCustomService(e.target.value);
                    setError("");
                  }}
                  className="flex-1 px-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-neutral-600 transition-colors"
                />
                {customService.trim() && (
                  <a
                    href={normalizeURL(customService)}
                    target="_blank"
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition flex-shrink-0 flex items-center gap-1.5 ${
                      isValidDomain(customService)
                        ? "bg-white text-black hover:bg-neutral-200"
                        : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      if (!isValidDomain(customService)) e.preventDefault();
                    }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Xem
                  </a>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-xs font-medium">{error}</p>
                </div>
              )}

              {/* Preview nhỏ */}
              {customService.trim() && !error && (
                <div className="border border-neutral-800 bg-black rounded-lg p-2.5 text-xs">
                  {isValidDomain(customService) ? (
                    <a
                      href={normalizeURL(customService)}
                      target="_blank"
                      className="text-neutral-400 hover:text-white transition-colors break-all flex items-center gap-1.5"
                    >
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {normalizeURL(customService)}
                    </a>
                  ) : (
                    <p className="text-neutral-600 break-all">
                      {customService}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Xong */}
          <button
            onClick={handleDone}
            className="w-full py-2.5 bg-white hover:bg-neutral-200 text-black rounded-lg font-semibold transition-all active:scale-[0.98]"
          >
            Xong
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-modalIn {
          animation: modalIn 0.2s ease-out;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );

  // Render modal vào body để tránh bị ảnh hưởng bởi parent styles
  return createPortal(modalContent, document.body);
}