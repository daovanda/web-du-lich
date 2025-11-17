"use client";

import { useState, useEffect } from "react";
import ResizableLayout from "@/components/ResizableLayout";
import HeroSection from "@/app/map/components/HeroSection";
import StatsCard from "@/app/map/components/StatsCard";
import VietnamMap from "@/app/map/components/VietnamMap";
import ProvinceDetailModal from "@/app/map/components/ProvinceDetailModal";
import ProvinceHoverPreview from "@/app/map/components/ProvinceHoverPreview";
import { mapIdToName } from "@/app/map/lib/mapUtils";

export default function MapPage() {
  const [visitedCount, setVisitedCount] = useState<number>(0);
  const [visitedProvinceIds, setVisitedProvinces] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<{
    provinceId: string;
    visitedProvinceId: string;
    name: string;
  } | null>(null);

  // Hover preview state
  const [hoverPreview, setHoverPreview] = useState<{
    provinceId: string;
    visitedProvinceId: string;
    name: string;
    position: { x: number; y: number };
    isVisited: boolean;
  } | null>(null);
  
  const [isHoveringPreview, setIsHoveringPreview] = useState(false);
  
  const TOTAL_LOCATIONS = 65;
  const percent = ((visitedCount / TOTAL_LOCATIONS) * 100).toFixed(1);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle province click from map - open full modal hoặc đánh dấu
  const handleProvinceClick = (provinceId: string, visitedProvinceId?: string) => {
    if (visitedProvinceId) {
      // Tỉnh đã ghé - mở modal
      setSelectedProvince({
        provinceId,
        visitedProvinceId,
        name: mapIdToName(provinceId),
      });
      setModalOpen(true);
      setHoverPreview(null); // Close hover preview
    } else {
      // Tỉnh chưa ghé - không làm gì (để user click vào bản đồ)
      setHoverPreview(null);
    }
  };

  // Handle province hover - show mini preview
  const handleProvinceHover = (
    provinceId: string,
    visitedProvinceId: string,
    position: { x: number; y: number }
  ) => {
    const isVisited = !!visitedProvinceId;
    console.log("🖱️ Hover:", { provinceId, visitedProvinceId, isVisited, position }); // Debug log
    
    setHoverPreview({
      provinceId,
      visitedProvinceId: visitedProvinceId || '', // Ensure it's not null
      name: mapIdToName(provinceId),
      position,
      isVisited,
    });
  };

  // Handle province leave - hide preview
  const handleProvinceLeave = () => {
    // Only hide if not hovering preview
    if (!isHoveringPreview) {
      setHoverPreview(null);
    }
  };

  // Handle preview hover change
  const handlePreviewHoverChange = (isHovering: boolean) => {
    setIsHoveringPreview(isHovering);
    
    // If leaving preview, hide it
    if (!isHovering) {
      setHoverPreview(null);
    }
  };

  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 py-8 pt-24 md:pt-8 space-y-8">
          
          {/* Hero Section */}
          <div 
            className={`transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <HeroSection />
          </div>

          {/* Stats Card */}
          <div 
            className={`transition-all duration-700 ease-out delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <StatsCard
              visitedCount={visitedCount}
              total={TOTAL_LOCATIONS}
              percent={percent}
              visitedProvinceIds={visitedProvinceIds}
            />
          </div>

          {/* Vietnam Map */}
          <div 
            className={`transition-all duration-700 ease-out delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <VietnamMap 
              setVisitedCount={setVisitedCount}
              setVisitedProvinces={setVisitedProvinces}
              onProvinceClick={handleProvinceClick}
              onProvinceHover={handleProvinceHover}
              onProvinceLeave={handleProvinceLeave}
              isHoveringPreview={isHoveringPreview}
            />
          </div>

          {/* Tips Section */}
          <div 
            className={`transition-all duration-700 ease-out delay-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Hướng dẫn sử dụng</h3>
              </div>
              
              <div className="space-y-3 pl-13">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-700">
                    <span className="text-xs font-semibold text-neutral-400">1</span>
                  </div>
                  <p className="text-sm text-neutral-400">
                    <span className="text-white font-medium">Nhấn vào tỉnh/thành</span> để đánh dấu và mở modal thêm ảnh, ghi chú
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-700">
                    <span className="text-xs font-semibold text-neutral-400">2</span>
                  </div>
                  <p className="text-sm text-neutral-400">
                    <span className="text-white font-medium">Upload ảnh</span> và viết ghi chú về chuyến đi
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-700">
                    <span className="text-xs font-semibold text-neutral-400">3</span>
                  </div>
                  <p className="text-sm text-neutral-400">
                    <span className="text-white font-medium">Nhấn lại</span> tỉnh đã đánh dấu để bỏ đánh dấu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Preview */}
      {hoverPreview && (
        <>
          {console.log("🎨 Rendering HoverPreview:", hoverPreview)}
          <ProvinceHoverPreview
            visitedProvinceId={hoverPreview.visitedProvinceId}
            provinceName={hoverPreview.name}
            position={hoverPreview.position}
            isVisited={hoverPreview.isVisited}
            onOpenFull={() => handleProvinceClick(hoverPreview.provinceId, hoverPreview.visitedProvinceId)}
            onHoverChange={setIsHoveringPreview}
          />
        </>
      )}

      {/* Province Detail Modal */}
      {selectedProvince && (
        <ProvinceDetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          provinceId={selectedProvince.provinceId}
          visitedProvinceId={selectedProvince.visitedProvinceId}
          provinceName={selectedProvince.name}
        />
      )}
    </ResizableLayout>
  );
}