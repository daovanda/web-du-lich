// types/booking.ts

export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type PaymentMethod = "cash" | "credit_card" | "momo" | "zalopay";
export type PayoutStatus = "pending" | "paid" | "failed";

export interface Booking {
  // --- Core ---
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

  confirmed_by: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  notes: string | null;

  // --- Thanh toán cho đối tác (MỚI) ---
  payout_status: PayoutStatus;
  payout_proof_url: string | null;

  // --- Join từ profiles ---
  user_full_name: string | null;
  user_avatar_url: string | null;

  // --- Join từ services ---
  service_title: string | null;
  service_type: string | null;
  service_image_url: string | null;
}