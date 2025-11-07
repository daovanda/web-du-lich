"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CarDetail, VEHICLE_TYPES, POPULAR_LOCATIONS } from "../types";

type Props = {
  open: boolean;
  serviceId: string;
  existingCar?: CarDetail | null;
  onClose: () => void;
  onSave: () => void;
};

export default function CarDetailEditor({
  open,
  serviceId,
  existingCar,
  onClose,
  onSave,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CarDetail>({
    route: "",
    departure_location: "",
    arrival_location: "",
    seats: 16,
    vehicle_type: "bus",
    departure_time: null,
    arrival_time: null,
    duration_hours: null,
  });

  useEffect(() => {
    if (open && existingCar) {
      setFormData({
        route: existingCar.route || "",
        departure_location: existingCar.departure_location || "",
        arrival_location: existingCar.arrival_location || "",
        seats: existingCar.seats || 16,
        vehicle_type: existingCar.vehicle_type || "bus",
        departure_time: existingCar.departure_time || null,
        arrival_time: existingCar.arrival_time || null,
        duration_hours: existingCar.duration_hours || null,
      });
    } else if (open) {
      setFormData({
        route: "",
        departure_location: "",
        arrival_location: "",
        seats: 16,
        vehicle_type: "bus",
        departure_time: null,
        arrival_time: null,
        duration_hours: null,
      });
    }
  }, [open, existingCar]);

  // Auto-calculate duration_hours
  useEffect(() => {
    if (formData.departure_time && formData.arrival_time) {
      const [depHours, depMins] = formData.departure_time.split(":").map(Number);
      const [arrHours, arrMins] = formData.arrival_time.split(":").map(Number);

      const depTotalMinutes = depHours * 60 + depMins;
      const arrTotalMinutes = arrHours * 60 + arrMins;

      let durationMinutes = arrTotalMinutes - depTotalMinutes;

      if (durationMinutes < 0) {
        durationMinutes += 24 * 60;
      }

      const durationHours = durationMinutes / 60;
      setFormData((prev) => ({
        ...prev,
        duration_hours: parseFloat(durationHours.toFixed(1)),
      }));
    } else if (!formData.departure_time || !formData.arrival_time) {
      setFormData((prev) => ({ ...prev, duration_hours: null }));
    }
  }, [formData.departure_time, formData.arrival_time]);

  const handleInputChange = (field: keyof CarDetail, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const carData = {
        ...formData,
        duration_hours:
          formData.duration_hours && formData.duration_hours > 0
            ? formData.duration_hours
            : null,
      };

      const { data: existingData } = await supabase
        .from("cars")
        .select("id")
        .eq("id", serviceId)
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from("cars")
          .update(carData)
          .eq("id", serviceId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cars")
          .insert({ id: serviceId, ...carData });

        if (error) throw error;
      }

      alert("Đã lưu thông tin xe thành công!");
      onSave();
      onClose();
    } catch (err: any) {
      console.error("Error saving car:", err);
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
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gradient-to-r from-orange-600/10 to-red-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">
              {existingCar ? "Chỉnh sửa" : "Thêm"} Xe
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
          {/* Route Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Tuyến đường <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.route}
                onChange={(e) => handleInputChange("route", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="VD: Hà Nội - Hải Phòng"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Điểm khởi hành <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.departure_location}
                  onChange={(e) => handleInputChange("departure_location", e.target.value)}
                  list="departure-locations"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="Chọn hoặc nhập"
                />
                <datalist id="departure-locations">
                  {POPULAR_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
                <div className="flex flex-wrap gap-1 mt-2">
                  {POPULAR_LOCATIONS.slice(0, 4).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleInputChange("departure_location", loc)}
                      className={`px-2 py-1 text-xs rounded transition ${
                        formData.departure_location === loc
                          ? "bg-orange-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Điểm đến <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.arrival_location}
                  onChange={(e) => handleInputChange("arrival_location", e.target.value)}
                  list="arrival-locations"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="Chọn hoặc nhập"
                />
                <datalist id="arrival-locations">
                  {POPULAR_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
                <div className="flex flex-wrap gap-1 mt-2">
                  {POPULAR_LOCATIONS.slice(0, 4).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleInputChange("arrival_location", loc)}
                      className={`px-2 py-1 text-xs rounded transition ${
                        formData.arrival_location === loc
                          ? "bg-orange-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Loại xe <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.vehicle_type}
                onChange={(e) => handleInputChange("vehicle_type", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              >
                {VEHICLE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Số chỗ ngồi <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={formData.seats === 0 ? "" : formData.seats}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value === "") {
                    handleInputChange("seats", 0);
                    return;
                  }
                  const numValue = parseInt(value);
                  if (numValue >= 1 && numValue <= 50) {
                    handleInputChange("seats", numValue);
                  }
                }}
                onBlur={(e) => {
                  if (formData.seats === 0 || e.target.value === "") {
                    handleInputChange("seats", 16);
                  }
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="1-50"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Giờ khởi hành
              </label>
              <input
                type="time"
                value={formData.departure_time || ""}
                onChange={(e) => handleInputChange("departure_time", e.target.value || null)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Giờ đến ước tính
              </label>
              <input
                type="time"
                value={formData.arrival_time || ""}
                onChange={(e) => handleInputChange("arrival_time", e.target.value || null)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Thời gian (giờ)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={
                  formData.duration_hours === null
                    ? ""
                    : formData.duration_hours.toString()
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, "");
                  if (value === "") {
                    handleInputChange("duration_hours", null);
                    return;
                  }
                  const numValue = parseFloat(value);
                  if (numValue > 0 && numValue <= 100) {
                    handleInputChange("duration_hours", numValue);
                  }
                }}
                readOnly={!!(formData.departure_time && formData.arrival_time)}
                className={`w-full border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                  formData.departure_time && formData.arrival_time
                    ? "bg-gray-900 text-gray-500 cursor-not-allowed"
                    : "bg-gray-800"
                }`}
                placeholder="Tự động"
              />
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-300">Tóm tắt chuyến xe</h3>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 px-2 bg-gray-800/50 rounded">
                <span className="text-gray-400">Tuyến:</span>
                <span className="font-medium text-orange-400">
                  {formData.route || "—"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="py-1.5 px-2 bg-gray-800/50 rounded">
                  <div className="text-gray-400 mb-1">Điểm đi</div>
                  <div className="font-medium text-sm">
                    {formData.departure_location || "—"}
                  </div>
                  {formData.departure_time && (
                    <div className="text-orange-400 text-xs mt-0.5">
                      {formData.departure_time}
                    </div>
                  )}
                </div>

                <div className="py-1.5 px-2 bg-gray-800/50 rounded">
                  <div className="text-gray-400 mb-1">Điểm đến</div>
                  <div className="font-medium text-sm">
                    {formData.arrival_location || "—"}
                  </div>
                  {formData.arrival_time && (
                    <div className="text-orange-400 text-xs mt-0.5">
                      {formData.arrival_time}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="py-1.5 px-2 bg-gray-800/50 rounded text-center">
                  <div className="text-gray-400 text-xs">Loại xe</div>
                  <div className="font-medium mt-0.5">
                    {VEHICLE_TYPES.find((t) => t.value === formData.vehicle_type)?.label || "—"}
                  </div>
                </div>

                <div className="py-1.5 px-2 bg-gray-800/50 rounded text-center">
                  <div className="text-gray-400 text-xs">Số chỗ</div>
                  <div className="font-medium mt-0.5">
                    {formData.seats > 0 ? formData.seats : "—"}
                  </div>
                </div>

                <div className="py-1.5 px-2 bg-gray-800/50 rounded text-center">
                  <div className="text-gray-400 text-xs">Thời gian</div>
                  <div className="font-medium mt-0.5">
                    {formData.duration_hours ? `${formData.duration_hours}h` : "—"}
                  </div>
                </div>
              </div>
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
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
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