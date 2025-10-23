// hooks/useBookings.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Booking, BookingStatus, PayoutStatus } from "../types";
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

  // Chỉ fetch khi các filter thay đổi
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

      // 1. Lọc trạng thái đơn đặt
      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      // 2. Lọc thanh toán cho Partner
      if (filterPayoutStatus !== "all") {
        query = query.eq("payout_status", filterPayoutStatus);
      }

      // 3. Tìm kiếm (tên, SĐT, dịch vụ)
      if (search.trim()) {
        const q = search.trim();
        query = query.or(`
          full_name.ilike.%${q}%,
          phone.ilike.%${q}%,
          service_title.ilike.%${q}%
        `);
      }

      // 4. Lọc theo khoảng ngày (date_from)
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
      fetchBookings(); // Cập nhật lại danh sách
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
      fetchBookings(); // Cập nhật lại danh sách
      return true;
    }
  }

  return {
    bookings,
    loading,
    updateStatus,
    updatePayoutStatus,
    refetch: fetchBookings, // Cho phép gọi thủ công
  };
}