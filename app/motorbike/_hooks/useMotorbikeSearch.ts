import { useEffect, useState } from "react";
import { fetchMotorbikeLocations } from "../_api/motorbikeApi";

export function useMotorbikeSearch() {
  const [locations, setLocations] = useState<string[]>([]);
  const [topLocations, setTopLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchMotorbikeLocations();
        setLocations(res.locations);
        setTopLocations(res.topLocations);
      } catch (err) {
        console.error("Error loading motorbike locations:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { locations, topLocations, loading };
}

