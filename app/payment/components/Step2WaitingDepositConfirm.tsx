import { Clock } from "lucide-react";

type Step2Props = {
  booking: {
    deposit_proof_url: string | null;
  };
  isInitialLoad: boolean;
};

export default function Step2WaitingDepositConfirm({ booking, isInitialLoad }: Step2Props) {
  return (
    <div
      className={`bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-700 ease-out ${
        isInitialLoad ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      {/* Header Section */}
      <div className="p-8 text-center bg-gradient-to-b from-yellow-500/5 to-transparent border-b border-neutral-800">
        {/* Animated Clock Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute w-24 h-24 rounded-full bg-yellow-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.4)]">
            <Clock size={40} className="text-white animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-3">
          Đang chờ xác nhận đặt cọc
        </h2>
        
        {/* Description */}
        <p className="text-neutral-400 text-sm max-w-md mx-auto leading-relaxed">
          Chúng tôi đã nhận được chứng minh thanh toán của bạn và đang xử lý
        </p>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-6">
        {/* Processing Info */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white mb-2">Thời gian xử lý</h3>
              <p className="text-sm text-blue-300 leading-relaxed">
                ⏱️ Dự kiến: <span className="font-bold text-blue-200">30 phút - 2 giờ</span> trong giờ làm việc
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                (8:00 - 22:00 hàng ngày)
              </p>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Quy trình xác nhận</h3>
          <div className="space-y-3">
            {[
              { icon: "✅", title: "Đã nhận chứng minh", status: "Hoàn thành", color: "text-green-400" },
              { icon: "🔍", title: "Đang kiểm tra thông tin", status: "Đang xử lý", color: "text-yellow-400" },
              { icon: "⏳", title: "Chờ xác nhận từ admin", status: "Đang chờ", color: "text-neutral-500" }
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-neutral-900/50 rounded-lg">
                <span className="text-2xl">{step.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{step.title}</p>
                  <p className={`text-xs ${step.color}`}>{step.status}</p>
                </div>
                {index === 0 && (
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {index === 1 && (
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Uploaded Proof */}
        {booking.deposit_proof_url && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-semibold text-white">Ảnh chứng minh đã tải lên</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="relative group">
                <img
                  src={booking.deposit_proof_url}
                  alt="Payment Proof"
                  className="w-full max-w-md mx-auto rounded-xl border border-neutral-700 shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
                />
                {/* View Full Size Badge */}
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Nhấn để xem rõ
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="flex items-start gap-3 p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-2">Cần hỗ trợ?</h3>
            <p className="text-xs text-neutral-400 mb-3">
              Nếu sau 2 giờ chưa được xác nhận, vui lòng liên hệ với chúng tôi
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="tel:0912345678"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg text-sm font-semibold text-white transition-all duration-200 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Gọi điện
              </a>
              <a
                href="mailto:support@example.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm font-semibold text-white transition-all duration-200 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-300 mb-2">Lưu ý</h3>
              <ul className="space-y-1.5 text-xs text-green-200">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Bạn sẽ nhận được thông báo khi đặt cọc được xác nhận</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Trang này sẽ tự động cập nhật trạng thái</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Vui lòng không tắt trang cho đến khi hoàn tất</span>
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
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}