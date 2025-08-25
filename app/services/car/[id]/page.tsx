"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CarDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .eq("type", "car")
          .single();
        if (fetchError) throw new Error(fetchError.message);
        setService(data);
      } catch (err: any) {
        setError("Không tìm thấy dịch vụ.");
        console.error("Error fetching service:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p>Đang tải...</p>;
  if (error || !service) return <p>{error || "Không tìm thấy dịch vụ"}</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">
          Xe di chuyển: {service.title}
        </h1>
        <img
          src={service.image_url}
          alt={service.title}
          className="w-full h-64 object-cover rounded mb-4"
        />
        <p className="mt-4 text-gray-700">
          {service.description} {/* Mô tả chi tiết đầy đủ */}
        </p>
        <p className="mt-2 font-semibold">Tuyến: {service.location}</p>
        <p className="text-blue-600 font-bold mt-2">Giá: {service.price}</p>
        {/* Form đặt chỗ */}
        <form className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Đặt xe</h3>
          <input
            type="date"
            placeholder="Ngày khởi hành"
            className="w-full border p-2 mb-2 rounded"
          />
          <input
            type="date"
            placeholder="Ngày về"
            className="w-full border p-2 mb-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Đặt ngay
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
