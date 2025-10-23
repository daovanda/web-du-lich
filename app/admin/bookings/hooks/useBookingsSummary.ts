// hooks/useBookingsSummary.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

      const [
        { count: total },
        { count: pending },
        { count: confirmed },
        { count: cancelled },
        { count: partner_pending },
        { count: partner_paid },
        { count: partner_failed },
      ] = await Promise.all([
        supabase.from("bookings_view").select("*", { count: "exact", head: true }),
        supabase.from("bookings_view").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("bookings_view").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
        supabase.from("bookings_view").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
        supabase.from("bookings_view").select("*", { count: "exact", head: true }).eq("payout_status", "pending"),
        supabase.from("bookings_view").select("*", { count: "exact", head: true }).eq("payout_status", "paid"),
        supabase.from("bookings_view").select("*", { count: "exact", head: true }).eq("payout_status", "failed"),
      ]);

      setSummary({
        total: total ?? 0,
        pending: pending ?? 0,
        confirmed: confirmed ?? 0,
        cancelled: cancelled ?? 0,
        partner_pending: partner_pending ?? 0,
        partner_paid: partner_paid ?? 0,
        partner_failed: partner_failed ?? 0,
      });
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