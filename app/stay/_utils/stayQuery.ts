// _utils/stayQuery.ts

import { Stay, StayFilterState } from "../_types/stay.types";

export function filterStaysByPrice(
  stays: Stay[],
  priceRange: StayFilterState["priceRange"]
): Stay[] {
  if (priceRange === "all") {
    return stays;
  }

  return stays.filter((stay) => {
    const priceStr = stay.price;
    if (!priceStr) return false;

    // Remove all non-digit characters
    const priceNum = parseInt(priceStr.replace(/[^0-9]/g, ""));

    if (isNaN(priceNum)) return false;

    switch (priceRange) {
      case "under1m":
        return priceNum < 1000000;
      case "1m-3m":
        return priceNum >= 1000000 && priceNum <= 3000000;
      case "over3m":
        return priceNum > 3000000;
      default:
        return true;
    }
  });
}

export function hasActiveFilters(filters: StayFilterState): boolean {
  return !!(
    filters.searchQuery ||
    filters.location ||
    (filters.minGuests && filters.minGuests !== "0") ||
    filters.maxGuests ||
    (filters.minRooms && filters.minRooms !== "0") ||
    filters.maxRooms ||
    (filters.minBeds && filters.minBeds !== "0") ||
    filters.maxBeds ||
    filters.priceRange !== "all" ||
    filters.checkInDate ||
    filters.checkOutDate
  );
}

export function calculateMinCheckOutDate(checkInDate: string): string {
  if (!checkInDate) {
    return new Date().toISOString().split('T')[0];
  }
  
  const checkIn = new Date(checkInDate);
  const minCheckOut = new Date(checkIn.getTime() + 86400000); // +1 day
  return minCheckOut.toISOString().split('T')[0];
}