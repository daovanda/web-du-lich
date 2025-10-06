"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ServiceCard from "@/components/ServiceCard";
import SpecialEventsCarousel from "@/components/SpecialEvents";
import ResizableLayout from "@/components/ResizableLayout";

export default function Page() {
  const [services, setServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      if (data) setServices(data);
    };
    fetchServices();

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, [searchQuery]);

  return (
    <ResizableLayout
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="text-white mt-16 md:mt-0">
        {/* Tagline */}
        <div className="max-w-3xl mx-auto px-6 text-center py-8">
          <h1 className="text-3xl font-extrabold mb-3">
            Chạm – Kết nối – Trải nghiệm
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Chúng tôi mang đến hành trình khám phá du lịch mới mẻ, tối giản và
            đậm chất Instagram, nơi bạn có thể ghi dấu từng trải nghiệm trên bản
            đồ Việt Nam.
          </p>
        </div>

        {/* Dịch vụ */}
        <div className="max-w-2xl mx-auto p-6">
          {/* Thanh tìm kiếm trong nội dung */}
          <div className="my-4">
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-gray-500"
            />
          </div>

          <h2 className="text-xl font-bold mb-4">Khám phá dịch vụ</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </div>
    </ResizableLayout>
  );
}
