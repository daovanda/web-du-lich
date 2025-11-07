// hooks/useBookings.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
      let query = supabase
        .from("bookings_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      if (filterPayoutStatus !== "all") {
        query = query.eq("payout_status", filterPayoutStatus);
      }

      if (search.trim()) {
        const q = search.trim();
        query = query.or(`
          full_name.ilike.%${q}%,
          phone.ilike.%${q}%,
          service_title.ilike.%${q}%
        `);
      }

      if (startDate) {
        const formattedStart = format(startDate, "yyyy-MM-dd");
        query = query.gte("date_from", formattedStart);
      }
      if (endDate) {
        const formattedEnd = format(endDate, "yyyy-MM-dd");
        query = query.lte("date_from", formattedEnd);
      }

      const { data, error } = await query;

      if (error) throw error;

      const bookingsData = (data || []) as Booking[];
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
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Lỗi cập nhật trạng thái: " + error.message);
      return false;
    } else {
      alert("Cập nhật trạng thái thành công!");
      fetchBookings();
      return true;
    }
  }

  // Xác nhận đặt cọc
  async function confirmDeposit(id: string) {
    const { error } = await supabase
      .from("bookings")
      .update({ 
        deposit_status: "paid",
        deposit_paid_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      alert("Lỗi xác nhận đặt cọc: " + error.message);
      return false;
    } else {
      alert("Xác nhận đặt cọc thành công!");
      fetchBookings();
      return true;
    }
  }

  // Xác nhận thanh toán full
  async function confirmPayment(id: string) {
    const { error } = await supabase
      .from("bookings")
      .update({ 
        payment_status: "paid"
      })
      .eq("id", id);

    if (error) {
      alert("Lỗi xác nhận thanh toán: " + error.message);
      return false;
    } else {
      alert("Xác nhận thanh toán thành công!");
      fetchBookings();
      return true;
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

    const { error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", id);

    if (error) {
      alert("Lỗi cập nhật thanh toán partner: " + error.message);
      return false;
    } else {
      alert("Cập nhật thanh toán partner thành công!");
      fetchBookings();
      return true;
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
        // Lấy booking hiện tại để append note
        const { data: currentBooking } = await supabase
          .from("bookings")
          .select("notes")
          .eq("id", id)
          .single();

        const existingNotes = currentBooking?.notes || "";
        const timestamp = new Date().toLocaleString("vi-VN");
        const newNote = `[${timestamp}] Hoàn trả: ${note}`;
        updateData.notes = existingNotes 
          ? `${existingNotes}\n${newNote}` 
          : newNote;
      }

      const { error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

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