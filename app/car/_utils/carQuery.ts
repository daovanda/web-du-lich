import { Car, CarFilterState } from "../_types/car.types";

export function filterByDepartureTime(cars: Car[], departureTime: string) {
  if (!departureTime) return cars;

  return cars.filter((car) => {
    if (!car.departure_time) return false;
    
    const [hours] = car.departure_time.split(':').map(Number);
    
    switch (departureTime) {
      case "morning":
        return hours >= 6 && hours < 12;
      case "afternoon":
        return hours >= 12 && hours < 18;
      case "evening":
        return hours >= 18 && hours < 24;
      case "night":
        return hours >= 0 && hours < 6;
      default:
        return true;
    }
  });
}

export function filterByPriceRange(cars: Car[], priceRange: string) {
  if (priceRange === "all") return cars;

  return cars.filter((car) => {
    const priceNum = parseInt(car.price.replace(/[^0-9]/g, ""));
    if (isNaN(priceNum)) return false;

    switch (priceRange) {
      case "under300k":
        return priceNum < 300000;
      case "300k-600k":
        return priceNum >= 300000 && priceNum <= 600000;
      case "over600k":
        return priceNum > 600000;
      default:
        return true;
    }
  });
}