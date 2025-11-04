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
  const [copied, setCopied] = useState(false);

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      {/* QR Code */}
      <div
        className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6 transition-all duration-700 ease-out ${
          isInitialLoad ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
        }`}
        style={{ transitionDelay: "100ms" }}
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
            1
          </span>
          Quét mã QR để thanh toán đặt cọc
        </h2>

        <div className="flex justify-center mb-6">
          <img
            src={`https://img.vietqr.io/image/${bankInfo.bankName}-${bankInfo.accountNumber}-compact2.png?amount=${booking.deposit_amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankInfo.accountName)}`}
            alt="QR Code"
            className="w-64 h-64 border-4 border-blue-400/30 rounded-xl"
          />
        </div>

        <div className="space-y-3 bg-black/30 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Ngân hàng:</span>
            <span className="font-semibold text-white">{bankInfo.bankName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Số tài khoản:</span>
            <button
              onClick={() => copyToClipboard(bankInfo.accountNumber)}
              className="flex items-center gap-1 font-mono font-bold text-blue-400 hover:text-blue-300"
            >
              {bankInfo.accountNumber}
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Chủ tài khoản:</span>
            <span className="font-semibold text-white">{bankInfo.accountName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Số tiền đặt cọc:</span>
            <span className="font-bold text-yellow-400 text-lg">
              {formatCurrency(booking.deposit_amount)}
            </span>
          </div>
          <div className="border-t border-white/10 pt-3 mt-3">
            <span className="text-gray-400 text-sm block mb-1">Nội dung chuyển khoản:</span>
            <button
              onClick={() => copyToClipboard(transferContent)}
              className="w-full bg-yellow-500/20 border-2 border-yellow-500/30 rounded-lg p-3 font-mono font-bold text-yellow-300 hover:bg-yellow-500/30 transition flex items-center justify-between"
            >
              {transferContent}
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="mt-4 bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300">
            <strong>Quan trọng:</strong> Vui lòng nhập chính xác nội dung chuyển khoản để chúng tôi
            xác nhận nhanh nhất.
          </p>
        </div>
      </div>

      {/* Upload Proof */}
      <div
        className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6 transition-all duration-700 ease-out ${
          isInitialLoad ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
        }`}
        style={{ transitionDelay: "200ms" }}
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
            2
          </span>
          Tải lên ảnh chứng minh
        </h2>

        <div className="mb-6">
          <label className="block w-full">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                uploading
                  ? "border-gray-500 bg-gray-800/30"
                  : "border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10"
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                  <p className="text-gray-300">Đang tải lên...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload size={48} className="text-gray-400" />
                  <p className="font-semibold text-gray-300">Nhấn để chọn ảnh</p>
                  <p className="text-sm text-gray-500">Hoặc kéo thả file vào đây</p>
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

        <div className="space-y-4">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
              <CheckCircle size={18} />
              Hướng dẫn chụp ảnh:
            </h3>
            <ul className="text-sm text-green-200 space-y-1 ml-6 list-disc">
              <li>Chụp rõ nội dung chuyển khoản</li>
              <li>Hiển thị đầy đủ số tiền</li>
              <li>Hiển thị thời gian giao dịch</li>
              <li>Không bị mờ hoặc bị cắt</li>
            </ul>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-300 mb-2">📞 Cần hỗ trợ?</h3>
            <p className="text-sm text-yellow-200">
              Liên hệ:{" "}
              <a href="tel:0912345678" className="font-bold underline">
                0912.345.678
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}