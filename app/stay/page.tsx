"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ServiceCard from "@/components/ServiceCard";
import SpecialEvents from "@/components/SpecialEvents";
import ResizableLayout from "@/components/ResizableLayout";

export default function StayServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("services")
          .select("id, title, description, image_url, price, type, location")
          .eq("type", "stay")
          .or(
            `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`
          );

        if (error) throw new Error(error.message);
        setServices(data || []);
      } catch (err: any) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    };

    fetchServices();
  }, [searchQuery, isInitialLoad]);

  return (
    <ResizableLayout>
      {/* 🔥 Special Events Section */
        <div className="max-w-6xl mx-auto mt-8 px-4">
          <SpecialEvents />
          </div>}
      {/* ✅ Thêm margin-top để tránh bị header đè (đặc biệt ở mobile) */}
      <div className="text-white mt-16 md:mt-0">
        {/* Tagline / giá trị cốt lõi */}
        <div 
          className={`max-w-3xl mx-auto px-6 text-center py-8 transition-all duration-1000 ease-out ${
            isInitialLoad 
              ? 'opacity-0 translate-y-8' 
              : 'opacity-100 translate-y-0'
          }`}
        >
{/*}          <h1 className="text-3xl font-extrabold mb-3">
            Chạm – Kết nối – Trải nghiệm
          </h1> */}
          <p className="text-gray-400 text-sm sm:text-base">
            Chúng tôi mang đến hành trình khám phá du lịch mới mẻ, tối giản và
            gần gũi, nơi bạn có thể ghi dấu từng trải nghiệm trên
            bản đồ Việt Nam.
          </p>
        </div>

        <div 
          className={`max-w-2xl mx-auto p-6 transition-all duration-1000 ease-out delay-300 ${
            isInitialLoad 
              ? 'opacity-0 translate-y-8' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <div 
            className={`my-4 transition-all duration-700 ease-out delay-500 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-4' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <input
              type="text"
              placeholder="Tìm kiếm chỗ ở..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-gray-500 transition-all duration-300 ease-out hover:border-gray-600"
            />
          </div>

          <h2 
            className={`text-xl font-bold mb-4 transition-all duration-700 ease-out delay-700 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-4' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            Dịch vụ chỗ ở
          </h2>

          {error && (
            <div 
              className={`text-red-400 text-center mb-4 transition-all duration-500 ease-out ${
                error 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-2'
              }`}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div 
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 ease-out ${
                loading 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-95'
              }`}
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-gray-900 rounded-lg p-4 h-56 transition-all duration-300 ease-out ${
                    loading 
                      ? 'animate-pulse' 
                      : 'opacity-0'
                  }`}
                  style={{
                    animationDelay: `${i * 100}ms`
                  }}
                >
                  <div className="w-full h-32 bg-gray-800 rounded mb-3"></div>
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <p 
              className={`text-gray-400 text-center transition-all duration-700 ease-out delay-900 ${
                isInitialLoad 
                  ? 'opacity-0 translate-y-4' 
                  : 'opacity-100 translate-y-0'
              }`}
            >
              Không tìm thấy dịch vụ nào.
            </p>
          ) : (
            <div 
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 ease-out ${
                !loading 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-95'
              }`}
            >
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className={`transition-all duration-600 ease-out ${
                    isInitialLoad 
                      ? 'opacity-0 translate-y-6' 
                      : 'opacity-100 translate-y-0'
                  }`}
                  style={{
                    transitionDelay: `${800 + index * 100}ms`
                  }}
                >
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ResizableLayout>
  );
}