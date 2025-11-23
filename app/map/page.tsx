"use client";

import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import ResizableLayout from "@/components/ResizableLayout";
import HeroSection from "@/app/map/components/HeroSection";
import StatsCard from "@/app/map/components/StatsCard";
import VietnamMap from "@/app/map/components/VietnamMap";
import ProvinceDetailModal from "@/app/map/components/ProvinceDetailModal";
import ProvinceHoverPreview from "@/app/map/components/ProvinceHoverPreview";
import ShareMapButton from "@/app/map/components/ShareMapButton";
import { mapIdToName } from "@/app/map/lib/mapUtils";

// ✅ Error Boundary Component
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Map Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-neutral-950 border border-neutral-800 rounded-xl p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Đã có lỗi xảy ra</h3>
            <p className="text-sm text-neutral-400 mb-4">
              {this.state.error?.message || "Không thể tải bản đồ. Vui lòng thử lại."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringPreviewRef = useRef(false); // ✅ CRITICAL: Ref để track state thực sự, không có delay
  const currentProvinceRef = useRef<string | null>(null); // ✅ Track tỉnh hiện tại đang show preview
  
  const TOTAL_LOCATIONS = 65;
  const percent = ((visitedCount / TOTAL_LOCATIONS) * 100).toFixed(1);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Cleanup all timeouts
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
    };
  }, []);

  const handleProvinceClick = useCallback((provinceId: string, visitedProvinceId?: string) => {
    if (visitedProvinceId) {
      setSelectedProvince({
        provinceId,
        visitedProvinceId,
        name: mapIdToName(provinceId),
      });
      setModalOpen(true);
      setHoverPreview(null);
    } else {
      setHoverPreview(null);
    }
  }, []);

  // ✅ Show preview với minimal debounce (chỉ để tránh flicker)
  const handleProvinceHover = useCallback((
    provinceId: string,
    visitedProvinceId: string,
    position: { x: number; y: number }
  ) => {
    console.log("🗺️ Province HOVER:", provinceId);
    
    // Track tỉnh hiện tại
    currentProvinceRef.current = provinceId;
    
    // ✅ CRITICAL: Clear ALL timeouts khi hover vào tỉnh
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
      console.log("  ↳ Cleared hide timeout");
    }

    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      console.log("  ↳ Cleared old show timeout");
    }

    const isVisited = !!visitedProvinceId;
    
    // ✅ Show NGAY LẬP TỨC, không delay
    console.log("  ↳ Setting preview immediately");
    setHoverPreview({
      provinceId,
      visitedProvinceId: visitedProvinceId || '',
      name: mapIdToName(provinceId),
      position,
      isVisited,
    });
  }, []);

  // ✅ Hide với delay đủ lớn để user có thể di chuyển chuột
  const handleProvinceLeave = useCallback(() => {
    console.log("🗺️ Province LEAVE");
    
    // Clear tracking
    currentProvinceRef.current = null;
    
    // ✅ KHÔNG clear show timeout ở đây - để preview có thể show
    
    // Clear timeout cũ
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      console.log("  ↳ Cleared old hide timeout");
    }

    // ✅ Delay 500ms để user có thời gian di chuyển chuột sang preview
    hoverTimeoutRef.current = setTimeout(() => {
      // ✅ CRITICAL: Check ref thay vì state vì ref update ngay lập tức
      const isCurrentlyHovering = isHoveringPreviewRef.current;
      console.log("⏰ Hide timeout fired, isHovering (ref):", isCurrentlyHovering);
      
      // ✅ Chỉ hide nếu KHÔNG đang hover preview
      if (!isCurrentlyHovering) {
        console.log("✅ Hiding preview");
        setHoverPreview(null);
        currentProvinceRef.current = null;
      } else {
        console.log("❌ NOT hiding - user is hovering preview/bridge");
      }
    }, 500); // Tăng lên 500ms để dễ hơn
  }, []); // ✅ Không cần dependency vì dùng ref

  // ✅ Handle preview hover - clear hide timeout khi hover vào preview
  const handlePreviewHoverChange = useCallback((isHovering: boolean) => {
    console.log("🎯 Preview hover change:", isHovering);
    
    // ✅ CRITICAL: Update ref NGAY LẬP TỨC (synchronous)
    isHoveringPreviewRef.current = isHovering;
    setIsHoveringPreview(isHovering);
    
    if (isHovering) {
      console.log("✅ User hovering preview/bridge - clearing hide timeout");
      // ✅ Clear hide timeout để preview không bị ẩn
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
        console.log("  ↳ Cleared hide timeout");
      }
    } else {
      console.log("❌ User left preview/bridge - scheduling hide");
      
      // Clear old timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      // Khi leave preview, hide sau delay ngắn
      hoverTimeoutRef.current = setTimeout(() => {
        console.log("⏰ Preview leave timeout - hiding now");
        setHoverPreview(null);
        isHoveringPreviewRef.current = false;
      }, 150); // 150ms delay khi leave preview
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => {
      setSelectedProvince(null);
    }, 300);
  }, []);

  return (
    <MapErrorBoundary>
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

            {/* ✅ Share Map Button */}
            <div 
              className={`transition-all duration-700 ease-out delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
            >
              <ShareMapButton
                visitedCount={visitedCount}
                total={TOTAL_LOCATIONS}
                visitedProvinces={visitedProvinceIds}
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
                      <span className="text-white font-medium">Di chuột vào tỉnh</span> để xem preview ảnh và thông tin
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-700">
                      <span className="text-xs font-semibold text-neutral-400">2</span>
                    </div>
                    <p className="text-sm text-neutral-400">
                      <span className="text-white font-medium">Nhấn vào preview</span> để mở modal chi tiết, thêm ảnh và ghi chú
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
          <ProvinceHoverPreview
            visitedProvinceId={hoverPreview.visitedProvinceId}
            provinceName={hoverPreview.name}
            position={hoverPreview.position}
            isVisited={hoverPreview.isVisited}
            onOpenFull={() => handleProvinceClick(hoverPreview.provinceId, hoverPreview.visitedProvinceId)}
            onHoverChange={handlePreviewHoverChange}
          />
        )}

        {/* Province Detail Modal */}
        {selectedProvince && (
          <ProvinceDetailModal
            isOpen={modalOpen}
            onClose={handleCloseModal}
            provinceId={selectedProvince.provinceId}
            visitedProvinceId={selectedProvince.visitedProvinceId}
            provinceName={selectedProvince.name}
          />
        )}
      </ResizableLayout>
    </MapErrorBoundary>
  );
}