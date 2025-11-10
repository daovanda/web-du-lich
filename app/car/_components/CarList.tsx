    import ServiceCard from "@/components/ServiceCard";
    import CarLoadingSkeleton from "./CarLoadingSkeleton";
    import { Car } from "../_types/car.types";
    import { transformCarToCardData } from "../_utils/carTransform";

    interface CarListProps {
    cars: Car[];
    loading: boolean;
    error: string | null;
    isInitialLoad: boolean;
    }

    export default function CarList({ cars, loading, error, isInitialLoad }: CarListProps) {
    // Error state
    if (error) {
        return (
        <div className="text-red-400 text-center mb-4 transition-all duration-500 ease-out">
            {error}
        </div>
        );
    }

    // Loading state
    if (loading) {
        return <CarLoadingSkeleton count={6} />;
    }

    // Empty state
    if (cars.length === 0) {
        return (
        <div className="text-center py-12">
            <div className="text-gray-500 text-6xl mb-4">🚌</div>
            <p className="text-gray-400 text-lg mb-2">
            Không tìm thấy dịch vụ nào
            </p>
            <p className="text-gray-500 text-sm">
            Vui lòng thử thay đổi bộ lọc hoặc tìm kiếm khác
            </p>
        </div>
        );
    }

    // Data state
    return (
        <div 
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 ease-out ${
            !loading ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        >
        {cars.map((car, index) => (
            <div
            key={car.id}
            className={`transition-all duration-600 ease-out ${
                isInitialLoad ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
            }`}
            style={{
                transitionDelay: `${800 + index * 100}ms`,
            }}
            >
            <ServiceCard service={transformCarToCardData(car)} />
            </div>
        ))}
        </div>
    );
    }