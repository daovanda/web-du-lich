"use client";

import { useState } from "react";

type BookingFormWrapperProps = {
  serviceId: string;
  price: string | null | undefined; // ✅ Cho phép null/undefined
  serviceTitle: string;
};

export default function BookingFormWrapper({
  serviceId,
  price,
  serviceTitle,
}: BookingFormWrapperProps) {
  const [numPeople, setNumPeople] = useState(1);

  const handleBooking = () => {
    alert(`Đặt tour: ${serviceTitle} cho ${numPeople} người`);
    // TODO: Implement booking logic
  };

  // ✅ Parse price an toàn
  const priceNumber = price ? parseInt(price) : null;
  const totalPrice = priceNumber ? priceNumber * numPeople : null;

  return (
    <section className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-700/50">
      <h2 className="text-2xl font-bold mb-6">Đặt tour ngay</h2>
      
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-2">Giá tour</p>
        <p className="text-3xl font-bold text-blue-400">
          {priceNumber 
            ? `${priceNumber.toLocaleString("vi-VN")} ₫` 
            : "Liên hệ"}
        </p>
        <p className="text-xs text-gray-500 mt-1">/ người</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Số người</label>
        <input
          type="number"
          min="1"
          value={numPeople}
          onChange={(e) => setNumPeople(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* ✅ Chỉ hiển thị tổng cộng nếu có giá */}
      {totalPrice && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Tổng cộng:</span>
            <span className="font-bold text-xl text-blue-400">
              {totalPrice.toLocaleString("vi-VN")} ₫
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleBooking}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
      >
        {priceNumber ? "Đặt tour ngay" : "Liên hệ tư vấn"}
      </button>

      <div className="mt-6 pt-6 border-t border-gray-700 space-y-2 text-sm text-gray-400">
        <p>✓ Miễn phí hủy trong 24h</p>
        <p>✓ Hỗ trợ 24/7</p>
        <p>✓ Đảm bảo chất lượng</p>
      </div>
    </section>
  );
}