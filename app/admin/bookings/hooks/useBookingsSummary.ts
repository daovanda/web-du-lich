// hooks/useBookingsSummary.ts
"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";

export interface Summary {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  partner_pending: number;
  partner_paid: number;
  partner_failed: number;
}

export function useBookingsSummary() {
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    partner_pending: 0,
    partner_paid: 0,
    partner_failed: 0,
  });
  const [loading, setLoading] = useState(true);

  async function fetchSummary() {
    try {
      setLoading(true);

      const response = await apiRequest<{ data: Summary }>("/api/admin/bookings/summary", {
        fallbackMessage: "Lỗi khi tải thống kê booking",
      });
      setSummary(response.data);
    } catch (err: any) {
      console.error("Fetch summary error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30_000);
    return () => clearInterval(interval);
  }, []);

  return { summary, loading, refresh: fetchSummary };
}