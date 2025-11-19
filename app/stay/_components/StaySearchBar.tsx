// _components/StaySearchBar.tsx

"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X, MapPin, Users, Calendar, Bed, DoorOpen, ArrowUpDown } from "lucide-react";
import { StayFilterState, PRICE_RANGES, SORT_OPTIONS } from "../_types/stay.types";
import { hasActiveFilters, calculateMinCheckOutDate } from "../_utils/stayQuery";

export interface StaySearchBarProps {
  onFiltersChange: (filters: StayFilterState) => void;
  initialFilters: StayFilterState;
  locations: string[];
  isInitialLoad?: boolean;
}

export default function StaySearchBar({
  onFiltersChange,
  initialFilters,
  locations,
  isInitialLoad = false,
}: StaySearchBarProps) {
  const [filters, setFilters] = useState<StayFilterState>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof StayFilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };

    // Reset check-out date if check-in date changes
    if (key === "checkInDate" && filters.checkInDate !== value) {
      if (value && filters.checkOutDate && new Date(value) >= new Date(filters.checkOutDate)) {
        newFilters.checkOutDate = "";
      }
    }

    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: StayFilterState = {
      searchQuery: "",
      location: "",
      minGuests: "0",
      maxGuests: "",
      minRooms: "0",
      maxRooms: "",
      minBeds: "0",
      maxBeds: "",
      priceRange: "all",
      checkInDate: "",
      checkOutDate: "",
      sortBy: "default", // THÊM MỚI
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const isActive = hasActiveFilters(filters);
  const minCheckOutDate = calculateMinCheckOutDate(filters.checkInDate);

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
          placeholder="Tìm kiếm theo tên, địa điểm, mô tả..."
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

      {/* Quick Location Selection */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {locations.slice(0, 4).map((location) => (
          <button
            key={location}
            onClick={() => handleFilterChange("location", location)}
            className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
              filters.location === location
                ? "bg-white text-black border-white"
                : "bg-black hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white"
            }`}
          >
            {location}
          </button>
        ))}
      </div>

      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 w-full ${
          isActive
            ? "bg-white text-black border-white"
            : "bg-black hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-400"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="text-sm font-semibold">Bộ lọc</span>
        {isActive && (
          <span className="ml-1 w-2 h-2 bg-black rounded-full"></span>
        )}
      </button>

      {/* Expanded Filters */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-[1200px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-black rounded-xl border border-neutral-800 p-5 space-y-5">
          {/* Location */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5" />
              Địa điểm
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 
                       focus:outline-none focus:border-neutral-700
                       transition-all duration-200 cursor-pointer text-sm"
            >
              <option value="">Tất cả địa điểm</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Check-in & Check-out Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                <Calendar className="w-3.5 h-3.5" />
                Ngày nhận phòng
              </label>
              <input
                type="date"
                value={filters.checkInDate}
                onChange={(e) => handleFilterChange("checkInDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 
                         focus:outline-none focus:border-neutral-700
                         transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                <Calendar className="w-3.5 h-3.5" />
                Ngày trả phòng
              </label>
              <input
                type="date"
                value={filters.checkOutDate}
                onChange={(e) => handleFilterChange("checkOutDate", e.target.value)}
                min={minCheckOutDate}
                disabled={!filters.checkInDate}
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 
                         focus:outline-none focus:border-neutral-700
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              />
            </div>
          </div>

          {/* Number of People, Rooms & Beds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                <Users className="w-3.5 h-3.5" />
                Số người
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  value={filters.minGuests}
                  onChange={(e) => handleFilterChange("minGuests", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 text-white border border-neutral-800 
                           focus:outline-none focus:border-neutral-700
                           transition-all duration-200 placeholder:text-neutral-600 text-sm"
                />
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={filters.maxGuests}
                  onChange={(e) => handleFilterChange("maxGuests", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 text-white border border-neutral-800 
                           focus:outline-none focus:border-neutral-700
                           transition-all duration-200 placeholder:text-neutral-600 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                <DoorOpen className="w-3.5 h-3.5" />
                Số phòng
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  value={filters.minRooms}
                  onChange={(e) => handleFilterChange("minRooms", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 text-white border border-neutral-800 
                           focus:outline-none focus:border-neutral-700
                           transition-all duration-200 placeholder:text-neutral-600 text-sm"
                />
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={filters.maxRooms}
                  onChange={(e) => handleFilterChange("maxRooms", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 text-white border border-neutral-800 
                           focus:outline-none focus:border-neutral-700
                           transition-all duration-200 placeholder:text-neutral-600 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                <Bed className="w-3.5 h-3.5" />
                Số giường
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  value={filters.minBeds}
                  onChange={(e) => handleFilterChange("minBeds", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 text-white border border-neutral-800 
                           focus:outline-none focus:border-neutral-700
                           transition-all duration-200 placeholder:text-neutral-600 text-sm"
                />
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={filters.maxBeds}
                  onChange={(e) => handleFilterChange("maxBeds", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 text-white border border-neutral-800 
                           focus:outline-none focus:border-neutral-700
                           transition-all duration-200 placeholder:text-neutral-600 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Price Range & Sort Buttons */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Mức giá mỗi đêm
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
          {isActive && (
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