"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X, MapPin, Bike, Wrench, Calendar } from "lucide-react";

export interface MotorbikeFiltersProps {
  onFiltersChange: (filters: MotorbikeFilterState) => void;
  initialFilters?: Partial<MotorbikeFilterState>;
  isInitialLoad?: boolean;
  availableLocations?: string[];
  topLocations?: string[];
}

export interface MotorbikeFilterState {
  searchQuery: string;
  bikeType: string;
  location: string;
  minEngineSize: string;
  maxEngineSize: string;
  minYear: string;
  maxYear: string;
  minPrice: string;
  maxPrice: string;
}

const BIKE_TYPES = [
  { value: "", label: "Tất cả loại" },
  { value: "scooter", label: "Xe tay ga" },
  { value: "manual", label: "Xe số" },
  { value: "clutch", label: "Xe côn tay" },
  { value: "adventure", label: "Xe chuyên đi phượt xa" },
  { value: "electric", label: "Xe điện" },
];

const PRICE_RANGES = [
  { label: "<100k", min: "", max: "100000" },
  { label: "100k-200k", min: "100000", max: "200000" },
  { label: ">200k", min: "200000", max: "" },
];

const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}tr`;
  }
  return `${(price / 1000).toFixed(0)}k`;
};

export default function MotorbikeFilters({ 
  onFiltersChange, 
  initialFilters, 
  isInitialLoad = false,
  availableLocations = [],
  topLocations = []
}: MotorbikeFiltersProps) {
  const [filters, setFilters] = useState<MotorbikeFilterState>({
    searchQuery: initialFilters?.searchQuery || "",
    bikeType: initialFilters?.bikeType || "",
    location: initialFilters?.location || "",
    minEngineSize: initialFilters?.minEngineSize || "0",
    maxEngineSize: initialFilters?.maxEngineSize || "",
    minYear: initialFilters?.minYear || "2000",
    maxYear: initialFilters?.maxYear || "",
    minPrice: initialFilters?.minPrice || "",
    maxPrice: initialFilters?.maxPrice || "500000",
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof MotorbikeFilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeSelect = (min: string, max: string) => {
    const newFilters = { 
      ...filters, 
      minPrice: min, 
      maxPrice: max || "500000" 
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: MotorbikeFilterState = {
      searchQuery: "",
      bikeType: "",
      location: "",
      minEngineSize: "0",
      maxEngineSize: "",
      minYear: "2000",
      maxYear: "",
      minPrice: "",
      maxPrice: "500000",
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.bikeType ||
    filters.location ||
    (filters.minEngineSize && filters.minEngineSize !== "0") ||
    filters.maxEngineSize ||
    (filters.minYear && filters.minYear !== "2000") ||
    filters.maxYear ||
    filters.minPrice ||
    (filters.maxPrice && filters.maxPrice !== "500000");

  const getActivePriceRange = () => {
    const range = PRICE_RANGES.find(
      r => r.min === filters.minPrice && r.max === filters.maxPrice
    );
    return range?.label || null;
  };

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
          placeholder="Tìm kiếm theo tên, model, địa điểm..."
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

      {/* Quick Location Selection - Top 4 locations */}
      {topLocations.length > 0 && (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {topLocations.map((location) => (
            <button
              key={location}
              onClick={() => handleFilterChange("location", location)}
              className={`px-4 py-2.5 rounded-lg border text-sm transition-all ${
                filters.location === location
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white"
              }`}
            >
              📍 {location}
            </button>
          ))}
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
          {/* Bike Type */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Bike className="w-4 h-4 text-blue-400" />
              Loại xe
            </label>
            <select
              value={filters.bikeType}
              onChange={(e) => handleFilterChange("bikeType", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-700 
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                       transition-all duration-200 cursor-pointer"
            >
              {BIKE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location - All available locations from DB */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 text-green-400" />
              Địa điểm
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-700 
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                       transition-all duration-200 cursor-pointer"
            >
              <option value="">Tất cả địa điểm</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Engine Size & Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Wrench className="w-4 h-4 text-orange-400" />
                Dung tích động cơ (cc)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min (0)"
                  value={filters.minEngineSize}
                  onChange={(e) => handleFilterChange("minEngineSize", e.target.value)}
                  min="0"
                  step="50"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-200 placeholder-gray-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxEngineSize}
                  onChange={(e) => handleFilterChange("maxEngineSize", e.target.value)}
                  min="0"
                  step="50"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-200 placeholder-gray-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Năm sản xuất
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min (2000)"
                  value={filters.minYear}
                  onChange={(e) => handleFilterChange("minYear", e.target.value)}
                  min="2000"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-200 placeholder-gray-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxYear}
                  onChange={(e) => handleFilterChange("maxYear", e.target.value)}
                  min="2000"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-200 placeholder-gray-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <span>💰</span>
              Giá thuê/ngày
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRICE_RANGES.map((range) => {
                const isActive = filters.minPrice === range.min && 
                                (filters.maxPrice === range.max || (!range.max && filters.maxPrice === "500000"));
                return (
                  <button
                    key={range.label}
                    onClick={() => handlePriceRangeSelect(range.min, range.max)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white"
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
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