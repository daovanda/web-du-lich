"use client";

import { useMemo, useState } from "react";
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

// Count days (inclusive of start, exclusive of end); if invalid return 0
const countDays = (from: Date | null, to: Date | null) => {
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

  // Quick estimate inputs
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [quickCalcBikes, setQuickCalcBikes] = useState("1");

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Parse price
  const priceNumber = useMemo(() => parsePriceNumber(price), [price]);

  // Parse number of bikes
  const bikesNumber = useMemo(() => {
    const num = parseInt(quickCalcBikes);
    return isNaN(num) || num < 1 ? 0 : Math.min(num, 999);
  }, [quickCalcBikes]);

  // Days between dates
  const days = useMemo(() => countDays(startDate, endDate), [startDate, endDate]);

  // Valid date range
  const validDates = useMemo(() => {
    if (!startDate || !endDate) return false;
    return startDate >= today && endDate >= startDate;
  }, [startDate, endDate, today]);

  // Calculate quick estimate: giá/ngày × số ngày × số xe
  const estimatedTotal = useMemo(() => {
    if (!priceNumber || bikesNumber <= 0 || !validDates || days <= 0) return null;
    return priceNumber * days * bikesNumber;
  }, [priceNumber, bikesNumber, validDates, days]);

  // Deposit estimate (30%)
  const estimatedDeposit = useMemo(() => {
    if (!estimatedTotal) return null;
    const raw = estimatedTotal * 0.3;
    return Math.round(raw / 10000) * 10000; // làm tròn đến 10.000
  }, [estimatedTotal]);

  const handleSubmitSuccess = async (formData: any) => {
    if (formData.bookingId) {
      router.push(`/payment?bookingId=${formData.bookingId}`);
    }
  };

  return (
    <section className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-700/50 sticky top-24">
      <h2 className="text-2xl font-bold mb-6">Đặt xe máy ngay</h2>

      {!showForm ? (
        <>
          {/* Price display */}
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">Giá thuê</p>
            <p className="text-3xl font-bold text-blue-400">
              {priceNumber ? `${priceNumber.toLocaleString("vi-VN")} ₫` : "Liên hệ"}
            </p>
            <p className="text-xs text-gray-500 mt-1">/ ngày / xe</p>
          </div>

          {/* Quick calculator: dates + number of bikes */}
          <div className="mb-6 space-y-4">
            {/* Start date */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ngày nhận xe</label>
              <DatePicker
                selected={startDate}
                onChange={(d) => {
                  setStartDate(d);
                  if (d && endDate && endDate < d) {
                    setEndDate(null);
                  }
                }}
                minDate={today}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày nhận xe"
                className="w-full rounded-lg px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* End date */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ngày trả xe</label>
              <DatePicker
                selected={endDate}
                onChange={(d) => setEndDate(d)}
                minDate={startDate || today}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày trả xe"
                className="w-full rounded-lg px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
              />
              {startDate && endDate && endDate < startDate && (
                <p className="mt-2 text-sm text-red-400">Ngày trả không được sớm hơn ngày nhận.</p>
              )}
            </div>

            {/* Number of bikes */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Số xe</label>
              <input
                type="text"
                value={quickCalcBikes}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuickCalcBikes(value);
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value === "" || parseInt(value) < 1 || isNaN(parseInt(value))) {
                    setQuickCalcBikes("1");
                  } else if (parseInt(value) > 999) {
                    setQuickCalcBikes("999");
                  } else {
                    setQuickCalcBikes(String(parseInt(value)));
                  }
                }}
                className={`w-full rounded-lg px-4 py-3 focus:outline-none transition-colors ${
                  quickCalcBikes &&
                  (isNaN(parseInt(quickCalcBikes)) ||
                    parseInt(quickCalcBikes) < 1 ||
                    parseInt(quickCalcBikes) > 999)
                    ? "bg-gray-800 border-2 border-red-500 text-red-400"
                    : "bg-gray-800 border border-gray-700 focus:border-blue-500"
                }`}
                placeholder="Nhập số xe"
              />
              {quickCalcBikes && isNaN(parseInt(quickCalcBikes)) && (
                <p className="mt-2 text-sm text-red-400">⚠️ Vui lòng chỉ nhập số</p>
              )}
              {quickCalcBikes &&
                !isNaN(parseInt(quickCalcBikes)) &&
                parseInt(quickCalcBikes) < 1 && (
                  <p className="mt-2 text-sm text-red-400">⚠️ Số xe phải lớn hơn 0</p>
                )}
              {quickCalcBikes &&
                !isNaN(parseInt(quickCalcBikes)) &&
                parseInt(quickCalcBikes) > 999 && (
                  <p className="mt-2 text-sm text-red-400">⚠️ Số xe tối đa là 999</p>
                )}
              {bikesNumber > 20 && bikesNumber <= 999 && (
                <p className="mt-2 text-sm text-yellow-400">
                  💡 Số lượng lớn. Vui lòng liên hệ để được hỗ trợ tốt nhất.
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          {priceNumber && validDates && days > 0 && bikesNumber > 0 && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Số ngày:</span>
                <span className="font-semibold">{days}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tạm tính:</span>
                <span className="font-bold text-xl text-blue-400">
                  {(priceNumber * days * bikesNumber).toLocaleString("vi-VN")} ₫
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

          {/* CTA Button */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            {priceNumber ? "Đặt xe ngay" : "Liên hệ tư vấn"}
          </button>

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

          {/* Booking form with initial values: dates + number of bikes */}
          <BookingForm
            serviceId={serviceId}
            price={price}
            onSubmitSuccess={handleSubmitSuccess}
            initialQuantity={bikesNumber > 0 ? bikesNumber : 1}
            initialCheckIn={startDate}
            initialCheckOut={endDate}
          />
        </>
      )}
    </section>
  );
}