import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

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
      let result = null;

      switch (type) {
        case "stay":
          const { data: stayData, error: stayError } = await supabase
            .from("stays")
            .select("*")
            .eq("id", serviceId)
            .maybeSingle();

          if (stayError) throw stayError;
          result = stayData;
          break;

        case "car":
          const { data: carData, error: carError } = await supabase
            .from("cars")
            .select("*")
            .eq("id", serviceId)
            .maybeSingle();

          if (carError) throw carError;
          result = carData;
          break;

        case "motorbike":
          const { data: motorbikeData, error: motorbikeError } = await supabase
            .from("motorbikes")
            .select("*")
            .eq("id", serviceId)
            .maybeSingle();

          if (motorbikeError) throw motorbikeError;
          result = motorbikeData;
          break;

        case "tour":
          const { data: tourData, error: tourError } = await supabase
            .from("tours")
            .select("*")
            .eq("id", serviceId)
            .maybeSingle();

          if (tourError) throw tourError;
          result = tourData;
          break;

        default:
          throw new Error(`Unsupported service type: ${type}`);
      }

      setData(result);
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
    let data = null;

    switch (type) {
      case "stay":
        const { data: stayData, error: stayError } = await supabase
          .from("stays")
          .select("*")
          .eq("id", serviceId)
          .maybeSingle();

        if (stayError) throw stayError;
        data = stayData;
        break;

      case "car":
        const { data: carData, error: carError } = await supabase
          .from("cars")
          .select("*")
          .eq("id", serviceId)
          .maybeSingle();

        if (carError) throw carError;
        data = carData;
        break;

      case "motorbike":
        const { data: motorbikeData, error: motorbikeError } = await supabase
          .from("motorbikes")
          .select("*")
          .eq("id", serviceId)
          .maybeSingle();

        if (motorbikeError) throw motorbikeError;
        data = motorbikeData;
        break;

      case "tour":
        const { data: tourData, error: tourError } = await supabase
          .from("tours")
          .select("*")
          .eq("id", serviceId)
          .maybeSingle();

        if (tourError) throw tourError;
        data = tourData;
        break;

      default:
        throw new Error(`Unsupported service type: ${type}`);
    }

    return data;
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
      const statusMap: Record<string, boolean> = {};

      try {
        // Group services by type for batch checking
        const servicesByType: Record<string, string[]> = {
          stay: [],
          car: [],
          motorbike: [],
          tour: [],
        };

        services.forEach((svc) => {
          if (servicesByType[svc.type]) {
            servicesByType[svc.type].push(svc.id);
          }
        });

        // Check each type in batch
        for (const [type, ids] of Object.entries(servicesByType)) {
          if (ids.length === 0) continue;

          const tableName = type === "stay" ? "stays" : 
                           type === "car" ? "cars" : 
                           type === "motorbike" ? "motorbikes" : "tours";

          const { data } = await supabase
            .from(tableName)
            .select("id")
            .in("id", ids);

          // Mark services that have detail data
          ids.forEach((id) => {
            statusMap[id] = data?.some((item) => item.id === id) || false;
          });
        }

        setDetailStatus(statusMap);
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