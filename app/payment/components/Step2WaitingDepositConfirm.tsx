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
      className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-8 text-center transition-all duration-700 ease-out ${
        isInitialLoad ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="relative">
          <Clock size={64} className="text-yellow-400" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
        </div>
        <h2 className="text-2xl font-bold text-white">Đang chờ xác nhận đặt cọc</h2>
        <p className="text-gray-300">
          Chúng tôi đã nhận được chứng minh thanh toán của bạn và đang xử lý.
        </p>
      </div>

      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-300">
          ⏱️ Thời gian xác nhận: <strong>30 phút - 2 giờ</strong> trong giờ làm việc.
        </p>
      </div>

      {booking.deposit_proof_url && (
        <div className="bg-black/30 rounded-lg p-4">
          <h3 className="font-semibold text-gray-300 mb-3">Ảnh chứng minh đã tải lên:</h3>
          <img
            src={booking.deposit_proof_url}
            alt="Proof"
            className="max-w-sm mx-auto rounded-lg border-2 border-white/20"
          />
        </div>
      )}
    </div>
  );
}