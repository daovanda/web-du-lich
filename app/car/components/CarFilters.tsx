"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X, MapPin, Clock, Car } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface CarFiltersProps {
  onFiltersChange: (filters: CarFilterState) => void;
  initialFilters?: Partial<CarFilterState>;
  isInitialLoad?: boolean;
}

export interface CarFilterState {
  searchQuery: string;
  vehicleType: string;
  departureLocation: string;
  arrivalLocation: string;
  priceRange: string;
  departureTime: string;
  sortBy: string; // THÊM MỚI
}

interface RouteOption {
  departure: string;
  arrival: string;
  count: number;
}

const DEPARTURE_TIMES = [
  { value: "", label: "Mọi thời gian" },
  { value: "morning", label: "Sáng (6h-12h)" },
  { value: "afternoon", label: "Chiều (12h-18h)" },
  { value: "evening", label: "Tối (18h-24h)" },
  { value: "night", label: "Đêm (0h-6h)" },
];

const VEHICLE_TYPES = [
  { value: "", label: "Tất cả loại xe" },
  { value: "sleeper_bus", label: "Xe khách giường nằm" },
  { value: "limousine_cabin", label: "Limousine cabin riêng" },
  { value: "limousine", label: "Limousine" },
  { value: "seat_bus", label: "Xe khách ghế ngồi" },
  { value: "private_charter", label: "Xe riêng đưa đón tận nơi" },
];

const PRICE_RANGES = [
  { value: "all", label: "Tất cả" },
  { value: "under300k", label: "< 300k" },
  { value: "300k-600k", label: "300k - 600k" },
  { value: "over600k", label: "> 600k" },
];

export default function CarFilters({ onFiltersChange, initialFilters, isInitialLoad = false }: CarFiltersProps) {
  const [filters, setFilters] = useState<CarFilterState>({
    searchQuery: initialFilters?.searchQuery || "",
    vehicleType: initialFilters?.vehicleType || "",
    departureLocation: initialFilters?.departureLocation || "",
    arrivalLocation: initialFilters?.arrivalLocation || "",
    priceRange: initialFilters?.priceRange || "all",
    departureTime: initialFilters?.departureTime || "",
    sortBy: initialFilters?.sortBy || "default", // THÊM MỚI
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [arrivalOptions, setArrivalOptions] = useState<string[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<RouteOption[]>([]);
  const [routesByDeparture, setRoutesByDeparture] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const { data } = await supabase
          .from("cars_view")
          .select("departure_location, arrival_location");

        if (data) {
          const validData = data.filter(
            item => item.departure_location && item.arrival_location
          );

          const uniqueDepartures = [
            ...new Set(validData.map((item) => item.departure_location)),
          ] as string[];
          const uniqueArrivals = [
            ...new Set(validData.map((item) => item.arrival_location)),
          ] as string[];

          const allLocations = [...new Set([...uniqueDepartures, ...uniqueArrivals])].sort();
          setLocations(allLocations);
          setArrivalOptions(allLocations);

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
            .filter(route => route.departure && route.arrival)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

          setPopularRoutes(topRoutes);

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
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (filters.departureLocation && routesByDeparture[filters.departureLocation]) {
      setArrivalOptions(routesByDeparture[filters.departureLocation].sort());
    } else if (filters.departureLocation) {
      setArrivalOptions([]);
    } else {
      setArrivalOptions(locations);
    }
  }, [filters.departureLocation, locations, routesByDeparture]);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof CarFilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    if (key === "departureLocation" && filters.departureLocation !== value) {
      newFilters.arrivalLocation = "";
    }
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: CarFilterState = {
      searchQuery: "",
      vehicleType: "",
      departureLocation: "",
      arrivalLocation: "",
      priceRange: "all",
      departureTime: "",
      sortBy: "default", // THÊM MỚI
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.vehicleType ||
    filters.departureLocation ||
    filters.arrivalLocation ||
    filters.priceRange !== "all" ||
    filters.departureTime ||
    filters.sortBy !== "default"; // THÊM MỚI

  return (
    <div
      className={`w-full mb-6 transition-all duration-1000 ease-out delay-300 ${
        isInitialLoad ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
      }`}
    >
      {/* Search Bar - Instagram Style */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
        <input
          type="text"
          placeholder="Tìm kiếm theo nhà xe, điểm đón, mô tả..."
          value={filters.searchQuery}
          onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
          className="w-full pl-11 pr-11 py-3 rounded-xl bg-black text-white border border-neutral-800 
                   focus:outline-none focus:border-neutral-700
                   transition-all duration-300 placeholder:text-neutral-600 text-sm"
        />
        {filters.searchQuery && (
          <button
            onClick={() => handleFilterChange("searchQuery", "")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Route Selection */}
      {popularRoutes.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {popularRoutes.map((route, index) => {
            const isActive = 
              filters.departureLocation === route.departure && 
              filters.arrivalLocation === route.arrival;

            return (
              <button
                key={index}
                onClick={() => {
                  handleFilterChange("departureLocation", route.departure);
                  handleFilterChange("arrivalLocation", route.arrival);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-black border-white"
                    : "bg-black hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white"
                }`}
              >
                {route.departure} → {route.arrival}
              </button>
            );
          })}
        </div>
      )}

      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 w-full ${
          hasActiveFilters 
            ? "bg-white text-black border-white" 
            : "bg-black hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-400"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="text-sm font-semibold">Bộ lọc</span>
        {hasActiveFilters && (
          <span className="ml-1 w-2 h-2 bg-black rounded-full"></span>
        )}
      </button>

      {/* Expanded Filters */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-black rounded-xl border border-neutral-800 p-5 space-y-5">
          {/* Departure & Arrival */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                <MapPin className="w-3.5 h-3.5" />
                Điểm đi
              </label>
              <select
                value={filters.departureLocation}
                onChange={(e) => handleFilterChange("departureLocation", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 
                         focus:outline-none focus:border-neutral-700
                         transition-all duration-200 cursor-pointer text-sm"
              >
                <option value="">Chọn điểm đi</option>
                {Object.keys(routesByDeparture).sort().map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                <MapPin className="w-3.5 h-3.5" />
                Điểm đến
              </label>
              <select
                value={filters.arrivalLocation}
                onChange={(e) => handleFilterChange("arrivalLocation", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 
                         focus:outline-none focus:border-neutral-700
                         transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                disabled={!filters.departureLocation}
              >
                <option value="">
                  {filters.departureLocation ? "Chọn điểm đến" : "Chọn điểm đi trước"}
                </option>
                {arrivalOptions.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
              <Car className="w-3.5 h-3.5" />
              Loại xe
            </label>
            <select
              value={filters.vehicleType}
              onChange={(e) => handleFilterChange("vehicleType", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 
                       focus:outline-none focus:border-neutral-700
                       transition-all duration-200 cursor-pointer text-sm"
            >
              {VEHICLE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Departure Time */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5" />
              Giờ khởi hành
            </label>
            <select
              value={filters.departureTime}
              onChange={(e) => handleFilterChange("departureTime", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 
                       focus:outline-none focus:border-neutral-700
                       transition-all duration-200 cursor-pointer text-sm"
            >
              {DEPARTURE_TIMES.map((time) => (
                <option key={time.value} value={time.value}>{time.label}</option>
              ))}
            </select>
          </div>

          {/* Price Range Buttons with Sort */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Mức giá vé
              </label>
              {/* Sort Buttons */}
              <div className="flex gap-1">
                <button
                  onClick={() => handleFilterChange("sortBy", "price-asc")}
                  className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-all ${
                    filters.sortBy === "price-asc"
                      ? "bg-white text-black border-white"
                      : "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white"
                  }`}
                >
                  Tăng dần
                </button>
                <button
                  onClick={() => handleFilterChange("sortBy", "price-desc")}
                  className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-all ${
                    filters.sortBy === "price-desc"
                      ? "bg-white text-black border-white"
                      : "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white"
                  }`}
                >
                  Giảm dần
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => handleFilterChange("priceRange", range.value)}
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${
                    filters.priceRange === range.value
                      ? "bg-white text-black border-white"
                      : "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700
                       text-neutral-400 hover:text-white transition-all duration-200 text-sm font-semibold
                       flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      </div>
    </div>
  );
}