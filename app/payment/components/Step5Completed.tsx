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
      className={`bg-neutral-950 border-2 border-green-500/30 rounded-2xl overflow-hidden transition-all duration-700 ease-out ${
        isInitialLoad ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100"
      }`}
    >
      {/* Success Header */}
      <div className="p-8 text-center bg-gradient-to-b from-green-500/10 to-transparent border-b border-neutral-800">
        {/* Animated Success Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute w-32 h-32 rounded-full bg-green-500/20 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.5)]">
            <PartyPopper size={48} className="text-white" />
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold text-white mb-3">
          🎉 Thanh toán thành công!
        </h2>
        
        <p className="text-lg text-green-300 mb-2">
          Đơn hàng <span className="font-bold text-green-400">#{booking.booking_code}</span> đã được xác nhận
        </p>
        
        <p className="text-sm text-neutral-400">
          Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi
        </p>
      </div>

      {/* Booking Details */}
      <div className="p-6 space-y-6">
        {/* Order Summary */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-neutral-800 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-blue-400" />
              <h3 className="text-base font-semibold text-white">Thông tin đơn hàng</h3>
            </div>
          </div>
          
          <div className="p-5 space-y-3">
            {/* Service */}
            <div className="flex items-start justify-between p-3 bg-neutral-900/50 rounded-lg">
              <span className="text-sm text-neutral-500">Dịch vụ</span>
              <span className="text-sm font-semibold text-white text-right max-w-[60%]">
                {booking.services?.title}
              </span>
            </div>

            {/* Customer */}
            <div className="flex items-start justify-between p-3 bg-neutral-900/50 rounded-lg">
              <span className="text-sm text-neutral-500">Khách hàng</span>
              <span className="text-sm font-semibold text-white">{booking.full_name}</span>
            </div>

            {/* Phone */}
            <div className="flex items-start justify-between p-3 bg-neutral-900/50 rounded-lg">
              <span className="text-sm text-neutral-500">Số điện thoại</span>
              <a 
                href={`tel:${booking.phone}`}
                className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                {booking.phone}
              </a>
            </div>

            {/* Date */}
            <div className="flex items-start justify-between p-3 bg-neutral-900/50 rounded-lg">
              <span className="text-sm text-neutral-500">Thời gian</span>
              <span className="text-sm font-semibold text-white text-right">
                {booking.date_from} → {booking.date_to}
              </span>
            </div>

            {/* Quantity */}
            {booking.quantity && (
              <div className="flex items-start justify-between p-3 bg-neutral-900/50 rounded-lg">
                <span className="text-sm text-neutral-500">Số lượng</span>
                <span className="text-sm font-semibold text-white">
                  {booking.quantity} {booking.services?.type === "motorbike" ? "xe" : "người"}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="pt-3 border-t border-neutral-800">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                <span className="text-base font-semibold text-white">Tổng thanh toán</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {formatCurrency(booking.total_price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Requests */}
        {booking.additional_requests && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-300 mb-2">Yêu cầu đặc biệt</h4>
                <p className="text-sm text-yellow-200 leading-relaxed">{booking.additional_requests}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Next Steps */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-300 mb-2">Bước tiếp theo</h4>
                <p className="text-xs text-blue-200 leading-relaxed">
                  Chúng tôi sẽ liên hệ với bạn qua số điện thoại{" "}
                  <span className="font-bold text-blue-100">{booking.phone}</span>{" "}
                  để xác nhận chi tiết và thời gian nhận dịch vụ
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-green-300 mb-2">Trạng thái</h4>
                <p className="text-xs text-green-200 leading-relaxed">
                  Đơn hàng đã được xác nhận và sẵn sàng phục vụ. Bạn có thể kiểm tra trạng thái trong trang cá nhân
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Thank You Section */}
        <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 border border-purple-500/20 rounded-xl p-6">
          <div className="text-center mb-5">
            <h4 className="text-xl font-bold text-white mb-2">🙏 Cảm ơn bạn đã tin tưởng!</h4>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Chúng tôi rất vui được phục vụ bạn. Nếu có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:0912345678"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-blue-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Gọi hỗ trợ
            </a>
            <a
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold px-6 py-3 rounded-xl border border-neutral-700 transition-all duration-200 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Về trang chủ
            </a>
          </div>
        </div>

        {/* Success Tips */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-300 mb-2">Lưu ý quan trọng</h3>
              <ul className="space-y-2 text-xs text-green-200">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Vui lòng giữ điện thoại để nhận cuộc gọi xác nhận từ chúng tôi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Bạn sẽ nhận được email xác nhận chi tiết trong vài phút</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Mang theo CMND/CCCD khi nhận dịch vụ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Đến đúng giờ để tránh ảnh hưởng lịch trình</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}