"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type TourDetail = {
  destination: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  available_slots: number;
  guide_name: string | null;
  itinerary: Record<string, string> | null;
};

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
    guide_name: "chagmihaydi", // Giá trị mặc định
    itinerary: {},
  });
  const [itineraryDays, setItineraryDays] = useState<{ day: string; content: string }[]>([
    { day: "day1", content: "" },
  ]);

  // Load existing tour data
  useEffect(() => {
    if (open && existingTour) {
      setFormData({
        ...existingTour,
        guide_name: existingTour.guide_name || "chagmihaydi", // Đảm bảo luôn có giá trị mặc định
      });
      
      // Convert itinerary object to array
      if (existingTour.itinerary) {
        const days = Object.entries(existingTour.itinerary).map(([day, content]) => ({
          day,
          content: String(content),
        }));
        setItineraryDays(days.length > 0 ? days : [{ day: "day1", content: "" }]);
      }
    } else if (open) {
      // Reset form for new tour
      setFormData({
        destination: "",
        duration_days: 1,
        start_date: "",
        end_date: "",
        available_slots: 0,
        guide_name: "chagmihaydi", // Giá trị mặc định cho tour mới
        itinerary: {},
      });
      setItineraryDays([{ day: "day1", content: "" }]);
    }
  }, [open, existingTour]);

  // Auto-calculate end_date based on start_date and duration
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
    if (itineraryDays.length <= 1) return; // Keep at least 1 day
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
      // Convert itinerary array to object
      const itineraryObj = itineraryDays.reduce((acc, { day, content }) => {
        if (day.trim() && content.trim()) {
          acc[day] = content;
        }
        return acc;
      }, {} as Record<string, string>);

      const tourData = {
        ...formData,
        guide_name: formData.guide_name || "chagmihaydi", // Đảm bảo luôn có giá trị
        itinerary: Object.keys(itineraryObj).length > 0 ? itineraryObj : null,
      };

      // Check if tour exists
      const { data: existingData } = await supabase
        .from("tours")
        .select("id")
        .eq("id", serviceId)
        .maybeSingle();

      if (existingData) {
        // Update
        const { error } = await supabase
          .from("tours")
          .update(tourData)
          .eq("id", serviceId);

        if (error) throw error;
      } else {
        // Insert
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
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] px-4 py-8">
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white w-full max-w-4xl rounded-3xl shadow-2xl border border-neutral-700 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-700 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              {existingTour ? "Chỉnh sửa" : "Thêm"} thông tin Tour
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
              disabled={loading}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Điểm đến <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition"
                  placeholder="VD: Vịnh Hạ Long"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Số ngày <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.duration_days === 0 ? '' : formData.duration_days}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Chỉ cho phép số
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
                    // Khi blur, nếu giá trị là 0 hoặc rỗng thì set về 1
                    if (formData.duration_days === 0 || e.target.value === '') {
                      handleInputChange("duration_days", 1);
                    }
                  }}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Nhập số ngày (1-365)"
                />
                <p className="text-xs text-gray-500 mt-1">Nhập trực tiếp số ngày từ 1 đến 365</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Ngày khởi hành <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => handleInputChange("start_date", e.target.value)}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Ngày kết thúc <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  readOnly
                  className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
                  title="Tự động tính dựa trên ngày khởi hành và số ngày"
                />
                <p className="text-xs text-gray-500 mt-1">Tự động tính dựa trên ngày khởi hành</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Số chỗ trống <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.available_slots === 0 ? '' : formData.available_slots}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Chỉ cho phép số
                    if (value === '') {
                      handleInputChange("available_slots", 0);
                      return;
                    }
                    const numValue = parseInt(value);
                    if (numValue >= 0 && numValue <= 1000) {
                      handleInputChange("available_slots", numValue);
                    }
                  }}
                  onBlur={(e) => {
                    // Khi blur, nếu giá trị rỗng thì set về 0
                    if (e.target.value === '') {
                      handleInputChange("available_slots", 0);
                    }
                  }}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Nhập số chỗ (0-1000)"
                />
                <p className="text-xs text-gray-500 mt-1">Nhập trực tiếp số chỗ trống từ 0 đến 1000</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Hướng dẫn viên
                </label>
                <input
                  type="text"
                  value={formData.guide_name || "chagmihaydi"}
                  onChange={(e) => handleInputChange("guide_name", e.target.value || "chagmihaydi")}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition"
                  placeholder="VD: Nguyễn Văn A"
                />
                <p className="text-xs text-gray-500 mt-1">Mặc định: chagmihaydi</p>
              </div>
            </div>
          </div>

          {/* Itinerary */}
          <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Lịch trình tour</h3>
              <button
                type="button"
                onClick={handleAddDay}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm ngày
              </button>
            </div>

            <div className="space-y-4">
              {itineraryDays.map((item, index) => (
                <div key={index} className="bg-neutral-700/50 rounded-xl p-4 border border-neutral-600">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold shadow-lg">
                      {index + 1}
                    </div>

                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={item.day}
                        onChange={(e) => handleDayChange(index, "day", e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        placeholder={`day${index + 1}`}
                      />
                      <textarea
                        value={item.content}
                        onChange={(e) => handleDayChange(index, "content", e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-h-[80px] resize-y"
                        placeholder="Mô tả chi tiết lịch trình ngày này..."
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDay(index)}
                      disabled={itineraryDays.length <= 1}
                      className="flex-shrink-0 text-red-400 hover:text-red-300 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title={itineraryDays.length <= 1 ? "Phải có ít nhất 1 ngày" : "Xóa ngày này"}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {itineraryDays.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>Chưa có lịch trình nào. Nhấn "Thêm ngày" để bắt đầu.</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
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
                  Lưu thông tin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}