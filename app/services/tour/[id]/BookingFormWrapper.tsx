"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import BookingForm from "@/components/BookingForm";

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

export default function BookingFormWrapper({
  serviceId,
  price,
  serviceTitle,
}: BookingFormWrapperProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [quickCalcPeople, setQuickCalcPeople] = useState("1");

  // Parse price
  const priceNumber = useMemo(() => parsePriceNumber(price), [price]);
  
  // Parse number of people (only for calculation)
  const peopleNumber = useMemo(() => {
    const num = parseInt(quickCalcPeople);
    return isNaN(num) || num < 1 ? 0 : Math.min(num, 999);
  }, [quickCalcPeople]);
  
  // Calculate quick estimate
  const estimatedTotal = useMemo(() => {
    if (!priceNumber || peopleNumber <= 0 || isNaN(parseInt(quickCalcPeople))) return null;
    return priceNumber * peopleNumber;
  }, [priceNumber, peopleNumber, quickCalcPeople]);
  
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

  return (
    <section className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-700/50 sticky top-24">
      <h2 className="text-2xl font-bold mb-6">Đặt tour ngay</h2>
      
      {!showForm ? (
        <>
          {/* Price display */}
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">Giá tour</p>
            <p className="text-3xl font-bold text-blue-400">
              {priceNumber 
                ? `${priceNumber.toLocaleString("vi-VN")} ₫` 
                : "Liên hệ"}
            </p>
            <p className="text-xs text-gray-500 mt-1">/ người</p>
          </div>

          {/* Quick calculator */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Số người</label>
            <input
              type="text"
              value={quickCalcPeople}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty or any numeric input
                setQuickCalcPeople(value);
              }}
              onBlur={(e) => {
                const value = e.target.value.trim();
                // Auto-correct on blur
                if (value === "" || parseInt(value) < 1 || isNaN(parseInt(value))) {
                  setQuickCalcPeople("1");
                } else if (parseInt(value) > 999) {
                  setQuickCalcPeople("999");
                } else {
                  // Remove leading zeros
                  setQuickCalcPeople(String(parseInt(value)));
                }
              }}
              className={`w-full rounded-lg px-4 py-3 focus:outline-none transition-colors ${
                quickCalcPeople && (isNaN(parseInt(quickCalcPeople)) || parseInt(quickCalcPeople) < 1 || parseInt(quickCalcPeople) > 999)
                  ? "bg-gray-800 border-2 border-red-500 text-red-400"
                  : "bg-gray-800 border border-gray-700 focus:border-blue-500"
              }`}
              placeholder="Nhập số người"
            />
            {/* Validation warnings */}
            {quickCalcPeople && isNaN(parseInt(quickCalcPeople)) && (
              <p className="mt-2 text-sm text-red-400">
                ⚠️ Vui lòng chỉ nhập số
              </p>
            )}
            {quickCalcPeople && !isNaN(parseInt(quickCalcPeople)) && parseInt(quickCalcPeople) < 1 && (
              <p className="mt-2 text-sm text-red-400">
                ⚠️ Số người phải lớn hơn 0
              </p>
            )}
            {quickCalcPeople && !isNaN(parseInt(quickCalcPeople)) && parseInt(quickCalcPeople) > 999 && (
              <p className="mt-2 text-sm text-red-400">
                ⚠️ Số người tối đa là 999
              </p>
            )}
            {peopleNumber > 50 && peopleNumber <= 999 && (
              <p className="mt-2 text-sm text-yellow-400">
                💡 Số lượng lớn. Vui lòng liên hệ để được hỗ trợ tốt nhất.
              </p>
            )}
          </div>

          {/* Total price summary */}
          {estimatedTotal && (
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

          {/* CTA Button */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            {priceNumber ? "Đặt tour ngay" : "Liên hệ tư vấn"}
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

          {/* Reuse BookingForm component */}
          <BookingForm
            serviceId={serviceId}
            price={price}
            onSubmitSuccess={handleSubmitSuccess}
            initialQuantity={peopleNumber > 0 ? peopleNumber : 1}
          />
        </>
      )}
    </section>
  );
}