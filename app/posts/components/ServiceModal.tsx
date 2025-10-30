"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Service = {
  id: string;
  title: string;
  image_url?: string;
  location?: string;
  description?: string;
  type?: string; // 🆕 Thêm để tạo URL đúng
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

  // 🧩 Fetch danh sách dịch vụ (có thêm type)
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select("id, title, image_url, location, description, type") // 🆕 Thêm type
        .order("title", { ascending: true });

      if (!error && data) setServices(data);
      setLoading(false);
    };
    fetchServices();
  }, []);

  const filtered = services.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const selectedService = services.find(
    (s) =>
      s.id === serviceId ||
      `/services/${s.type}/${s.id}` === serviceId // 🆕 Giúp nhận diện đúng nếu serviceId là URL
  );

  // ✅ Chuẩn hóa liên kết (tự thêm https:// nếu thiếu)
  const normalizeURL = (text: string) => {
    if (!text) return "";
    const trimmed = text.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return "https://" + trimmed;
    }
    return trimmed;
  };

  // ✅ Kiểm tra liên kết hợp lệ (có domain .com, .vn, .org,...)
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 font-sans">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">
            Chọn dịch vụ liên kết
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 text-gray-200">
          {/* 🔍 Thanh tìm kiếm */}
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
          />

          {/* Danh sách dịch vụ */}
          <div className="space-y-2">
            {loading ? (
              <p className="text-gray-500 text-sm italic">
                Đang tải dịch vụ...
              </p>
            ) : filtered.length > 0 ? (
              filtered.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    // 🆕 Khi chọn, lưu URL chuẩn
                    const fullPath = s.type
                      ? `/services/${s.type}/${s.id}`
                      : `/services/${s.id}`;
                    setServiceId(fullPath);
                    setShowCustomInput(false);
                    setError("");
                    onClose();
                  }}
                  className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                    serviceId === s.id ||
                    serviceId === `/services/${s.type}/${s.id}`
                      ? "border-blue-500 bg-blue-950/40"
                      : "border-gray-800 hover:border-gray-600 hover:bg-gray-900/70"
                  }`}
                >
                  <img
                    src={
                      s.image_url ||
                      "https://via.placeholder.com/60x60.png?text=No+Image"
                    }
                    alt={s.title}
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-100 truncate">
                      {s.title}
                    </p>
                    {s.location && (
                      <p className="text-xs text-gray-500 truncate">
                        📍 {s.location}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">
                Không tìm thấy dịch vụ nào.
              </p>
            )}
          </div>

          {/* 🖼 Preview dịch vụ đã chọn */}
          {selectedService && serviceId !== "custom" && (
            <div className="border border-gray-800 bg-gray-900 rounded-lg p-3 mt-4 flex gap-3 items-start">
              <img
                src={
                  selectedService.image_url ||
                  "https://via.placeholder.com/100x100.png?text=No+Image"
                }
                alt={selectedService.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-white">
                  {selectedService.title}
                </p>
                {selectedService.location && (
                  <p className="text-sm text-gray-400">
                    📍 {selectedService.location}
                  </p>
                )}
                {selectedService.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {selectedService.description}
                  </p>
                )}
                {/* 🆕 Hiển thị link preview */}
                <a
                  href={`/services/${selectedService.type}/${selectedService.id}`}
                  target="_blank"
                  className="text-blue-400 text-xs mt-1 inline-block hover:underline"
                >
                  /services/{selectedService.type}/{selectedService.id}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex flex-col gap-3">
          {/* 🚫 Không thêm liên kết */}
          <button
            onClick={() => {
              setServiceId(null);
              setShowCustomInput(false);
              setError("");
              onClose();
            }}
            className="w-full py-2 border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-500 hover:bg-gray-800 hover:text-white transition font-medium"
          >
            🚫 Không thêm liên kết
          </button>

          {/* 🔗 Liên kết của bạn */}
          <button
            onClick={() => {
              setServiceId("custom");
              setShowCustomInput((prev) => !prev);
              setError("");
            }}
            className={`w-full py-2 border rounded-lg text-sm font-medium transition-colors ${
              showCustomInput
                ? "bg-gray-800 border-gray-600 text-white"
                : "border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800 hover:text-white"
            }`}
          >
            🔗 Liên kết của bạn
          </button>

          {/* Input + Preview */}
          {showCustomInput && (
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập liên kết của bạn..."
                  value={customService}
                  onChange={(e) => {
                    setCustomService(e.target.value);
                    setError("");
                  }}
                  className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 text-sm"
                />
                {customService.trim() && (
                  <a
                    href={normalizeURL(customService)}
                    target="_blank"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isValidDomain(customService)
                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      if (!isValidDomain(customService)) e.preventDefault();
                    }}
                  >
                    🔍 Xem
                  </a>
                )}
              </div>

              {error && (
                <p className="text-red-400 text-xs font-medium">{error}</p>
              )}

              {/* Preview nhỏ */}
              {customService.trim() && (
                <div className="border border-gray-700 bg-gray-800 rounded-lg p-3 text-xs">
                  {isValidDomain(customService) ? (
                    <a
                      href={normalizeURL(customService)}
                      target="_blank"
                      className="text-blue-400 hover:underline break-all"
                    >
                      {normalizeURL(customService)}
                    </a>
                  ) : (
                    <p className="text-gray-400 break-all">
                      {customService}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ✅ Xong */}
          <button
            onClick={handleDone}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition"
          >
            ✅ Xong
          </button>
        </div>
      </div>
    </div>
  );
}
