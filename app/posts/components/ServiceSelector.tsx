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
    <div className="space-y-4 font-sans">
      <label className="block text-gray-400 font-medium">
        Liên kết dịch vụ
      </label>

      {/* 🔘 Nút mở modal */}
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white font-medium transition"
      >
        {serviceId ? "Thay đổi liên kết" : "Thêm liên kết"}
      </button>

      {/* 🖼 Preview phần đã chọn */}
      {loading ? (
        <p className="text-gray-400 text-sm italic">Đang tải dịch vụ...</p>
      ) : selectedService ? (
        // 🔹 Preview dịch vụ có sẵn — có thể click để xem chi tiết
        <a
          href={`/services/${selectedService.type || "unknown"}/${selectedService.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block border border-gray-800 bg-gray-900 rounded-lg p-3 flex gap-3 items-start hover:border-blue-600 hover:bg-gray-800/80 transition"
        >
          <img
            src={
              selectedService.image_url ||
              "https://via.placeholder.com/100x100.png?text=No+Image"
            }
            alt={selectedService.title}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-100">
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
            <p className="text-xs text-blue-400 mt-1">
              /services/{selectedService.type || "unknown"}/{selectedService.id}
            </p>
          </div>
        </a>
      ) : serviceId === "custom" ? (
        // 🔹 Preview liên kết của bạn
        customService ? (
          <div
            className={`border rounded-lg p-3 text-sm ${
              isValidURL(customService)
                ? "border-blue-600 bg-blue-950/40 text-blue-300"
                : "border-gray-700 bg-gray-800 text-gray-400"
            }`}
          >
            {isValidURL(customService) ? (
              <a
                href={normalizeURL(customService)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline break-all"
              >
                {normalizeURL(customService)}
              </a>
            ) : (
              <>
                <p className="text-gray-400 break-all">{customService}</p>
                <p className="text-xs text-red-400 mt-1">
                  ⚠️ Liên kết không hợp lệ
                </p>
              </>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">
            Chưa nhập liên kết nào.
          </p>
        )
      ) : (
        <p className="text-gray-500 text-sm italic">
          Chưa liên kết dịch vụ nào.
        </p>
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
    </div>
  );
}
