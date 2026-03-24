"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X, MapPin, Clock, Car } from "lucide-react";
import { CarFilterState } from "../_types/car.types";
import { useCarSearch } from "../_hooks/useCarSearch";

export interface CarFiltersProps {
  onFiltersChange: (filters: CarFilterState) => void;
  initialFilters?: Partial<CarFilterState>;
  isInitialLoad?: boolean;
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
  { value: "all", label: "Tất cả mức giá" },
  { value: "under300k", label: "< 300k" },
  { value: "300k-600k", label: "300k - 600k" },
  { value: "over600k", label: "> 600k" },
];

export default function CarFilters({ 
  onFiltersChange, 
  initialFilters, 
  isInitialLoad = false 
}: CarFiltersProps) {
  const [filters, setFilters] = useState<CarFilterState>({
    searchQuery: initialFilters?.searchQuery || "",
    vehicleType: initialFilters?.vehicleType || "",
    departureLocation: initialFilters?.departureLocation || "",
    arrivalLocation: initialFilters?.arrivalLocation || "",
    priceRange: initialFilters?.priceRange || "all",
    departureTime: initialFilters?.departureTime || "",
    sortBy: initialFilters?.sortBy || "default",
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [arrivalOptions, setArrivalOptions] = useState<string[]>([]);

  // Use custom hook for search data
  const { locations, popularRoutes, routesByDeparture } = useCarSearch();

  // Update arrival options based on departure
  useEffect(() => {
    if (filters.departureLocation && routesByDeparture[filters.departureLocation]) {
      setArrivalOptions(routesByDeparture[filters.departureLocation].sort());
    } else if (filters.departureLocation) {
      setArrivalOptions([]);
    } else {
      setArrivalOptions(locations);
    }
  }, [filters.departureLocation, locations, routesByDeparture]);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof CarFilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset điểm đến nếu điểm đi thay đổi
    if (key === "departureLocation" && filters.departureLocation !== value) {
      newFilters.arrivalLocation = "";
    }
    
    setFilters(newFilters);
  };

  const handleQuickRoute = (departure: string, arrival: string) => {
    setFilters({
      ...filters,
      departureLocation: departure,
      arrivalLocation: arrival,
    });
  };

  const handleReset = () => {
    const resetFilters: CarFilterState = {
      searchQuery: "",
      vehicleType: "",
      departureLocation: "",
      arrivalLocation: "",
      priceRange: "all",
      departureTime: "",
      sortBy: "default",
    };
    setFilters(resetFilters);
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.vehicleType ||
    filters.departureLocation ||
    filters.arrivalLocation ||
    filters.priceRange !== "all" ||
    filters.departureTime ||
    filters.sortBy !== "default";

  return (
    <div
      className={`w-full mb-6 transition-all duration-1000 ease-out delay-300 ${
        isInitialLoad ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
      }`}
    >
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm kiếm theo nhà xe, điểm đón, mô tả..."
          value={filters.searchQuery}
          onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
          className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-900 text-white border border-gray-700 
                   focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                   transition-all duration-300 ease-out hover:border-gray-600"
        />
        {filters.searchQuery && (
          <button
            onClick={() => handleFilterChange("searchQuery", "")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Route Selection - Dynamic from DB */}
      {popularRoutes.length > 0 && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
          {popularRoutes.map((route, index) => {
            const isActive = 
              filters.departureLocation === route.departure && 
              filters.arrivalLocation === route.arrival;

            return (
              <button
                key={index}
                onClick={() => handleQuickRoute(route.departure, route.arrival)}
                className={`px-4 py-2.5 rounded-lg border text-sm transition-all ${
                  isActive
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white"
                }`}
              >
                🚌 {route.departure} → {route.arrival}
              </button>
            );
          })}
        </div>
      )}

      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 
                  border transition-all duration-300 w-full ${
                    hasActiveFilters 
                      ? "border-blue-500 text-blue-400" 
                      : "border-gray-700 text-gray-300"
                  }`}
      >
        <SlidersHorizontal className="w-5 h-5" />
        <span className="font-medium">Bộ lọc nâng cao</span>
        {hasActiveFilters && (
          <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
            Đang lọc
          </span>
        )}
      </button>

      {/* Expanded Filters */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6">
          {/* Departure & Arrival */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                Điểm đi
              </label>
              <select
                value={filters.departureLocation}
                onChange={(e) => handleFilterChange("departureLocation", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-700 
                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                         transition-all duration-200 cursor-pointer"
              >
                <option value="">Chọn điểm đi</option>
                {Object.keys(routesByDeparture).sort().map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 text-green-400" />
                Điểm đến
              </label>
              <select
                value={filters.arrivalLocation}
                onChange={(e) => handleFilterChange("arrivalLocation", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-700 
                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                         transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Car className="w-4 h-4 text-indigo-400" />
              Loại xe
            </label>
            <select
              value={filters.vehicleType}
              onChange={(e) => handleFilterChange("vehicleType", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-700 
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                       transition-all duration-200 cursor-pointer"
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
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              Giờ khởi hành
            </label>
            <select
              value={filters.departureTime}
              onChange={(e) => handleFilterChange("departureTime", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-700 
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                       transition-all duration-200 cursor-pointer"
            >
              {DEPARTURE_TIMES.map((time) => (
                <option key={time.value} value={time.value}>{time.label}</option>
              ))}
            </select>
          </div>

          {/* Price Range + Sort */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                💰 Mức giá vé
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => handleFilterChange("sortBy", "price-asc")}
                  className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-all ${
                    filters.sortBy === "price-asc"
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-blue-500 text-gray-300"
                  }`}
                >
                  Tăng dần
                </button>
                <button
                  onClick={() => handleFilterChange("sortBy", "price-desc")}
                  className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-all ${
                    filters.sortBy === "price-desc"
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-blue-500 text-gray-300"
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
                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    filters.priceRange === range.value
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30"
                      : "bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white"
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
              className="w-full py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 
                       text-gray-300 hover:text-white transition-all duration-200 font-medium
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