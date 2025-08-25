"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ServiceCard from "@/components/ServiceCard";
import Header from "@/components/Header";
import Hero from "@/components/Hero"; // Import Hero component
import Footer from "@/components/Footer";

export default function MotorbikeServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("type", "motorbike");
        if (error) throw new Error(error.message);
        setServices(data || []);
      } catch (err: any) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter services based on search query
  const filteredServices = services.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Hero /> {/* Add Hero component here, similar to the home page */}
      <main className="flex-grow px-4 py-6 max-w-7xl mx-auto w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center animate-fade-in">
          Dịch vụ thuê xe máy
        </h1>
        <div className="mb-6">
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Tìm kiếm xe máy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredServices.length === 0 ? (
              <p className="text-sm text-gray-600">
                Không tìm thấy dịch vụ nào.
              </p>
            ) : (
              filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
