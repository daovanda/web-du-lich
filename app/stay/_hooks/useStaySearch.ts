// _hooks/useStaySearch.ts

import { useState, useEffect } from "react";
import { fetchLocations } from "../_api/stayApi";

interface UseStaySearchResult {
  locations: string[];
  loading: boolean;
}

export function useStaySearch(): UseStaySearchResult {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await fetchLocations();
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  return { locations, loading };
}