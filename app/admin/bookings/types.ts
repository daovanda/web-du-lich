// types.ts - CẬP NHẬT với 7 bước thanh toán
export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type DepositStatus = "unpaid" | "paid" | "refunded";
export type PaymentMethod = "cash" | "credit_card" | "momo" | "zalopay" | "bank_transfer";
export type PayoutStatus = "pending" | "paid" | "failed";
export type RefundStatus = "not_requested" | "requested" | "approved" | "processing" | "completed" | "rejected";

// 7 bước thanh toán
export type PaymentStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface PaymentStepConfig {
  id: PaymentStep;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const PAYMENT_STEPS: Record<PaymentStep, PaymentStepConfig> = {
  1: {
    id: 1,
    label: "Chờ đặt cọc",
    shortLabel: "Chờ cọc",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/50",
    description: "Khách chưa upload minh chứng đặt cọc"
  },
  2: {
    id: 2,
    label: "Xác nhận đặt cọc",
    shortLabel: "XN cọc",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/50",
    description: "Đã upload, chờ admin xác nhận cọc"
  },
  3: {
    id: 3,
    label: "Chờ thanh toán full",
    shortLabel: "Chờ TT",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/50",
    description: "Cọc đã paid, chờ thanh toán phần còn lại"
  },
  4: {
    id: 4,
    label: "Xác nhận thanh toán",
    shortLabel: "XN TT",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/50",
    description: "Đã upload proof thanh toán, chờ admin xác nhận"
  },
  5: {
    id: 5,
    label: "Đã thanh toán đầy đủ",
    shortLabel: "Đã TT",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/50",
    description: "Khách đã thanh toán đầy đủ, chờ sử dụng dịch vụ"
  },
  6: {
    id: 6,
    label: "Sẵn sàng thanh toán đối tác",
    shortLabel: "TT Partner",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/50",
    description: "Khách đã sử dụng dịch vụ, sẵn sàng thanh toán cho đối tác"
  },
  7: {
    id: 7,
    label: "Yêu cầu hoàn trả",
    shortLabel: "Hoàn trả",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/50",
    description: "Booking đã hủy, đang yêu cầu hoàn trả tiền"
  }
};

export interface Booking {
  id: string;
  user_id: string | null;
  service_id: string | null;
  date_from: string | null;
  date_to: string | null;
  status: BookingStatus;
  created_at: string;
  full_name: string | null;
  phone: string | null;
  additional_requests: string | null;
  total_price: number | null;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  booking_code: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  notes: string | null;
  
  // Deposit fields
  deposit_status: DepositStatus;
  deposit_amount: number | null;
  deposit_percentage: number | null;
  deposit_proof_url: string | null;
  deposit_paid_at: string | null;
  deposit_payment_method: PaymentMethod | null;
  
  // Payment proof
  payment_proof_url: string | null;
  
  // Payout
  payout_status: PayoutStatus;
  payout_proof_url: string | null;
  
  // Refund fields
  refund_status: RefundStatus;
  refund_amount: number | null;
  refund_proof_url: string | null;
  refund_requested_at: string | null;
  refund_processed_at: string | null;
  refund_reason: string | null;
  
  // Quantity
  quantity: number | null;
  
  // Joined data
  user_full_name: string | null;
  user_avatar_url: string | null;
  service_title: string | null;
  service_type: string | null;
  service_image_url: string | null;
}

/**
 * Kiểm tra xem khách đã sử dụng dịch vụ chưa
 * Điều kiện: Ngày hiện tại > date_to (ngày kết thúc dịch vụ)
 */
export function hasUsedService(booking: Booking): boolean {
  if (!booking.date_to) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset về đầu ngày để so sánh chính xác
  
  const serviceEndDate = new Date(booking.date_to);
  serviceEndDate.setHours(0, 0, 0, 0);
  
  // Ngày hiện tại phải lớn hơn ngày kết thúc dịch vụ
  return today > serviceEndDate;
}

/**
 * Kiểm tra xem booking có sẵn sàng thanh toán cho đối tác không
 * Điều kiện:
 * 1. payment_status === 'paid' (đã thanh toán đầy đủ)
 * 2. Đã sử dụng dịch vụ (ngày hiện tại > date_to)
 * 3. Booking không bị hủy
 */
export function isReadyForPartnerPayout(booking: Booking): boolean {
  const isPaymentCompleted = booking.payment_status === 'paid';
  const isServiceUsed = hasUsedService(booking);
  const isNotCancelled = booking.status !== 'cancelled';
  
  return isPaymentCompleted && isServiceUsed && isNotCancelled;
}

/**
 * Kiểm tra xem booking có đủ điều kiện để yêu cầu hoàn trả không
 * Điều kiện:
 * 1. Booking phải ở trạng thái "cancelled"
 * 2. Refund status phải là "requested"
 * 3. Phải có bằng chứng đã thanh toán tiền (một trong các điều kiện sau):
 *    - Có deposit_proof_url (đã upload minh chứng đặt cọc)
 *    - Có payment_proof_url (đã upload minh chứng thanh toán)
 *    - deposit_status === 'paid' (admin đã xác nhận đặt cọc)
 *    - payment_status === 'paid' (admin đã xác nhận thanh toán)
 */
export function isRefundEligible(booking: Booking): boolean {
  // Điều kiện 1: Booking phải bị hủy
  const isCancelled = booking.status === 'cancelled';
  
  // Điều kiện 2: Refund status phải là "requested"
  const isRefundRequested = booking.refund_status === 'requested';
  
  // Điều kiện 3: Phải có bằng chứng đã thanh toán tiền
  const hasDepositProof = !!booking.deposit_proof_url;
  const hasPaymentProof = !!booking.payment_proof_url;
  const isDepositPaid = booking.deposit_status === 'paid';
  const isPaymentPaid = booking.payment_status === 'paid';
  
  const hasPaymentEvidence = hasDepositProof || hasPaymentProof || isDepositPaid || isPaymentPaid;
  
  return isCancelled && isRefundRequested && hasPaymentEvidence;
}

/**
 * Kiểm tra xem booking có thể tạo yêu cầu hoàn trả không
 * (Chỉ khác là không cần refund_status === 'requested' vì đang tạo mới)
 */
export function canRequestRefund(booking: Booking): boolean {
  // Điều kiện 1: Booking phải bị hủy
  const isCancelled = booking.status === 'cancelled';
  
  // Điều kiện 2: có yêu cầu hoàn trả hoặc bị từ chối
  const canRequest = booking.refund_status === 'requested';
  
  // Điều kiện 3: Phải có bằng chứng đã thanh toán tiền
  const hasDepositProof = !!booking.deposit_proof_url;
  const hasPaymentProof = !!booking.payment_proof_url;
  const isDepositPaid = booking.deposit_status === 'paid';
  const isPaymentPaid = booking.payment_status === 'paid';
  
  const hasPaymentEvidence = hasDepositProof || hasPaymentProof || isDepositPaid || isPaymentPaid;
  
  return isCancelled && canRequest && hasPaymentEvidence;
}

/**
 * Lấy bước thanh toán hiện tại
 * @returns PaymentStep (1-7) hoặc null nếu không thuộc flow (đã hủy không cần hoàn tiền)
 */
export function getCurrentStep(booking: Booking): PaymentStep | null {
  // 🔥 PRIORITY 1: Đã hủy nhưng không có bằng chứng thanh toán
  // → Không thuộc 7 bước, admin không cần xử lý
  if (booking.status === 'cancelled' && !canRequestRefund(booking)) {
    return null;
  }
  
  // 🔥 PRIORITY 2: Yêu cầu hoàn trả (đã hủy + có bằng chứng thanh toán)
  if (isRefundEligible(booking)) {
    return 7;
  }
  
  // Bước 6: Sẵn sàng thanh toán đối tác (đã thanh toán đầy đủ + đã sử dụng dịch vụ)
  if (isReadyForPartnerPayout(booking)) {
    return 6;
  }
  
  // Bước 5: Đã thanh toán đầy đủ (chờ sử dụng dịch vụ)
  if (booking.payment_status === 'paid') {
    return 5;
  }
  
  // Bước 4: Xác nhận thanh toán
  if (booking.deposit_status === 'paid' && booking.payment_status === 'unpaid' && booking.payment_proof_url) {
    return 4;
  }
  
  // Bước 3: Chờ thanh toán full
  if (booking.deposit_status === 'paid' && booking.payment_status === 'unpaid' && !booking.payment_proof_url) {
    return 3;
  }
  
  // Bước 2: Xác nhận đặt cọc
  if (booking.deposit_status === 'unpaid' && booking.deposit_proof_url) {
    return 2;
  }
  
  // Bước 1: Chờ đặt cọc (mặc định)
  return 1;
}

export function formatPrice(amount: number | null): string {
  if (!amount) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Lấy màu sắc cho refund status
 */
export function getRefundStatusColor(status: RefundStatus): {
  color: string;
  bgColor: string;
  label: string;
} {
  const statusConfig = {
    not_requested: {
      color: "text-gray-400",
      bgColor: "bg-gray-500/10",
      label: "Chưa yêu cầu"
    },
    requested: {
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      label: "Đang chờ"
    },
    approved: {
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      label: "Đã duyệt"
    },
    processing: {
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      label: "Đang xử lý"
    },
    completed: {
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      label: "Hoàn thành"
    },
    rejected: {
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      label: "Từ chối"
    }
  };
  
  return statusConfig[status];
}

/**
 * Tính số ngày còn lại đến khi sử dụng dịch vụ
 * Trả về số dương nếu chưa đến ngày, số âm nếu đã qua
 */
export function getDaysUntilServiceEnd(booking: Booking): number | null {
  if (!booking.date_to) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const serviceEndDate = new Date(booking.date_to);
  serviceEndDate.setHours(0, 0, 0, 0);
  
  const diffTime = serviceEndDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

async function uploadProofViaApi(
  bookingId: string,
  file: File,
  type: "deposit" | "payment" | "refund" | "payout"
): Promise<string> {
  const timestamp = Date.now();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const safeExt = extension || "jpg";
  const renamedFile = new File([file], `${type}_${timestamp}.${safeExt}`, {
    type: file.type || "application/octet-stream",
  });

  const formData = new FormData();
  formData.append("bucketName", "payment_proofs");
  formData.append("folderPath", bookingId);
  formData.append("files", renamedFile);

  const response = await fetch("/api/uploads/images", {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || "Upload chứng từ thất bại");
  }

  const uploadedUrl = Array.isArray(payload?.data) ? payload.data[0] : null;
  if (!uploadedUrl) {
    throw new Error("Không nhận được URL ảnh sau khi upload");
  }

  return uploadedUrl as string;
}


/**
 * Upload ảnh chứng từ hoàn trả
 * @param bookingId - ID của booking
 * @param file - File ảnh cần upload
 * @returns Public URL của ảnh đã upload
 */
export async function uploadRefundProof(bookingId: string, file: File): Promise<string> {
  try {
    return await uploadProofViaApi(bookingId, file, "refund");
  } catch (error) {
    console.error('Error uploading refund proof:', error);
    throw error;
  }
}

/**
 * Upload ảnh chứng từ đặt cọc (có thể tái sử dụng cho các loại proof khác)
 */
export async function uploadPaymentProof(
  bookingId: string, 
  file: File, 
  type: 'deposit' | 'payment' | 'refund' | 'payout'
): Promise<string> {
  try {
    return await uploadProofViaApi(bookingId, file, type);
  } catch (error) {
    console.error(`Error uploading ${type} proof:`, error);
    throw error;
  }
}