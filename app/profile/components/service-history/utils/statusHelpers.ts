// app/service-history/utils/statusHelpers.ts

import { PaymentStep, ProcessStatus } from './constants';

export const getPaymentStep = (item: any): PaymentStep => {
  const { deposit_status, deposit_proof_url, payment_status, payment_proof_url, status } = item;
  
  if (status === "cancelled") {
    return "cancelled";
  }
  
  if (payment_status === "paid" && status === "confirmed") {
    return "completed";
  }
  
  if (payment_status === "paid" && status === "pending") {
    return "waiting_admin_confirm";
  }
  
  if (deposit_status === "paid" && payment_status === "unpaid" && payment_proof_url) {
    return "waiting_payment_confirm";
  }
  
  if (deposit_status === "paid" && payment_status === "unpaid" && !payment_proof_url) {
    return "need_full_payment";
  }
  
  if (deposit_status === "unpaid" && deposit_proof_url) {
    return "waiting_deposit_confirm";
  }
  
  if (deposit_status === "unpaid" && !deposit_proof_url) {
    return "need_deposit";
  }
  
  return "unknown";
};

export const getProcessStatus = (item: any): ProcessStatus => {
  const { status } = item;
  
  if (status === "cancelled") {
    return "cancelled";
  }
  
  return "active";
};

export const getPaymentStepText = (step: PaymentStep): { text: string; color: string } => {
  switch (step) {
    case "need_deposit":
      return { text: "Cần đặt cọc", color: "text-amber-400" };
    case "waiting_deposit_confirm":
      return { text: "Chờ xác nhận đặt cọc", color: "text-yellow-400" };
    case "need_full_payment":
      return { text: "Cần thanh toán phần còn lại", color: "text-orange-400" };
    case "waiting_payment_confirm":
      return { text: "Chờ xác nhận thanh toán", color: "text-yellow-400" };
    case "waiting_admin_confirm":
      return { text: "Đã thanh toán đầy đủ và chờ sử dụng dịch vụ", color: "text-blue-400" };
    case "completed":
      return { text: "Đã thanh toán đầy đủ và hoàn thành dịch vụ", color: "text-emerald-400" };
    case "cancelled":
      return { text: "Đã hủy", color: "text-rose-400" };
    default:
      return { text: "Chưa rõ", color: "text-gray-400" };
  }
};

export const calculateTotalPaid = (item: any): number => {
  let totalPaid = 0;
  
  if (item.deposit_status === "paid" || item.deposit_proof_url) {
    totalPaid += item.deposit_amount || 0;
  }
  
  if (item.payment_status === "paid" || item.payment_proof_url) {
    const remaining = (item.total_price || 0) - (item.deposit_amount || 0);
    totalPaid += remaining;
  }
  
  return totalPaid;
};

export const getStatusColor = (status: string): string => {
  if (status === "pending") return "text-amber-400";
  if (status === "confirmed") return "text-emerald-400";
  if (status === "cancelled") return "text-rose-400";
  return "text-gray-400";
};