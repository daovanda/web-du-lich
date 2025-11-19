"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { colors, mapIdToName } from "@/app/map/lib/mapUtils";
import { addPin, updatePinPositions } from "@/app/map/lib/mapPinUtils";
import { createTooltip, showTooltip, moveTooltip, hideTooltip, removeTooltip } from "@/app/map/lib/mapTooltipUtils";
import { supabase } from "@/lib/supabase";
import { getUserVisitedProvinces, toggleProvince } from "@/app/map/api/api";

type VietnamMapProps = {
  setVisitedCount: (n: number) => void;
  setVisitedProvinces: (ids: string[]) => void;
  onProvinceHover?: (provinceId: string, visitedProvinceId: string, position: { x: number; y: number }) => void;
  onProvinceLeave?: () => void;
  onProvinceClick?: (provinceId: string, visitedProvinceId?: string) => void;
  isHoveringPreview?: boolean;
};

interface MapContainerElement extends HTMLDivElement {
  _mutationObserver?: MutationObserver;
}

export default function VietnamMap({
  setVisitedCount,
  setVisitedProvinces,
  onProvinceHover,
  onProvinceLeave,
  onProvinceClick,
  isHoveringPreview,
}: VietnamMapProps) {
  const svgContainerRef = useRef<MapContainerElement>(null);
  const eventsAttachedRef = useRef(false);
  const visitedRef = useRef<Map<string, string>>(new Map());
  const pinsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateControllerRef = useRef<AbortController | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const STROKE_WIDTH_PX = 1;
  const HOVER_DELAY = 400; // ✅ Tăng delay lên 400ms

  // ✅ Memoized update pin positions với throttle
  const handlePinUpdate = useCallback(() => {
    const mapContainer = svgContainerRef.current;
    if (mapContainer) {
      updatePinPositions(mapContainer, pinsRef.current);
    }
  }, []);

  // ✅ Throttled version cho scroll
  const throttledPinUpdate = useCallback(() => {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(handlePinUpdate, 100);
    };
  }, [handlePinUpdate])();

  // Initialize tooltip once on mount
  useEffect(() => {
    if (!tooltipRef.current) {
      tooltipRef.current = createTooltip();
    }

    return () => {
      if (tooltipRef.current) {
        removeTooltip(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, []);

  // Load user session
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user) {
          setUserId(session.user.id);
        }
      } catch (err) {
        console.error("Failed to get session:", err);
        setError("Không thể tải phiên đăng nhập");
      }
    };
    getSession();
  }, []);

  // Load visited provinces from DB
  useEffect(() => {
    if (!userId) return;

    const loadVisitedProvinces = async () => {
      try {
        const data = await getUserVisitedProvinces(userId);
        if (data) {
          const newVisited = new Map<string, string>();
          data.forEach((item) => {
            newVisited.set(item.province_id, item.id);
          });
          visitedRef.current = newVisited;
          setVisitedCount(newVisited.size);
          setVisitedProvinces(Array.from(newVisited.keys()));
          setDataLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load visited provinces:", err);
        setError("Không thể tải dữ liệu tỉnh thành");
      }
    };

    loadVisitedProvinces();
  }, [userId, setVisitedCount, setVisitedProvinces]);

  // ✅ Optimistic toggle với rollback
  const handleProvinceToggle = useCallback(async (id: string, pathElement: SVGPathElement, mapContainer: HTMLDivElement) => {
    if (!userId) return;
    
    // Cancel any pending update
    if (updateControllerRef.current) {
      updateControllerRef.current.abort();
    }
    updateControllerRef.current = new AbortController();

    // Store previous state for rollback
    const wasVisited = visitedRef.current.has(id);
    const previousVisitedId = visitedRef.current.get(id);
    const previousColor = pathElement.style.fill;
    
    // ✅ Optimistic update
    if (wasVisited) {
      // Remove optimistically
      pathElement.style.fill = "rgba(115,115,115,0.3)";
      pathElement.classList.remove("visited");
      visitedRef.current.delete(id);
      const pin = pinsRef.current.get(id);
      if (pin) {
        pin.remove();
        pinsRef.current.delete(id);
      }
    } else {
      // Add optimistically
      const color = colors[Math.floor(Math.random() * colors.length)];
      pathElement.style.fill = color;
      pathElement.classList.add("visited");
      pathElement.dataset.pinColor = color;
      visitedRef.current.set(id, "temp");
      addPin(pathElement, color, id, mapContainer, pinsRef.current);
    }

    setVisitedCount(visitedRef.current.size);
    setVisitedProvinces(Array.from(visitedRef.current.keys()));

    try {
      const result = await toggleProvince(userId, id);
      
      if (!result.success) {
        throw new Error("Toggle failed");
      }

      if (result.action === "added") {
        visitedRef.current.set(id, result.data.id);
      }
      
      setVisitedCount(visitedRef.current.size);
      setVisitedProvinces(Array.from(visitedRef.current.keys()));
      
    } catch (err) {
      console.error("Failed to toggle province:", err);
      
      // ✅ Rollback on error
      if (wasVisited && previousVisitedId) {
        pathElement.style.fill = previousColor;
        pathElement.classList.add("visited");
        visitedRef.current.set(id, previousVisitedId);
        const color = pathElement.dataset.pinColor || colors[0];
        addPin(pathElement, color, id, mapContainer, pinsRef.current);
      } else {
        pathElement.style.fill = "rgba(115,115,115,0.3)";
        pathElement.classList.remove("visited");
        visitedRef.current.delete(id);
        const pin = pinsRef.current.get(id);
        if (pin) {
          pin.remove();
          pinsRef.current.delete(id);
        }
      }
      
      setVisitedCount(visitedRef.current.size);
      setVisitedProvinces(Array.from(visitedRef.current.keys()));
      setError("Không thể cập nhật. Vui lòng thử lại.");
      
      setTimeout(() => setError(null), 3000);
    }
  }, [userId, setVisitedCount, setVisitedProvinces]);

  useEffect(() => {
    if (!svgContainerRef.current || eventsAttachedRef.current || !userId || !dataLoaded) return;

    const loadSvgAndAttachEvents = async () => {
      try {
        const response = await fetch("/vietnamese_map_patched.svg");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const txt = await response.text();

        const container = svgContainerRef.current;
        if (!container) return;

        container.innerHTML = txt;
        setIsLoading(false);

        const provinces = container.querySelectorAll<SVGPathElement>('path[id^="province-"]');

        if (!tooltipRef.current) {
          tooltipRef.current = createTooltip();
        }

        const validIds = new Set<string>(
          Array.from(provinces)
            .map((p) => p.getAttribute("id") || "")
            .filter((id) => id && parseInt(id.replace("province-", "")) <= 65)
        );

        provinces.forEach((p) => {
          const id = p.getAttribute("id") || "";
          if (!id || !validIds.has(id)) return;

          p.style.stroke = "rgba(255,255,255,0.2)";
          p.style.strokeWidth = `${STROKE_WIDTH_PX}px`;
          p.setAttribute("vector-effect", "non-scaling-stroke");

          // Initialize color based on visited state
          if (visitedRef.current.has(id)) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            p.style.fill = color;
            p.classList.add("visited");
            p.dataset.pinColor = color;
            setTimeout(() => addPin(p, color, id, container, pinsRef.current), 100);
          } else {
            p.style.fill = "rgba(115,115,115,0.3)";
          }

          // ✅ Click handler với debounce
          let clickTimeout: NodeJS.Timeout | null = null;
          p.addEventListener("click", (e) => {
            e.stopPropagation();
            
            if (clickTimeout) return;
            
            clickTimeout = setTimeout(() => {
              clickTimeout = null;
            }, 300);
            
            handleProvinceToggle(id, p, container);
          });

          // ✅ IMPROVED: Hover handlers with longer delay
          p.addEventListener("mouseenter", (e) => {
            p.style.filter = "brightness(1.2)";
            
            // Clear any existing timeout
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
            
            const visitedProvinceId = visitedRef.current.get(id);
            
            if (!tooltipRef.current || !document.body.contains(tooltipRef.current)) {
              tooltipRef.current = createTooltip();
            }
            
            hideTooltip(tooltipRef.current);
            
            if (onProvinceHover) {
              onProvinceHover(id, visitedProvinceId || '', { x: e.clientX, y: e.clientY });
            }
          });
            
          p.addEventListener("mouseleave", () => {
            p.style.filter = "";
            
            // ✅ Luôn set timeout, không check isHoveringPreview ở đây
            // Vì isHoveringPreview có thể chưa update (closure issue)
            hoverTimeoutRef.current = setTimeout(() => {
              // onProvinceLeave sẽ tự check isHoveringPreview bên trong
              if (onProvinceLeave) {
                onProvinceLeave();
              }
            }, HOVER_DELAY);
            
            if (tooltipRef.current && document.body.contains(tooltipRef.current)) {
              hideTooltip(tooltipRef.current);
            }
          });

          // Touch handler for mobile
          p.addEventListener("touchstart", async (e) => {
            const touch = e.touches[0];
            if (!touch) return;
            
            const provinceName = mapIdToName(id);
            if (tooltipRef.current) {
              showTooltip(tooltipRef.current, provinceName);
              moveTooltip(tooltipRef.current, touch.clientX, touch.clientY);
              setTimeout(() => {
                if (tooltipRef.current) hideTooltip(tooltipRef.current);
              }, 1500);
            }

            await handleProvinceToggle(id, p, container);
          }, { passive: true });
        });

        eventsAttachedRef.current = true;

        const scrollController = new AbortController();
        const resizeController = new AbortController();

        window.addEventListener("scroll", throttledPinUpdate, { 
          passive: true,
          signal: scrollController.signal 
        });
        
        window.addEventListener("resize", handlePinUpdate, {
          signal: resizeController.signal
        });

        container.addEventListener("scroll", throttledPinUpdate, { 
          passive: true,
          signal: scrollController.signal 
        });

        // ✅ MutationObserver thay vì periodic check
        const observer = new MutationObserver((mutations) => {
          let needsUpdate = false;
          
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.removedNodes.forEach((node) => {
                if (node instanceof HTMLElement && node.classList.contains('map-pin-overlay')) {
                  needsUpdate = true;
                }
              });
            }
          });

          if (needsUpdate) {
            provinces.forEach((p) => {
              const id = p.getAttribute("id") || "";
              if (!id) return;
              
              const visitedProvinceId = visitedRef.current.get(id);
              if (visitedProvinceId && !pinsRef.current.has(id)) {
                const color = p.dataset.pinColor || colors[0];
                addPin(p, color, id, container, pinsRef.current);
              }
            });
          }
        });

        observer.observe(container, {
          childList: true,
          subtree: true,
        });

        container._mutationObserver = observer;
        (container as any)._scrollController = scrollController;
        (container as any)._resizeController = resizeController;

      } catch (error) {
        console.error("Error loading SVG:", error);
        setError("Không thể tải bản đồ");
        setIsLoading(false);
      }
    };

    loadSvgAndAttachEvents();

    return () => {
      const container = svgContainerRef.current;
      
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      if (updateControllerRef.current) {
        updateControllerRef.current.abort();
      }

      if (container) {
        if (container._mutationObserver) {
          container._mutationObserver.disconnect();
        }
        if ((container as any)._scrollController) {
          (container as any)._scrollController.abort();
        }
        if ((container as any)._resizeController) {
          (container as any)._resizeController.abort();
        }
      }

      pinsRef.current.forEach((pin) => pin.remove());
      pinsRef.current.clear();
      
      if (tooltipRef.current) {
        removeTooltip(tooltipRef.current);
      }
    };
  }, [userId, dataLoaded, setVisitedCount, setVisitedProvinces, onProvinceHover, onProvinceLeave, isHoveringPreview, handleProvinceToggle, handlePinUpdate, throttledPinUpdate]);

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden">
      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Bản đồ Việt Nam</h3>
            <p className="text-xs text-neutral-500">Nhấn để đánh dấu tỉnh thành</p>
          </div>
        </div>

        {/* Color Legend */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"></div>
            <span className="text-neutral-500">Đã ghé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
            <span className="text-neutral-500">Chưa ghé</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-[#0a0a0a]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-neutral-500">Đang tải bản đồ...</p>
            </div>
          </div>
        )}

        <div
          id="vn-map-root"
          ref={svgContainerRef}
          className="w-full p-4 overflow-auto touch-pan-x touch-pan-y relative"
          style={{ minHeight: "60vh", maxHeight: "75vh" }}
        />
      </div>

      {/* Footer Tips */}
      <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/50">
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Di chuột hoặc chạm vào tỉnh để xem tên. Nhấn để đánh dấu đã ghé thăm.</span>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        #vn-map-root {
          position: relative;
          scrollbar-width: thin;
          scrollbar-color: rgba(115, 115, 115, 0.3) transparent;
        }

        #vn-map-root::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        #vn-map-root::-webkit-scrollbar-track {
          background: transparent;
        }

        #vn-map-root::-webkit-scrollbar-thumb {
          background: rgba(115, 115, 115, 0.3);
          border-radius: 4px;
        }

        #vn-map-root::-webkit-scrollbar-thumb:hover {
          background: rgba(115, 115, 115, 0.5);
        }

        #vn-map-root svg {
          display: block;
          width: 100%;
          height: auto;
          max-width: 100%;
          aspect-ratio: 3/4;
        }

        #vn-map-root path {
          cursor: pointer;
          transition: fill 0.3s ease, filter 0.2s ease;
        }

        #vn-map-root path:hover {
          filter: brightness(1.2) !important;
        }

        .map-pin-overlay {
          will-change: transform, opacity;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}