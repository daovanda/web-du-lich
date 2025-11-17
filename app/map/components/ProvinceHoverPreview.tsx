"use client";

import { useState, useEffect } from "react";
import { getProvincePhotos } from "@/app/map/api/api";
import type { ProvincePhoto } from "@/app/map/types/types";

type ProvinceHoverPreviewProps = {
  visitedProvinceId: string | null;
  provinceName: string;
  position: { x: number; y: number };
  onOpenFull: () => void;
  isVisited: boolean; // Thêm flag để biết đã ghé chưa
};

export default function ProvinceHoverPreview({
  visitedProvinceId,
  provinceName,
  position,
  onOpenFull,
  isVisited,
}: ProvinceHoverPreviewProps) {
  const [photos, setPhotos] = useState<ProvincePhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isHoveringPreview, setIsHoveringPreview] = useState(false);

  console.log("🎨 ProvinceHoverPreview render:", { 
    visitedProvinceId, 
    provinceName, 
    position, 
    isVisited,
    hasVisitedId: !!visitedProvinceId 
  });

  useEffect(() => {
    // Only fetch photos if province is visited AND has visitedProvinceId
    if (!isVisited || !visitedProvinceId) {
      console.log("⏭️ Skipping photo fetch - not visited or no ID");
      setPhotos([]);
      return;
    }

    console.log("📸 Fetching photos for:", visitedProvinceId);
    let mounted = true;
    setLoading(true);

    (async () => {
      const data = await getProvincePhotos(visitedProvinceId);
      console.log("📸 Photos fetched:", data?.length || 0);
      if (mounted && data) {
        setPhotos(data.slice(0, 3)); // Only show first 3 photos
      }
      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [visitedProvinceId, isVisited]);

  console.log("✅ Rendering preview modal with isVisited:", isVisited);

  return (
    <div
      className="fixed z-40 pointer-events-none"
      style={{
        left: `${position.x + 20}px`,
        top: `${position.y - 100}px`,
      }}
    >
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden w-72 pointer-events-auto">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 flex items-center gap-2">
          <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h4 className="text-sm font-semibold text-white truncate">{provinceName}</h4>
        </div>

        {/* Content */}
        <div className="p-4">
          {!isVisited ? (
            // Tỉnh chưa ghé - Show CTA
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white mb-1">Chưa ghé thăm</p>
              <p className="text-xs text-neutral-500 mb-3">Nhấn để đánh dấu đã đi</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
            </div>
          ) : photos.length > 0 ? (
            <div className="space-y-3">
              {/* Photo preview grid */}
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden bg-neutral-800 border border-neutral-700"
                  >
                    <img
                      src={photo.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={onOpenFull}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Xem chi tiết
                </button>
                <button
                  onClick={onOpenFull}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors"
                  title="Thêm ảnh"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs text-neutral-500 mb-3">Chưa có ảnh nào</p>
              <button
                onClick={onOpenFull}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm ảnh & ghi chú
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}