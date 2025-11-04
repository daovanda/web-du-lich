"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type BookingFormWrapperProps = {
  serviceId: string;
  price: string | null | undefined;
  serviceTitle: string;
};

// Parse price from string
const parsePriceNumber = (value?: string | null): number | null => {
  if (!value) return null;
  const onlyNum = value.replace(/[^0-9.,]/g, "").replace(/\./g, "").replace(/,/g, "");
  const parsed = Number(onlyNum);
  return Number.isFinite(parsed) ? parsed : null;
};

// Tính số đêm từ 2 ngày
const countNights = (from: Date | null, to: Date | null) => {
  if (!from || !to) return 0;
  const start = new Date(from);
  const end = new Date(to);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const ms = end.getTime() - start.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
};

export default function BookingFormWrapper({
  serviceId,
  price,
  serviceTitle,
}: BookingFormWrapperProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  
  // Date states for quick calculation
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse price
  const priceNumber = useMemo(() => parsePriceNumber(price), [price]);
  
  // Calculate number of nights
  const nightsNumber = useMemo(() => {
    return countNights(checkInDate, checkOutDate);
  }, [checkInDate, checkOutDate]);
  
  // Calculate quick estimate
  const estimatedTotal = useMemo(() => {
    if (!priceNumber || nightsNumber <= 0) return null;
    return priceNumber * nightsNumber;
  }, [priceNumber, nightsNumber]);
  
  // Calculate deposit estimate (30%)
  const estimatedDeposit = useMemo(() => {
    if (!estimatedTotal) return null;
    return Math.round(estimatedTotal * 0.00003)*10000;
  }, [estimatedTotal]);

  const handleSubmitSuccess = async (formData: any) => {
    // Redirect to payment page after successful booking
    if (formData.bookingId) {
      router.push(`/payment?bookingId=${formData.bookingId}`);
    }
  };

  // Check if dates are valid
  const areDatesValid = checkInDate && checkOutDate && checkInDate >= today && checkOutDate > checkInDate;

  return (
    <section className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-700/50 sticky top-24">
      <h2 className="text-2xl font-bold mb-6">Đặt phòng ngay</h2>
      
      {!showForm ? (
        <>
          {/* Price display */}
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">Giá phòng</p>
            <p className="text-3xl font-bold text-blue-400">
              {priceNumber 
                ? `${priceNumber.toLocaleString("vi-VN")} ₫` 
                : "Liên hệ"}
            </p>
            <p className="text-xs text-gray-500 mt-1">/ đêm</p>
          </div>

          {/* Date picker section */}
          <div className="mb-6 space-y-4">
            {/* Check-in date */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Ngày nhận phòng
              </label>
              <DatePicker
                selected={checkInDate}
                onChange={(date) => {
                  setCheckInDate(date);
                  // Reset checkout if it's before or equal to new checkin
                  if (checkOutDate && date && checkOutDate <= date) {
                    setCheckOutDate(null);
                  }
                }}
                minDate={today}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày nhận phòng"
                className="w-full rounded-lg px-4 py-3 bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
              />
            </div>

            {/* Check-out date */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Ngày trả phòng
              </label>
              <DatePicker
                selected={checkOutDate}
                onChange={(date) => setCheckOutDate(date)}
                minDate={checkInDate ? new Date(checkInDate.getTime() + 86400000) : today}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày trả phòng"
                disabled={!checkInDate}
                className={`w-full rounded-lg px-4 py-3 bg-gray-800 border focus:outline-none ${
                  !checkInDate 
                    ? "border-gray-700 opacity-50 cursor-not-allowed" 
                    : "border-gray-700 focus:border-blue-500 text-white"
                }`}
              />
              {checkInDate && checkOutDate && checkOutDate <= checkInDate && (
                <p className="mt-2 text-sm text-red-400">
                  ⚠️ Ngày trả phòng phải sau ngày nhận phòng
                </p>
              )}
            </div>

            {/* Show number of nights if dates selected */}
            {nightsNumber > 0 && (
              <div className="p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  📅 <strong>{nightsNumber}</strong> đêm
                </p>
              </div>
            )}
          </div>

          {/* Total price summary */}
          {estimatedTotal && areDatesValid && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Tạm tính:</span>
                <span className="font-bold text-xl text-blue-400">
                  {estimatedTotal.toLocaleString("vi-VN")} ₫
                </span>
              </div>
              {estimatedDeposit && (
                <div className="flex justify-between pt-2 border-t border-gray-700">
                  <span className="text-yellow-400 text-sm">Đặt cọc 30%:</span>
                  <span className="font-semibold text-yellow-400">
                    {estimatedDeposit.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Warning for long stays */}
          {nightsNumber > 30 && (
            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                💡 Số lượng lớn. Vui lòng liên hệ để được hỗ trợ tốt nhất.
              </p>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={() => setShowForm(true)}
            disabled={!areDatesValid && priceNumber !== null}
            className={`w-full font-semibold py-4 rounded-xl transition-all shadow-lg ${
              areDatesValid || priceNumber === null
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105"
                : "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
            }`}
          >
            {priceNumber ? "Đặt phòng ngay" : "Liên hệ đặt phòng"}
          </button>

          {!areDatesValid && priceNumber && (
            <p className="mt-2 text-sm text-gray-400 text-center">
              Vui lòng chọn ngày để tiếp tục
            </p>
          )}

          {/* Features */}
          <div className="mt-6 pt-6 border-t border-gray-700 space-y-2 text-sm text-gray-400">
            <p>✓ Miễn phí hủy trong 24h</p>
            <p>✓ Hỗ trợ 24/7</p>
            <p>✓ Đảm bảo chất lượng</p>
            <p>✓ Xác nhận tức thì</p>
          </div>
        </>
      ) : (
        <>
          {/* Back button */}
          <button
            onClick={() => setShowForm(false)}
            className="mb-4 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            ← Quay lại
          </button>

          {/* Reuse BookingForm component - pass selected dates */}
          <BookingForm
            serviceId={serviceId}
            price={price}
            onSubmitSuccess={handleSubmitSuccess}
            initialCheckIn={checkInDate}
            initialCheckOut={checkOutDate}
          />
        </>
      )}
    </section>
  );
}