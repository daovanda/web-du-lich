import { useState, useEffect } from "react";
import { fetchFilterOptions } from "../_api/carAPI";
import { RouteOption } from "../_types/car.types";

export function useCarSearch() {
  const [locations, setLocations] = useState<string[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<RouteOption[]>([]);
  const [routesByDeparture, setRoutesByDeparture] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const data = await fetchFilterOptions();
        
        const validData = data.filter(
          item => item.departure_location && item.arrival_location
        );

        // Process locations
        const uniqueDepartures = [...new Set(validData.map(item => item.departure_location))];
        const uniqueArrivals = [...new Set(validData.map(item => item.arrival_location))];
        const allLocations = [...new Set([...uniqueDepartures, ...uniqueArrivals])].sort();
        
        setLocations(allLocations);

        // Process routes
        const routeCounts = validData.reduce((acc, item) => {
          const key = `${item.departure_location}|${item.arrival_location}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const topRoutes = Object.entries(routeCounts)
          .map(([key, count]) => {
            const [departure, arrival] = key.split('|');
            return { departure, arrival, count };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        setPopularRoutes(topRoutes);

        // Group arrivals by departure
        const routeMap = validData.reduce((acc, item) => {
          if (!acc[item.departure_location]) {
            acc[item.departure_location] = [];
          }
          if (!acc[item.departure_location].includes(item.arrival_location)) {
            acc[item.departure_location].push(item.arrival_location);
          }
          return acc;
        }, {} as Record<string, string[]>);

        setRoutesByDeparture(routeMap);
      } catch (error) {
        console.error("Error loading filter options:", error);
      }
    };

    loadFilterOptions();
  }, []);

  return { locations, popularRoutes, routesByDeparture };
}