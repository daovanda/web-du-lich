import { PartyPopper, FileText, CheckCircle } from "lucide-react";

type Step5Props = {
  booking: {
    booking_code: string | null;
    full_name: string | null;
    phone: string | null;
    date_from: string;
    date_to: string;
    total_price: number | null;
    additional_requests: string | null;
    quantity: number | null;
    services?: {
      title: string;
      type: string | null;
    } | null;
  };
  isInitialLoad: boolean;
};

export default function Step5Completed({ booking, isInitialLoad }: Step5Props) {
  const formatCurrency = (amount?: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div
      className={`bg-gradient-to-br from-green-900/30 to-blue-900/30 backdrop-blur-md border-2 border-green-500/30 rounded-2xl shadow-lg p-8 text-center transition-all duration-700 ease-out ${
        isInitialLoad ? "opacity-0 translate-y-6 scale-95" : "opacity-100 translate-y-0 scale-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping" />
          <PartyPopper size={80} className="text-green-400 relative" />
        </div>
        <h2 className="text-3xl font-bold text-white">Thanh toán thành công!</h2>
        <p className="text-xl text-green-300">
          Đơn hàng <span className="font-bold text-green-400">#{booking.booking_code}</span> đã được
          xác nhận
        </p>
      </div>

      <div className="bg-white/10 rounded-xl p-6 mb-6 max-w-2xl mx-auto">
        <h3 className="font-semibold text-white mb-4 text-lg">📋 Thông tin đơn hàng</h3>
        <div className="space-y-3 text-left">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-gray-300">Dịch vụ:</span>
            <span className="text-white font-semibold">{booking.services?.title}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-gray-300">Khách hàng:</span>
            <span className="text-white font-semibold">{booking.full_name}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-gray-300">Số điện thoại:</span>
            <span className="text-white font-semibold">{booking.phone}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-gray-300">Thời gian:</span>
            <span className="text-white font-semibold">
              {booking.date_from} → {booking.date_to}
            </span>
          </div>
          {booking.quantity && (
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-gray-300">Số lượng:</span>
              <span className="text-white font-semibold">
                {booking.quantity} {booking.services?.type === "motorbike" ? "xe" : "người"}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-2">
            <span className="text-gray-300 text-lg">Tổng thanh toán:</span>
            <span className="text-green-400 font-bold text-xl">
              {formatCurrency(booking.total_price)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
            <FileText size={20} />
            Bước tiếp theo
          </h4>
          <p className="text-sm text-blue-200">
            Chúng tôi sẽ liên hệ với bạn qua số điện thoại <strong>{booking.phone}</strong> để xác
            nhận chi tiết và thời gian nhận dịch vụ.
          </p>
        </div>

        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <h4 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
            <CheckCircle size={20} />
            Trạng thái
          </h4>
          <p className="text-sm text-green-200">
            Đơn hàng đã được xác nhận và sẵn sàng phục vụ. Bạn có thể kiểm tra trạng thái trong trang
            cá nhân.
          </p>
        </div>
      </div>

      {booking.additional_requests && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-yellow-300 mb-2">📝 Yêu cầu đặc biệt:</h4>
          <p className="text-sm text-yellow-200">{booking.additional_requests}</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-6">
        <h4 className="font-bold text-white text-xl mb-3">🙏 Cảm ơn bạn đã tin tưởng!</h4>
        <p className="text-gray-200 mb-4">
          Chúng tôi rất vui được phục vụ bạn. Nếu có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với
          chúng tôi.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="tel:0912345678"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            📞 Gọi hỗ trợ: 0912.345.678
          </a>
          <a
            href="/"
            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition border border-white/20"
          >
            🏠 Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}