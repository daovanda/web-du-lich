// hooks/useServiceHistory.ts
import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// Define proper types
interface ServiceInfo {
  title: string;
  type: string;
  image_url: string;
}

interface ServiceHistoryItem {
  id: string;
  user_id: string;
  service_id: string;
  date_from: string;
  date_to: string;
  total_price: number;
  payment_status: string;
  deposit_status: string;
  deposit_amount: number;
  deposit_proof_url: string | null;
  payment_proof_url: string | null;
  status: string;
  created_at: string;
  cancelled_at: string | null;
  deposit_paid_at: string | null;
  deposit_payment_method: string | null;
  payment_method: string | null;
  refund_status: string | null;
  refund_amount: number | null;
  refund_proof_url: string | null;
  refund_requested_at: string | null;
  refund_processed_at: string | null;
  refund_reason: string | null;
  quantity: number;
  booking_code: string;
  services: ServiceInfo; // Single object, not array
}

interface UseServiceHistoryOptions {
  initialData?: any[];
}

interface UseServiceHistoryReturn {
  data: ServiceHistoryItem[] | null;
  loading: boolean;
  error: string;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
  cancelBookingWithRefund: (bookingId: string, refundAmount: number, reason: string) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
}

export function useServiceHistory({
  initialData
}: UseServiceHistoryOptions = {}): UseServiceHistoryReturn {
  const [data, setData] = useState<ServiceHistoryItem[] | null>(initialData ?? null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string>("");

  // Fetch data from database
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData([]);
        setLoading(false);
        return;
      }

      const { data: bookingsData, error: fetchError } = await supabase
        .from("bookings")
        .select(`
          id, user_id, service_id, date_from, date_to, total_price, 
          payment_status, deposit_status, deposit_amount, deposit_proof_url,
          payment_proof_url, status, created_at, cancelled_at,
          deposit_paid_at, deposit_payment_method, payment_method,
          refund_status, refund_amount, refund_proof_url, 
          refund_requested_at, refund_processed_at, refund_reason,
          quantity, booking_code,
          services(title, type, image_url)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      
      // Transform the data: services comes as array from Supabase, take first item
      const transformedData = (bookingsData || []).map(booking => ({
        ...booking,
        services: Array.isArray(booking.services) ? booking.services[0] : booking.services
      })) as ServiceHistoryItem[];
      
      setData(transformedData);
    } catch (e: any) {
      setError(e?.message || "Không thể tải dữ liệu");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data when component mounts
  useEffect(() => {
    if (initialData && Array.isArray(initialData)) {
      // Transform initial data as well
      const transformedData = initialData.map(booking => ({
        ...booking,
        services: Array.isArray(booking.services) ? booking.services[0] : booking.services
      })) as ServiceHistoryItem[];
      setData(transformedData);
      setLoading(false);
      return;
    }
    
    fetchData();
  }, [initialData, fetchData]);

  // Cancel booking (no payment made yet)
  const cancelBooking = useCallback(async (bookingId: string): Promise<{ success: boolean; error?: string }> => {
    if (!bookingId) {
      return { success: false, error: "Invalid booking ID" };
    }
    
    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString()
        })
        .eq("id", bookingId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setData(prevData => 
        prevData?.map(item => 
          item.id === bookingId 
            ? { ...item, status: "cancelled", cancelled_at: new Date().toISOString() }
            : item
        ) ?? null
      );
      
      return { success: true };
    } catch (e: any) {
      console.error("Error cancelling booking:", e);
      return { success: false, error: e?.message || "Không thể hủy dịch vụ" };
    }
  }, []);

  // Cancel booking and request refund (payment already made)
  const cancelBookingWithRefund = useCallback(async (
    bookingId: string, 
    refundAmount: number, 
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!bookingId) {
      return { success: false, error: "Invalid booking ID" };
    }
    
    if (!reason || reason.trim() === "") {
      return { success: false, error: "Lý do hủy là bắt buộc" };
    }
    
    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          refund_status: "requested",
          refund_amount: refundAmount,
          refund_requested_at: new Date().toISOString(),
          refund_reason: reason.trim()
        })
        .eq("id", bookingId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setData(prevData => 
        prevData?.map(item => 
          item.id === bookingId 
            ? { 
                ...item, 
                status: "cancelled", 
                cancelled_at: new Date().toISOString(),
                refund_status: "requested",
                refund_amount: refundAmount,
                refund_requested_at: new Date().toISOString(),
                refund_reason: reason.trim()
              }
            : item
        ) ?? null
      );
      
      return { success: true };
    } catch (e: any) {
      console.error("Error cancelling and requesting refund:", e);
      return { success: false, error: e?.message || "Không thể gửi yêu cầu" };
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    cancelBooking,
    cancelBookingWithRefund,
    refreshData
  };
}