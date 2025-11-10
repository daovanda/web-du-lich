import { useState } from "react";
import { X, AlertCircle, CheckCircle, XCircle, Upload, FileText, Clock, DollarSign, Calendar, User, Package, ExternalLink, Image } from "lucide-react";
import { uploadRefundProof } from "../types";

// Import types từ file gốc
type RefundStatus = "not_requested" | "requested" | "approved" | "processing" | "completed" | "rejected";
type Booking = any; // Sử dụng type từ file gốc

interface RefundModalProps {
  booking: Booking;
  onClose: () => void;
  onUpdateRefund: (bookingId: string, status: RefundStatus, refundAmount: number, proofUrl?: string, note?: string) => Promise<void>;
}

export default function RefundModal({ booking, onClose, onUpdateRefund }: RefundModalProps) {
  // Số tiền hoàn trả = tổng số tiền đã thanh toán (readonly)
  const depositPaid = (booking.deposit_status === 'paid' || booking.deposit_proof_url) ? (booking.deposit_amount || 0) : 0;
  const paymentPaid = (booking.payment_status === 'paid' || booking.payment_proof_url) ? ((booking.total_price || 0) - depositPaid) : 0;
  const totalPaid = depositPaid + paymentPaid;
  const refundAmount = totalPaid; // READONLY - bằng tổng số tiền đã thanh toán

  const [proofUrl, setProofUrl] = useState(booking.refund_proof_url || "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const formatPrice = (amount: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB!');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const url = await uploadRefundProof(booking.id, selectedFile);
      setProofUrl(url);
      alert('Upload ảnh thành công!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Lỗi khi upload ảnh: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleAction = async (action: "approve" | "reject") => {
    if (action === "approve" && !proofUrl.trim()) {
      alert("Vui lòng upload hoặc nhập URL chứng từ hoàn trả!");
      return;
    }

    setLoading(true);
    try {
      const newStatus: RefundStatus = action === "approve" ? "completed" : "rejected";
      await onUpdateRefund(booking.id, newStatus, refundAmount, proofUrl, note);
      onClose();
    } catch (error) {
      console.error("Error updating refund:", error);
      alert("Có lỗi xảy ra khi cập nhật hoàn trả!");
    } finally {
      setLoading(false);
    }
  };

  // Collect all payment proof images
  const paymentProofs: Array<{ url: string; label: string; amount: number }> = [];
  if (booking.deposit_proof_url) {
    paymentProofs.push({
      url: booking.deposit_proof_url,
      label: "Minh chứng đặt cọc",
      amount: depositPaid
    });
  }
  if (booking.payment_proof_url) {
    paymentProofs.push({
      url: booking.payment_proof_url,
      label: "Minh chứng thanh toán",
      amount: paymentPaid
    });
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-900/20 to-orange-900/20 backdrop-blur-sm border-b border-red-500/30 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 rounded-xl border border-red-500/30">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Xử lý hoàn trả</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Booking #{booking.booking_code || booking.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Booking Info */}
          <div className="bg-gray-800/50 rounded-xl p-4 space-y-3 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Thông tin đơn hàng
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-gray-400 text-xs">Khách hàng</div>
                  <div className="text-white font-medium">{booking.full_name}</div>
                  <div className="text-gray-400 text-xs">{booking.phone}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-gray-400 text-xs">Dịch vụ</div>
                  <div className="text-white font-medium">{booking.service_title}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-gray-400 text-xs">Yêu cầu lúc</div>
                  <div className="text-white font-medium">{formatDate(booking.refund_requested_at)}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-gray-400 text-xs">Tổng giá trị</div>
                  <div className="text-white font-medium">{formatPrice(booking.total_price)}</div>
                </div>
              </div>
            </div>

            {booking.refund_reason && (
              <div className="pt-3 border-t border-gray-700">
                <div className="text-gray-400 text-xs mb-1">Lý do hủy</div>
                <div className="text-white text-sm bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                  {booking.refund_reason}
                </div>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-500/30">
            <h3 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Thông tin thanh toán
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Đặt cọc đã trả:</span>
                <span className="text-yellow-400 font-semibold">{formatPrice(depositPaid)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Thanh toán còn lại:</span>
                <span className="text-blue-400 font-semibold">{formatPrice(paymentPaid)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                <span className="text-white font-medium">Tổng đã thanh toán:</span>
                <span className="text-green-400 font-bold text-lg">{formatPrice(totalPaid)}</span>
              </div>
            </div>
          </div>

          {/* Payment Proof Images */}
          {paymentProofs.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" />
                Minh chứng thanh toán của khách
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paymentProofs.map((proof, index) => (
                  <div key={index} className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
                    <div 
                      className="aspect-video bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity relative group"
                      onClick={() => setSelectedImage(proof.url)}
                    >
                      <img
                        src={proof.url}
                        alt={proof.label}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="text-xs text-gray-400">{proof.label}</div>
                      <div className="text-sm font-semibold text-white">{formatPrice(proof.amount)}</div>
                      <a
                        href={proof.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Mở trong tab mới
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refund Amount - READONLY */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Số tiền hoàn trả
            </label>
            <div className="relative">
              <input
                type="text"
                value={formatPrice(refundAmount)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white font-semibold cursor-not-allowed"
                disabled
                readOnly
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/50">
                  Tự động
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              💡 Số tiền hoàn trả bằng tổng số tiền khách đã thanh toán
            </p>
          </div>


          {/* Upload Image Section */}
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/30">
            <label className="block text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Chứng từ hoàn trả <span className="text-red-400">*</span>
            </label>

            {/* File Upload */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <div className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:border-purple-500 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">
                      {selectedFile ? selectedFile.name : 'Chọn ảnh chứng từ...'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>

                {selectedFile && (
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/50 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="relative rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-contain"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setProofUrl("");
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}

              {/* Success message after upload */}
              {proofUrl && !selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Đã upload chứng từ thành công!</span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-2">
              💡 Upload ảnh chụp màn hình chuyển khoản hoàn trả cho khách hàng (Max 5MB)
            </p>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ghi chú (không bắt buộc)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Thêm ghi chú về việc hoàn trả..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
            >
              Hủy
            </button>
            
            <button
              onClick={() => handleAction("reject")}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Từ chối
            </button>
            
            <button
              onClick={() => handleAction("approve")}
              disabled={loading || !proofUrl.trim()}
              className="flex-1 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Hoàn trả
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}