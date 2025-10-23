"use client";

import { useState } from "react";
import { Search, Calendar, X } from "lucide-react"; // Thêm icon X
import { format } from "date-fns";
import { BookingStatus, PayoutStatus } from "../types";

interface BookingFilterProps {
  search: string;
  setSearch: (value: string) => void;

  filterStatus: BookingStatus | "all";
  setFilterStatus: (value: BookingStatus | "all") => void;

  filterPayoutStatus: PayoutStatus | "all";
  setFilterPayoutStatus: (value: PayoutStatus | "all") => void;

  startDate: Date | null;
  setStartDate: (date: Date | null) => void;

  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
}

export function BookingFilter({
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  filterPayoutStatus,
  setFilterPayoutStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: BookingFilterProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return "Chọn ngày";
    return format(date, "dd/MM/yyyy");
  };

  return (
    <div className="space-y-6">
      {/* Ô tìm kiếm */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo tên, SĐT, mã dịch vụ..."
          className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:border-gray-600 focus:outline-none pr-12"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
      </div>

      {/* Bộ lọc trạng thái đơn đặt */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">
          Trạng thái đơn đặt
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all" as const, label: "Tất cả trạng thái" },
            { key: "pending" as const, label: "Chờ xác nhận" },
            { key: "confirmed" as const, label: "Đã xác nhận" },
            { key: "cancelled" as const, label: "Đã hủy" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterStatus(item.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === item.key
                  ? "bg-white text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bộ lọc thanh toán cho Partner */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">
          Thanh toán cho Partner
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all" as const, label: "Tất cả" },
            { key: "pending" as const, label: "Chờ thanh toán" },
            { key: "paid" as const, label: "Đã thanh toán" },
            { key: "failed" as const, label: "Thất bại" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterPayoutStatus(item.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterPayoutStatus === item.key
                  ? "bg-white text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bộ lọc theo ngày */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">
          Thời gian đặt
        </h3>
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white text-left flex items-center justify-between focus:border-gray-600 focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              {startDate && endDate
                ? `${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}`
                : "Chọn khoảng thời gian"}
            </span>

            {/* Nút X – ĐÃ SỬA: dùng <span> thay vì <button> */}
            {(startDate || endDate) && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setStartDate(null);
                  setEndDate(null);
                }}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white cursor-pointer transition-colors"
                title="Xóa khoảng thời gian"
              >
                <X className="w-4 h-4" />
              </span>
            )}
          </button>

          {/* Date Picker */}
          {showDatePicker && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-black border border-gray-800 rounded-lg p-4 z-10 shadow-xl">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Từ ngày</label>
                  <input
                    type="date"
                    value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setStartDate(e.target.value ? new Date(e.target.value) : null)
                    }
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Đến ngày</label>
                  <input
                    type="date"
                    value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setEndDate(e.target.value ? new Date(e.target.value) : null)
                    }
                    min={startDate ? format(startDate, "yyyy-MM-dd") : undefined}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}