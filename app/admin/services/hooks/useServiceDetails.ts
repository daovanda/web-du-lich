import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/apiClient";

type ServiceType = "stay" | "car" | "motorbike" | "tour";

// Hook to fetch detail data for a specific service
export function useServiceDetail(serviceId: string | null, type: ServiceType | null, refreshKey = 0) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!serviceId || !type) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{ data: any }>(
        `/api/admin/services/details?serviceId=${serviceId}&type=${type}`,
        { fallbackMessage: `Không thể tải chi tiết dịch vụ ${type}` }
      );

      setData(response.data ?? null);
    } catch (err: any) {
      console.error(`Error fetching ${type} details:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [serviceId, type]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  // Hàm refetch để gọi lại khi cần
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Function to fetch detail data for a single service
export async function fetchServiceDetail(
  serviceId: string,
  type: ServiceType
): Promise<any> {
  try {
    const response = await apiRequest<{ data: any }>(
      `/api/admin/services/details?serviceId=${serviceId}&type=${type}`,
      { fallbackMessage: `Không thể tải chi tiết dịch vụ ${type}` }
    );
    return response.data ?? null;
  } catch (error) {
    console.error(`Error fetching ${type} details:`, error);
    return null;
  }
}

// Hook to check if services have detail data
export function useServicesDetailStatus(services: any[]) {
  const [detailStatus, setDetailStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkDetails = async () => {
      if (services.length === 0) return;

      setLoading(true);
      try {
        const response = await apiRequest<{ data: Record<string, boolean> }>(
          "/api/admin/services/detail-status",
          {
            method: "POST",
            body: JSON.stringify({ services }),
            fallbackMessage: "Không thể kiểm tra trạng thái chi tiết dịch vụ",
          }
        );

        setDetailStatus(response.data || {});
      } catch (error) {
        console.error("Error checking detail status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkDetails();
  }, [services]);

  return { detailStatus, loading };
}