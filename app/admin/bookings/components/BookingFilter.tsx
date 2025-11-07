// components/BookingFilter.tsx
"use client";

import { PAYMENT_STEPS, PaymentStep } from "../types";

interface BookingFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  stepFilter: "all" | "cancelled_no_action" | PaymentStep;
  setStepFilter: (value: "all" | "cancelled_no_action" | PaymentStep) => void;
  stepCounts: Record<string, number>;
}

export default function BookingFilter({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  stepFilter,
  setStepFilter,
  stepCounts,
}: BookingFilterProps) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên, SĐT, mã đơn, dịch vụ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:bg-gray-900 outline-none transition-all"
        />
      </div>

      {/* Booking Status Filter */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
          Trạng thái đơn
        </h3>
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "confirmed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === status
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {status === "all" ? "Tất cả" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Steps Filter */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
          Bước thanh toán
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {/* All button */}
          <button
            onClick={() => setStepFilter("all")}
            className={`relative px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border ${
              stepFilter === "all"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-500 shadow-lg scale-105"
                : "bg-gray-800/50 text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-base">📋</span>
              <span>Tất cả</span>
              {stepCounts && (
                <span className={`absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  stepFilter === "all" 
                    ? 'bg-white text-gray-900' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {Object.values(stepCounts).reduce((sum, count) => sum + count, 0)}
                </span>
              )}
            </div>
          </button>

          {/* Cancelled no action button */}
          <button
            onClick={() => setStepFilter("cancelled_no_action")}
            className={`relative px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border ${
              stepFilter === "cancelled_no_action"
                ? "bg-gray-500/20 text-gray-300 border-gray-500 shadow-lg scale-105"
                : "bg-gray-800/50 text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-base">❌</span>
              <span>Hủy (0đ)</span>
              {stepCounts.cancelled_no_action > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  stepFilter === "cancelled_no_action" 
                    ? 'bg-white text-gray-900' 
                    : 'bg-gray-500 text-white'
                }`}>
                  {stepCounts.cancelled_no_action}
                </span>
              )}
            </div>
          </button>

          {/* Payment steps 1-7 */}
          {Object.values(PAYMENT_STEPS).map((step) => (
            <button
              key={step.id}
              onClick={() => setStepFilter(step.id)}
              className={`relative px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border ${
                stepFilter === step.id
                  ? `${step.bgColor} ${step.color} ${step.borderColor} shadow-lg scale-105`
                  : "bg-gray-800/50 text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-base">
                  {step.id === 1 ? "⏳" : 
                   step.id === 2 ? "⚠️" : 
                   step.id === 3 ? "💰" : 
                   step.id === 4 ? "✅" : 
                   step.id === 5 ? "🎉" :
                   step.id === 6 ? "💳" :
                   "🔄"}
                </span>
                <span>{step.shortLabel}</span>
                {stepCounts[step.id] > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    stepFilter === step.id 
                      ? 'bg-white text-gray-900' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {stepCounts[step.id]}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}