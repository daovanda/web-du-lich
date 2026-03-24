// hooks/useBookings.ts
"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { Booking, BookingStatus, PayoutStatus, RefundStatus } from "../types";
import { format } from "date-fns";

export function useBookings(
  filterStatus: BookingStatus | "all" = "all",
  filterPayoutStatus: PayoutStatus | "all" = "all",
  search: string = "",
  startDate: Date | null = null,
  endDate: Date | null = null
) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [filterStatus, filterPayoutStatus, search, startDate, endDate]);

  async function fetchBookings() {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        status: filterStatus,
        payoutStatus: filterPayoutStatus,
        search: search.trim(),
      });
      if (startDate) {
        params.set("startDate", format(startDate, "yyyy-MM-dd"));
      }
      if (endDate) {
        params.set("endDate", format(endDate, "yyyy-MM-dd"));
      }

      const response = await apiRequest<{ data: Booking[] }>(`/api/admin/bookings?${params.toString()}`, {
        fallbackMessage: "Lỗi khi tải danh sách booking",
      });
      const bookingsData = (response.data || []) as Booking[];
      setBookings(bookingsData);
    } catch (err: any) {
      console.error("Fetch bookings error:", err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  // Cập nhật trạng thái đơn đặt
  async function updateStatus(id: string, status: BookingStatus) {
    try {
      await apiRequest<{ success: boolean }>(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
        fallbackMessage: "Lỗi cập nhật trạng thái đơn",
      });
      alert("Cập nhật trạng thái thành công!");
      fetchBookings();
      return true;
    } catch (error: any) {
      alert("Lỗi cập nhật trạng thái: " + error.message);
      return false;
    }
  }

  // Xác nhận đặt cọc
  async function confirmDeposit(id: string) {
    try {
      await apiRequest<{ success: boolean }>(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          deposit_status: "paid",
          deposit_paid_at: new Date().toISOString(),
        }),
        fallbackMessage: "Lỗi xác nhận đặt cọc",
      });
      alert("Xác nhận đặt cọc thành công!");
      fetchBookings();
      return true;
    } catch (error: any) {
      alert("Lỗi xác nhận đặt cọc: " + error.message);
      return false;
    }
  }

  // Xác nhận thanh toán full
  async function confirmPayment(id: string) {
    try {
      await apiRequest<{ success: boolean }>(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ payment_status: "paid" }),
        fallbackMessage: "Lỗi xác nhận thanh toán",
      });
      alert("Xác nhận thanh toán thành công!");
      fetchBookings();
      return true;
    } catch (error: any) {
      alert("Lỗi xác nhận thanh toán: " + error.message);
      return false;
    }
  }

  // Cập nhật thanh toán cho đối tác
  async function updatePayoutStatus(
    id: string,
    payout_status: PayoutStatus,
    payout_proof_url?: string
  ) {
    const updateData: Partial<Pick<Booking, "payout_status" | "payout_proof_url">> = {
      payout_status,
    };
    if (payout_proof_url) updateData.payout_proof_url = payout_proof_url;

    try {
      await apiRequest<{ success: boolean }>(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
        fallbackMessage: "Lỗi cập nhật thanh toán partner",
      });
      alert("Cập nhật thanh toán partner thành công!");
      fetchBookings();
      return true;
    } catch (error: any) {
      alert("Lỗi cập nhật thanh toán partner: " + error.message);
      return false;
    }
  }

  // Cập nhật trạng thái hoàn trả
  async function updateRefundStatus(
    id: string,
    refund_status: RefundStatus,
    refund_amount: number,
    refund_proof_url?: string,
    note?: string
  ) {
    try {
      const updateData: any = {
        refund_status,
        refund_amount,
        refund_processed_at: new Date().toISOString()
      };

      // Thêm proof URL nếu có
      if (refund_proof_url) {
        updateData.refund_proof_url = refund_proof_url;
      }

      // Thêm note vào notes field nếu có
      if (note) {
        const bookingRes = await apiRequest<{ data: Pick<Booking, "notes"> }>(
          `/api/admin/bookings/${id}`,
          { fallbackMessage: "Lỗi lấy thông tin booking hiện tại" }
        );
        const currentBooking = bookingRes.data;

        const existingNotes = currentBooking?.notes || "";
        const timestamp = new Date().toLocaleString("vi-VN");
        const newNote = `[${timestamp}] Hoàn trả: ${note}`;
        updateData.notes = existingNotes 
          ? `${existingNotes}\n${newNote}` 
          : newNote;
      }

      await apiRequest<{ success: boolean }>(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
        fallbackMessage: "Lỗi cập nhật hoàn trả",
      });

      alert(
        refund_status === "completed" 
          ? "Hoàn trả thành công!" 
          : "Từ chối hoàn trả thành công!"
      );
      
      await fetchBookings();
      return true;
    } catch (error: any) {
      console.error("Error updating refund status:", error);
      alert("Lỗi cập nhật hoàn trả: " + error.message);
      return false;
    }
  }

  return {
    bookings,
    loading,
    updateStatus,
    confirmDeposit,
    confirmPayment,
    updatePayoutStatus,
    updateRefundStatus,
    refetch: fetchBookings,
  };
}