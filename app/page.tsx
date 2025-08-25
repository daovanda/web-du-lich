"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ServiceCard from "@/components/ServiceCard";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from("services")
          .select("*");
        if (servicesError) throw new Error(servicesError.message);
        setServices(servicesData || []);

        // Fetch locations
        const { data: locationsData, error: locationsError } = await supabase
          .from("locations")
          .select("*");
        if (locationsError) throw new Error(locationsError.message);
        setLocations(locationsData || []);
      } catch (err: any) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = [
    { label: "Chỗ ở", type: "stay", id: "stay" },
    { label: "Xe di chuyển", type: "car", id: "car" },
    { label: "Thuê xe máy", type: "motorbike", id: "motorbike" },
  ];

  // Filter services and locations based on search query
  const filteredServices = services.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Hero />
      <main className="flex-grow px-4 py-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Tìm kiếm dịch vụ hoặc địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center animate-fade-in">
          Khám phá & Đặt dịch vụ du lịch
        </h1>

        {error && <div className="text-red-600 text-center mb-4">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow p-4 animate-pulse"
              >
                <div className="w-full h-40 sm:h-48 bg-gray-200 rounded-md mb-3"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {categories.map((cat) => {
              const categoryServices = filteredServices.filter(
                (s) => s.type === cat.type
              );
              if (categoryServices.length === 0) return null;
              return (
                <div key={cat.type} id={cat.id} className="mb-10">
                  <Link href={`/${cat.type}`}>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 hover:text-blue-600 cursor-pointer">
                      {cat.label}
                    </h2>
                  </Link>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {categoryServices.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        <hr className="my-8 border-gray-200" />

        <ReviewSection
          locations={filteredLocations}
          loading={loading}
          error={error}
        />
      </main>
      <Footer />
    </div>
  );
}

function ReviewSection({
  locations,
  loading,
  error,
}: {
  locations: any[];
  loading: boolean;
  error: string | null;
}) {
  return (
    <div>
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 animate-fade-in">
        Địa điểm du lịch, quán ăn, chỗ chơi
      </h2>
      {error && <div className="text-red-600 text-center mb-4">{error}</div>}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow p-4 animate-pulse"
            >
              <div className="w-full h-40 sm:h-48 bg-gray-200 rounded-xl mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded mt-1"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {locations.length === 0 ? (
            <p className="text-sm text-gray-600">
              Không tìm thấy địa điểm nào.
            </p>
          ) : (
            locations.map((loc) => (
              <div
                key={loc.id}
                className="bg-white rounded-2xl shadow-md p-4 transition-transform hover:scale-105"
              >
                <img
                  src={loc.image_url}
                  alt={loc.name}
                  className="w-full h-40 sm:h-48 object-cover rounded-xl mb-2"
                />
                <h3 className="text-base sm:text-lg font-bold">{loc.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {loc.type} - {loc.region}
                </p>
                <p className="text-xs sm:text-sm mt-1">
                  {loc.description?.slice(0, 100)}...
                </p>
                <Link
                  href={`/location/${loc.id}`}
                  className="mt-3 inline-block text-blue-600 hover:text-blue-800 font-semibold text-sm"
                >
                  Xem chi tiết
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
