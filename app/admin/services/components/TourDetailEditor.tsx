"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TourDetail } from "../types";

type Props = {
  open: boolean;
  serviceId: string;
  existingTour?: TourDetail | null;
  onClose: () => void;
  onSave: () => void;
};

export default function TourDetailEditor({
  open,
  serviceId,
  existingTour,
  onClose,
  onSave,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TourDetail>({
    destination: "",
    duration_days: 1,
    start_date: "",
    end_date: "",
    available_slots: 0,
    guide_name: "chagmihaydi",
    itinerary: {},
  });
  const [itineraryDays, setItineraryDays] = useState<{ day: string; content: string }[]>([
    { day: "day1", content: "" },
  ]);

  useEffect(() => {
    if (open && existingTour) {
      setFormData({
        ...existingTour,
        guide_name: existingTour.guide_name || "chagmihaydi",
      });
      
      if (existingTour.itinerary) {
        const days = Object.entries(existingTour.itinerary).map(([day, content]) => ({
          day,
          content: String(content),
        }));
        setItineraryDays(days.length > 0 ? days : [{ day: "day1", content: "" }]);
      }
    } else if (open) {
      setFormData({
        destination: "",
        duration_days: 1,
        start_date: "",
        end_date: "",
        available_slots: 0,
        guide_name: "chagmihaydi",
        itinerary: {},
      });
      setItineraryDays([{ day: "day1", content: "" }]);
    }
  }, [open, existingTour]);

  useEffect(() => {
    if (formData.start_date && formData.duration_days > 0) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + formData.duration_days - 1);
      
      const endDateStr = endDate.toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, end_date: endDateStr }));
    }
  }, [formData.start_date, formData.duration_days]);

  const handleInputChange = (field: keyof TourDetail, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddDay = () => {
    const nextDayNum = itineraryDays.length + 1;
    setItineraryDays([...itineraryDays, { day: `day${nextDayNum}`, content: "" }]);
  };

  const handleRemoveDay = (index: number) => {
    if (itineraryDays.length <= 1) return;
    setItineraryDays(itineraryDays.filter((_, i) => i !== index));
  };

  const handleDayChange = (index: number, field: "day" | "content", value: string) => {
    const updated = [...itineraryDays];
    updated[index][field] = value;
    setItineraryDays(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const itineraryObj = itineraryDays.reduce((acc, { day, content }) => {
        if (day.trim() && content.trim()) {
          acc[day] = content;
        }
        return acc;
      }, {} as Record<string, string>);

      const tourData = {
        ...formData,
        guide_name: formData.guide_name || "chagmihaydi",
        itinerary: Object.keys(itineraryObj).length > 0 ? itineraryObj : null,
      };

      const { data: existingData } = await supabase
        .from("tours")
        .select("id")
        .eq("id", serviceId)
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from("tours")
          .update(tourData)
          .eq("id", serviceId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tours")
          .insert({ id: serviceId, ...tourData });

        if (error) throw error;
      }

      alert("Đã lưu thông tin tour thành công!");
      onSave();
      onClose();
    } catch (err: any) {
      console.error("Error saving tour:", err);
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
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">
              {existingTour ? "Chỉnh sửa" : "Thêm"} Tour
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Điểm đến <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="VD: Vịnh Hạ Long"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Số ngày <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.duration_days === 0 ? '' : formData.duration_days}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value === '') {
                      handleInputChange("duration_days", 0);
                      return;
                    }
                    const numValue = parseInt(value);
                    if (numValue >= 0 && numValue <= 365) {
                      handleInputChange("duration_days", numValue);
                    }
                  }}
                  onBlur={(e) => {
                    if (formData.duration_days === 0 || e.target.value === '') {
                      handleInputChange("duration_days", 1);
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="1-365"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Ngày khởi hành <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => handleInputChange("start_date", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  readOnly
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Số chỗ trống <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.available_slots === 0 ? '' : formData.available_slots}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value === '') {
                      handleInputChange("available_slots", 0);
                      return;
                    }
                    const numValue = parseInt(value);
                    if (numValue >= 0 && numValue <= 1000) {
                      handleInputChange("available_slots", numValue);
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="0-1000"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Hướng dẫn viên
                </label>
                <input
                  type="text"
                  value={formData.guide_name || "chagmihaydi"}
                  onChange={(e) => handleInputChange("guide_name", e.target.value || "chagmihaydi")}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Tên HDV"
                />
              </div>
            </div>
          </div>

          {/* Itinerary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300">Lịch trình tour</h3>
              <button
                type="button"
                onClick={handleAddDay}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm ngày
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {itineraryDays.map((item, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>

                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={item.day}
                        onChange={(e) => handleDayChange(index, "day", e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder={`day${index + 1}`}
                      />
                      <textarea
                        value={item.content}
                        onChange={(e) => handleDayChange(index, "content", e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px] resize-none"
                        placeholder="Mô tả lịch trình..."
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDay(index)}
                      disabled={itineraryDays.length <= 1}
                      className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
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