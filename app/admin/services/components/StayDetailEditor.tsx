"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { StayDetail, ACCOMMODATION_TYPES } from "../types";

type Props = {
  open: boolean;
  serviceId: string;
  existingStay?: StayDetail | null;
  onClose: () => void;
  onSave: () => void;
};

export default function StayDetailEditor({
  open,
  serviceId,
  existingStay,
  onClose,
  onSave,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StayDetail>({
    accommodation_type: "",
    max_guests: 2,
    number_of_rooms: 1,
    number_of_beds: 1,
    price_per_night: null,
  });

  useEffect(() => {
    if (open && existingStay) {
      setFormData({
        accommodation_type: existingStay.accommodation_type || "",
        max_guests: existingStay.max_guests || 2,
        number_of_rooms: existingStay.number_of_rooms || 1,
        number_of_beds: existingStay.number_of_beds || 1,
        price_per_night: existingStay.price_per_night || null,
      });
    } else if (open) {
      setFormData({
        accommodation_type: "",
        max_guests: 2,
        number_of_rooms: 1,
        number_of_beds: 1,
        price_per_night: null,
      });
    }
  }, [open, existingStay]);

  const handleInputChange = (field: keyof StayDetail, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const stayData = {
        ...formData,
        price_per_night:
          formData.price_per_night && formData.price_per_night > 0
            ? formData.price_per_night
            : null,
      };

      const { data: existingData } = await supabase
        .from("stays")
        .select("id")
        .eq("id", serviceId)
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from("stays")
          .update(stayData)
          .eq("id", serviceId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("stays")
          .insert({ id: serviceId, ...stayData });

        if (error) throw error;
      }

      alert("Đã lưu thông tin chỗ ở thành công!");
      onSave();
      onClose();
    } catch (err: any) {
      console.error("Error saving stay:", err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black text-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-800 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gradient-to-r from-emerald-600/10 to-blue-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">
              {existingStay ? "Chỉnh sửa" : "Thêm"} Chỗ ở
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Loại chỗ ở <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.accommodation_type}
                onChange={(e) => handleInputChange("accommodation_type", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              >
                <option value="">Chọn loại chỗ ở</option>
                {ACCOMMODATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Số khách tối đa <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.max_guests === 0 ? "" : formData.max_guests}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value === "") {
                      handleInputChange("max_guests", 0);
                      return;
                    }
                    const numValue = parseInt(value);
                    if (numValue >= 1 && numValue <= 100) {
                      handleInputChange("max_guests", numValue);
                    }
                  }}
                  onBlur={(e) => {
                    if (formData.max_guests === 0 || e.target.value === "") {
                      handleInputChange("max_guests", 2);
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="1-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Số phòng <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.number_of_rooms === 0 ? "" : formData.number_of_rooms}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value === "") {
                      handleInputChange("number_of_rooms", 0);
                      return;
                    }
                    const numValue = parseInt(value);
                    if (numValue >= 1 && numValue <= 50) {
                      handleInputChange("number_of_rooms", numValue);
                    }
                  }}
                  onBlur={(e) => {
                    if (formData.number_of_rooms === 0 || e.target.value === "") {
                      handleInputChange("number_of_rooms", 1);
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="1-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Số giường <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.number_of_beds === 0 ? "" : formData.number_of_beds}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value === "") {
                      handleInputChange("number_of_beds", 0);
                      return;
                    }
                    const numValue = parseInt(value);
                    if (numValue >= 1 && numValue <= 100) {
                      handleInputChange("number_of_beds", numValue);
                    }
                  }}
                  onBlur={(e) => {
                    if (formData.number_of_beds === 0 || e.target.value === "") {
                      handleInputChange("number_of_beds", 1);
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="1-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Giá mỗi đêm (VNĐ)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    formData.price_per_night === null || formData.price_per_night === 0
                      ? ""
                      : formData.price_per_night.toLocaleString("vi-VN")
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value === "") {
                      handleInputChange("price_per_night", null);
                      return;
                    }
                    const numValue = parseFloat(value);
                    if (numValue >= 0 && numValue <= 100000000) {
                      handleInputChange("price_per_night", numValue);
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="VD: 500000"
                />
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-300">Tóm tắt thông tin</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5 px-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400">Loại:</span>
                  <span className="font-medium text-emerald-400">
                    {formData.accommodation_type
                      ? ACCOMMODATION_TYPES.find(t => t.value === formData.accommodation_type)?.label || formData.accommodation_type
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400">Khách:</span>
                  <span className="font-medium">
                    {formData.max_guests > 0 ? `${formData.max_guests} người` : "—"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5 px-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400">Phòng:</span>
                  <span className="font-medium">
                    {formData.number_of_rooms > 0 ? formData.number_of_rooms : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400">Giường:</span>
                  <span className="font-medium">
                    {formData.number_of_beds > 0 ? formData.number_of_beds : "—"}
                  </span>
                </div>
              </div>
            </div>

            {formData.price_per_night && formData.price_per_night > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Giá/đêm:</span>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold text-sm">
                      {formData.price_per_night.toLocaleString("vi-VN")} đ
                    </span>
                    <p className="text-gray-500 text-xs mt-0.5">
                      ≈ {(formData.price_per_night / 1000).toFixed(0)}k VNĐ
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-800 bg-gray-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Lưu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}