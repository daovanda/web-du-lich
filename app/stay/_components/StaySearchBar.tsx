// _components/StaySearchBar.tsx

"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X, MapPin, Users, Calendar, Bed, DoorOpen } from "lucide-react";
import { StayFilterState, PRICE_RANGES } from "../_types/stay.types";
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
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, địa điểm, mô tả..."
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

      {/* Quick Location Selection */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {locations.slice(0, 4).map((location) => (
          <button
            key={location}
            onClick={() => handleFilterChange("location", location)}
            className={`px-3 py-2 rounded-lg border text-sm transition-all ${
              filters.location === location
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white"
            }`}
          >
            📍 {location}
          </button>
        ))}
      </div>

      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 
                  border transition-all duration-300 w-full ${
                    isActive
                      ? "border-blue-500 text-blue-400"
                      : "border-gray-700 text-gray-300"
                  }`}
      >
        <SlidersHorizontal className="w-5 h-5" />
        <span className="font-medium">Bộ lọc nâng cao</span>
        {isActive && (
          <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
            Đang lọc
          </span>
        )}
      </button>

      {/* Expanded Filters */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-[1200px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6">
          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 text-blue-400" />
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
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Ngày nhận phòng
              </label>
              <input
                type="date"
                value={filters.checkInDate}
                onChange={(e) => handleFilterChange("checkInDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-700 
                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                         transition-all duration-200"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 text-green-400" />
                Ngày trả phòng
              </label>
              <input
                type="date"
                value={filters.checkOutDate}
                onChange={(e) => handleFilterChange("checkOutDate", e.target.value)}
                min={minCheckOutDate}
                disabled={!filters.checkInDate}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-700 
                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Number of People, Rooms & Beds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4 text-orange-400" />
                Số người
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  value={filters.minGuests}
                  onChange={(e) => handleFilterChange("minGuests", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-200 placeholder-gray-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={filters.maxGuests}
                  onChange={(e) => handleFilterChange("maxGuests", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-200 placeholder-gray-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <DoorOpen className="w-4 h-4 text-cyan-400" />
                Số phòng
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  value={filters.minRooms}
                  onChange={(e) => handleFilterChange("minRooms", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-200 placeholder-gray-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={filters.maxRooms}
                  onChange={(e) => handleFilterChange("maxRooms", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-200 placeholder-gray-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Bed className="w-4 h-4 text-pink-400" />
                Số giường
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  value={filters.minBeds}
                  onChange={(e) => handleFilterChange("minBeds", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-200 placeholder-gray-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={filters.maxBeds}
                  onChange={(e) => handleFilterChange("maxBeds", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-200 placeholder-gray-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Price Range Buttons */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
              💰 Mức giá mỗi đêm
            </label>
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
          {isActive && (
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