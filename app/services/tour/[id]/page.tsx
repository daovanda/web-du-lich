"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

type Tour = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  price: string | null;
  images: string[] | null;
  duration: string | null;
  start_date: string | null;
  end_date: string | null;
  average_rating: number;
  reviews_count: number;
};

export default function TourDetailPage() {
  const { id } = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTour = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .eq("type", "tour")
        .single();

      if (error) console.error("Lỗi tải tour:", error);
      else setTour(data);
      setLoading(false);
    };

    fetchTour();
  }, [id]);

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;
  if (!tour) return <div className="p-6 text-center">Không tìm thấy tour</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Tiêu đề */}
      <h1 className="text-3xl font-bold mb-4">{tour.title}</h1>

      {/* Hình ảnh */}
      {tour.images && tour.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {tour.images.map((img, i) => (
            <div key={i} className="relative aspect-video">
              <Image
                src={img}
                alt={`Tour image ${i + 1}`}
                fill
                className="object-cover rounded-xl"
              />
            </div>
          ))}
        </div>
      )}

      {/* Thông tin tổng quan */}
      <div className="space-y-2 mb-6">
        <p><strong>Địa điểm:</strong> {tour.location || "Chưa cập nhật"}</p>
        <p><strong>Giá:</strong> {tour.price ? `${tour.price} VNĐ` : "Liên hệ"}</p>
        {tour.duration && <p><strong>Thời lượng:</strong> {tour.duration}</p>}
        {tour.start_date && tour.end_date && (
          <p>
            <strong>Thời gian khởi hành:</strong>{" "}
            {new Date(tour.start_date).toLocaleDateString()} →{" "}
            {new Date(tour.end_date).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Mô tả */}
      {tour.description && (
        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold mb-2">Mô tả chi tiết</h2>
          <p className="text-gray-700 whitespace-pre-line">{tour.description}</p>
        </div>
      )}

      {/* Đánh giá */}
      <div className="mt-6 border-t pt-4 text-gray-600">
        <p>
          ⭐ {tour.average_rating?.toFixed(1) || "Chưa có đánh giá"} (
          {tour.reviews_count || 0} đánh giá)
        </p>
      </div>
    </div>
  );
}
