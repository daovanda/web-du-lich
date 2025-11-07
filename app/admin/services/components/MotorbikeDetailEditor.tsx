"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MotorbikeDetail, BIKE_TYPES, POPULAR_BRANDS } from "../types";

type Props = {
  open: boolean;
  serviceId: string;
  existingMotorbike?: MotorbikeDetail | null;
  onClose: () => void;
  onSave: () => void;
};

export default function MotorbikeDetailEditor({
  open,
  serviceId,
  existingMotorbike,
  onClose,
  onSave,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MotorbikeDetail>({
    brand: "",
    model: "",
    engine_size: 0,
    bike_type: "",
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (open && existingMotorbike) {
      setFormData({
        brand: existingMotorbike.brand || "",
        model: existingMotorbike.model || "",
        engine_size: existingMotorbike.engine_size || 0,
        bike_type: existingMotorbike.bike_type || "",
        year: existingMotorbike.year || new Date().getFullYear(),
      });
    } else if (open) {
      setFormData({
        brand: "",
        model: "",
        engine_size: 0,
        bike_type: "",
        year: new Date().getFullYear(),
      });
    }
  }, [open, existingMotorbike]);

  const handleInputChange = (field: keyof MotorbikeDetail, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const motorbikeData = { ...formData };

      const { data: existingData } = await supabase
        .from("motorbikes")
        .select("id")
        .eq("id", serviceId)
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from("motorbikes")
          .update(motorbikeData)
          .eq("id", serviceId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("motorbikes")
          .insert({ id: serviceId, ...motorbikeData });

        if (error) throw error;
      }

      alert("Đã lưu thông tin xe máy thành công!");
      onSave();
      onClose();
    } catch (err: any) {
      console.error("Error saving motorbike:", err);
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
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gradient-to-r from-cyan-600/10 to-blue-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">
              {existingMotorbike ? "Chỉnh sửa" : "Thêm"} Xe máy
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
                Hãng xe <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                list="brands-list"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                placeholder="Chọn hoặc nhập"
              />
              <datalist id="brands-list">
                {POPULAR_BRANDS.map((brand) => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
              <div className="flex flex-wrap gap-1 mt-2">
                {POPULAR_BRANDS.slice(0, 5).map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleInputChange("brand", brand)}
                    className={`px-2 py-1 text-xs rounded transition ${
                      formData.brand === brand
                        ? "bg-cyan-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Model <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  placeholder="VD: SH150i"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Loại xe <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.bike_type}
                  onChange={(e) => handleInputChange("bike_type", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                >
                  {BIKE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Dung tích (cc) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.engine_size === 0 ? "" : formData.engine_size}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value === "") {
                      handleInputChange("engine_size", 0);
                      return;
                    }
                    const numValue = parseInt(value);
                    if (numValue >= 50 && numValue <= 3000) {
                      handleInputChange("engine_size", numValue);
                    }
                  }}
                  onBlur={(e) => {
                    if (formData.engine_size === 0 || e.target.value === "") {
                      handleInputChange("engine_size", 50);
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  placeholder="50-3000"
                />
              </div>

<div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Năm SX <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="2000"
                  max={new Date().getFullYear()}
                  value={formData.year || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      handleInputChange("year", 0);
                    } else {
                      const numValue = parseInt(value);
                      handleInputChange("year", numValue);
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value);
                    const currentYear = new Date().getFullYear();
                    if (!value || value < 2000) {
                      handleInputChange("year", 2000);
                    } else if (value > currentYear) {
                      handleInputChange("year", currentYear);
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  placeholder={new Date().getFullYear().toString()}
                />
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-300">Thông tin xe</h3>
            </div>
            
            <div className="space-y-2 text-xs">
              {/* Brand and Model */}
              <div className="py-2 px-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400">Xe</span>
                  <span className="font-bold text-cyan-400 text-base">
                    {formData.brand && formData.model
                      ? `${formData.brand} ${formData.model}`
                      : "—"}
                  </span>
                </div>
                {formData.bike_type && (
                  <div className="text-gray-400 text-xs">
                    {BIKE_TYPES.find((t) => t.value === formData.bike_type)?.label}
                  </div>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="py-2 px-2 bg-gray-800/50 rounded text-center">
                  <div className="text-gray-400 text-xs mb-1">Dung tích</div>
                  <div className="font-semibold text-white">
                    {formData.engine_size > 0 ? `${formData.engine_size}cc` : "—"}
                  </div>
                </div>

                <div className="py-2 px-2 bg-gray-800/50 rounded text-center">
                  <div className="text-gray-400 text-xs mb-1">Năm SX</div>
                  <div className="font-semibold text-white">
                    {formData.year > 0 ? formData.year : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Badges */}
          {(formData.brand || formData.model || formData.engine_size > 0) && (
            <div className="flex flex-wrap gap-2">
              {formData.brand && (
                <div className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs text-cyan-400 flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  {formData.brand}
                </div>
              )}
              {formData.engine_size > 0 && (
                <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-blue-400 flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {formData.engine_size}cc
                </div>
              )}
              {formData.year > 0 && (
                <div className="px-3 py-1.5 bg-gray-500/10 border border-gray-500/30 rounded-full text-xs text-gray-400 flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formData.year}
                </div>
              )}
            </div>
          )}
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
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
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