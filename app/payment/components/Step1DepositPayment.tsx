import { Upload, CheckCircle, AlertCircle, Copy, Check } from "lucide-react";
import { useState } from "react";

type Step1Props = {
  booking: {
    id: string;
    booking_code: string | null;
    deposit_amount: number | null;
  };
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  onFileUpload: (file: File) => Promise<void>;
  uploading: boolean;
  isInitialLoad: boolean;
};

export default function Step1DepositPayment({
  booking,
  bankInfo,
  onFileUpload,
  uploading,
  isInitialLoad,
}: Step1Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const transferContent = `DATCOC ${booking.booking_code}`;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onFileUpload(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 📱 QR Code Section */}
      <div
        className={`bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-700 ease-out ${
          isInitialLoad ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <span className="text-white text-lg font-bold">1</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Quét mã thanh toán</h2>
              <p className="text-xs text-neutral-500">Đặt cọc qua VietQR</p>
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="p-8 flex justify-center bg-neutral-950">
          <div className="relative group">
            {/* QR Image */}
            <div className="relative p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-all duration-300 group-hover:shadow-[0_0_50px_rgba(59,130,246,0.3)]">
              <img
                src={`https://img.vietqr.io/image/${bankInfo.bankName}-${bankInfo.accountNumber}-compact2.png?amount=${booking.deposit_amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankInfo.accountName)}`}
                alt="QR Code"
                className="w-48 h-48 rounded-xl"
              />
            </div>

            {/* Decorative Corners */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-3 border-l-3 border-blue-500 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-3 border-r-3 border-purple-500 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-3 border-l-3 border-purple-500 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-3 border-r-3 border-blue-500 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Bank Info Details */}
        <div className="p-5 space-y-3">
          {/* Amount - Highlighted */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Số tiền đặt cọc</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {formatCurrency(booking.deposit_amount)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-2">
            {/* Bank Name */}
            <div className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
              <span className="text-xs text-neutral-500 uppercase tracking-wide">Ngân hàng</span>
              <span className="text-sm font-semibold text-white">{bankInfo.bankName}</span>
            </div>

            {/* Account Number */}
            <div className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
              <span className="text-xs text-neutral-500 uppercase tracking-wide">Số tài khoản</span>
              <button
                onClick={() => copyToClipboard(bankInfo.accountNumber, 'account')}
                className="flex items-center gap-2 text-sm font-mono font-semibold text-blue-400 hover:text-blue-300 transition-colors group"
              >
                <span>{bankInfo.accountNumber}</span>
                {copied === 'account' ? (
                  <Check size={16} className="text-green-400" />
                ) : (
                  <Copy size={16} className="group-hover:scale-110 transition-transform" />
                )}
              </button>
            </div>

            {/* Account Name */}
            <div className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
              <span className="text-xs text-neutral-500 uppercase tracking-wide">Chủ tài khoản</span>
              <span className="text-sm font-semibold text-white">{bankInfo.accountName}</span>
            </div>
          </div>

          {/* Transfer Content */}
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wide block mb-2">
              Nội dung chuyển khoản
            </label>
            <button
              onClick={() => copyToClipboard(transferContent, 'content')}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-yellow-400 text-base tracking-wider">
                  {transferContent}
                </span>
                <div className="flex items-center gap-2">
                  {copied === 'content' && (
                    <span className="text-xs text-green-400 font-semibold animate-fadeIn">
                      Đã sao chép!
                    </span>
                  )}
                  {copied === 'content' ? (
                    <Check size={18} className="text-green-400" />
                  ) : (
                    <Copy size={18} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Important Notice */}
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <AlertCircle size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300 leading-relaxed">
              Vui lòng nhập <span className="font-bold text-blue-200">chính xác nội dung</span> để hệ thống xác nhận nhanh nhất
            </p>
          </div>
        </div>
      </div>

      {/* 📤 Upload Section */}
      <div
        className={`bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-700 ease-out delay-100 ${
          isInitialLoad ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <span className="text-white text-lg font-bold">2</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Tải lên chứng minh</h2>
              <p className="text-xs text-neutral-500">Ảnh chụp màn hình giao dịch</p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-5">
          <label className="block w-full cursor-pointer">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                uploading
                  ? "border-neutral-700 bg-neutral-900/30"
                  : "border-neutral-700 hover:border-green-500/50 hover:bg-green-500/5"
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-neutral-800 border-t-green-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Upload size={28} className="text-green-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">Đang tải lên...</p>
                    <p className="text-xs text-neutral-500">Vui lòng đợi trong giây lát</p>
                  </div>
                  <div className="w-full max-w-xs h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 animate-progress" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 flex items-center justify-center">
                    <Upload size={32} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white mb-1">Nhấn để chọn ảnh</p>
                    <p className="text-sm text-neutral-400 mb-2">hoặc kéo thả file vào đây</p>
                    <p className="text-xs text-neutral-600">
                      Hỗ trợ: PNG, JPG, JPEG (tối đa 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Guidelines */}
        <div className="p-5 space-y-3">
          {/* Requirements */}
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={18} className="text-green-400" />
              <h3 className="text-sm font-semibold text-green-300">Yêu cầu ảnh chứng minh</h3>
            </div>
            <ul className="space-y-2">
              {[
                "Nội dung chuyển khoản rõ ràng",
                "Số tiền chuyển đầy đủ",
                "Thời gian giao dịch hiển thị",
                "Không bị mờ hoặc che khuất"
              ].map((item, index) => (
                <li key={index} className="text-xs text-green-200 flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Example */}
          <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-1">Ví dụ ảnh đạt chuẩn</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Ảnh chụp màn hình thanh toán từ ứng dụng ngân hàng với đầy đủ thông tin
                </p>
              </div>
            </div>
          </div>

          {/* Support Contact */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-300 mb-2">Cần hỗ trợ?</h3>
                <a 
                  href="tel:0912345678" 
                  className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-200 hover:text-yellow-100 transition-colors group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>0912.345.678</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}