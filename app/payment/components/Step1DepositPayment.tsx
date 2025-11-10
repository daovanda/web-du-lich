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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* QR Code Section */}
      <div
        className={`bg-black border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-700 ease-out ${
          isInitialLoad ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
        }`}
        style={{ transitionDelay: "100ms" }}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
              1
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Quét mã thanh toán</h2>
              <p className="text-xs text-neutral-400">Đặt cọc qua VietQR</p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="p-6 flex justify-center bg-gradient-to-b from-neutral-900 to-black">
          <div className="relative">
            <img
              src={`https://img.vietqr.io/image/${bankInfo.bankName}-${bankInfo.accountNumber}-compact2.png?amount=${booking.deposit_amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankInfo.accountName)}`}
              alt="QR Code"
              className="w-56 h-56 rounded-2xl shadow-2xl shadow-blue-500/20"
            />
            {/* Decorative corners */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-blue-500 rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-blue-500 rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-blue-500 rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-blue-500 rounded-br-xl" />
          </div>
        </div>

        {/* Bank Info */}
        <div className="p-4 space-y-3">
          {/* Amount - Featured */}
          <div className="p-4 bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-300 font-medium">Số tiền đặt cọc</span>
              <div className="text-right">
                <div className="text-xl font-bold text-white">
                  {formatCurrency(booking.deposit_amount)}
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 px-3 bg-neutral-900/50 rounded-lg">
              <span className="text-xs text-neutral-400">Ngân hàng</span>
              <span className="text-sm font-semibold text-white">{bankInfo.bankName}</span>
            </div>

            <div className="flex items-center justify-between py-2 px-3 bg-neutral-900/50 rounded-lg">
              <span className="text-xs text-neutral-400">Số tài khoản</span>
              <button
                onClick={() => copyToClipboard(bankInfo.accountNumber, 'account')}
                className="flex items-center gap-2 text-sm font-mono font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                {bankInfo.accountNumber}
                {copied === 'account' ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between py-2 px-3 bg-neutral-900/50 rounded-lg">
              <span className="text-xs text-neutral-400">Chủ tài khoản</span>
              <span className="text-sm font-semibold text-white">{bankInfo.accountName}</span>
            </div>
          </div>

          {/* Transfer Content */}
          <div className="pt-2">
            <label className="text-xs text-neutral-400 block mb-2">Nội dung chuyển khoản</label>
            <button
              onClick={() => copyToClipboard(transferContent, 'content')}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-600/20 to-amber-500/10 hover:from-amber-600/30 hover:to-amber-500/20 border border-amber-500/30 rounded-xl p-3 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-amber-300 text-sm">{transferContent}</span>
                <div className="flex items-center gap-2">
                  {copied === 'content' && (
                    <span className="text-xs text-emerald-400 font-medium">Đã sao chép!</span>
                  )}
                  {copied === 'content' ? (
                    <Check size={16} className="text-emerald-400" />
                  ) : (
                    <Copy size={16} className="text-amber-400" />
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">
              Vui lòng nhập <span className="font-semibold">chính xác nội dung</span> để xác nhận nhanh nhất
            </p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div
        className={`bg-black border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-700 ease-out ${
          isInitialLoad ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
        }`}
        style={{ transitionDelay: "200ms" }}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
              2
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Tải lên chứng minh</h2>
              <p className="text-xs text-neutral-400">Ảnh chụp màn hình giao dịch</p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-4">
          <label className="block w-full">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                uploading
                  ? "border-neutral-700 bg-neutral-900/50"
                  : "border-neutral-700 hover:border-blue-500/50 hover:bg-blue-500/5"
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-neutral-800 border-t-blue-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Upload size={24} className="text-blue-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white mb-1">Đang tải lên...</p>
                    <p className="text-xs text-neutral-400">Vui lòng đợi</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    <Upload size={28} className="text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">Nhấn để chọn ảnh</p>
                    <p className="text-xs text-neutral-400">hoặc kéo thả file vào đây</p>
                    <p className="text-xs text-neutral-500 mt-2">PNG, JPG (tối đa 10MB)</p>
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
        <div className="p-4 space-y-3">
          {/* Do's */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-emerald-400" />
              <h3 className="text-xs font-semibold text-emerald-300">Ảnh cần có:</h3>
            </div>
            <ul className="space-y-1.5 ml-6">
              <li className="text-xs text-emerald-200 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Nội dung chuyển khoản rõ ràng</span>
              </li>
              <li className="text-xs text-emerald-200 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Số tiền chuyển đầy đủ</span>
              </li>
              <li className="text-xs text-emerald-200 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Thời gian giao dịch</span>
              </li>
              <li className="text-xs text-emerald-200 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Không bị mờ hoặc che khuất</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-amber-300 mb-1">Cần hỗ trợ?</h3>
                <a 
                  href="tel:0912345678" 
                  className="text-sm font-semibold text-amber-200 hover:text-amber-100 transition-colors inline-flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  0912.345.678
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}