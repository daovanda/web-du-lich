"use client";

import { useEffect, useRef, useState } from "react";
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
  isHoveringPreview?: boolean; // Thêm flag để biết đang hover preview
};

export default function VietnamMap({
  setVisitedCount,
  setVisitedProvinces,
  onProvinceHover,
  onProvinceLeave,
  onProvinceClick,
}: VietnamMapProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const eventsAttachedRef = useRef(false);
  const visitedRef = useRef<Map<string, string>>(new Map()); // provinceId -> visitedProvinceId
  const pinsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const STROKE_WIDTH_PX = 1;

  console.log("🗺️ VietnamMap props:", {
    hasHoverCallback: !!onProvinceHover,
    hasLeaveCallback: !!onProvinceLeave,
    hasClickCallback: !!onProvinceClick,
  });

  // Initialize tooltip once on mount
  useEffect(() => {
    if (!tooltipRef.current) {
      tooltipRef.current = createTooltip();
      console.log("✅ Tooltip initialized on mount");
    }

    return () => {
      if (tooltipRef.current) {
        removeTooltip(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, []); // Only run once

  // Load user session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getSession();
  }, []);

  // Load visited provinces from DB
  useEffect(() => {
    if (!userId) return;

    const loadVisitedProvinces = async () => {
      const data = await getUserVisitedProvinces(userId);
      if (data) {
        const newVisited = new Map<string, string>();
        data.forEach((item) => {
          newVisited.set(item.province_id, item.id);
        });
        visitedRef.current = newVisited;
        setVisitedCount(newVisited.size);
        setVisitedProvinces(Array.from(newVisited.keys()));
        setDataLoaded(true); // Mark data as loaded
      }
    };

    loadVisitedProvinces();
  }, [userId, setVisitedCount, setVisitedProvinces]);

  useEffect(() => {
    if (!svgContainerRef.current || eventsAttachedRef.current || !userId || !dataLoaded) return;

    const loadSvgAndAttachEvents = async () => {
      try {
        const response = await fetch("/vietnamese_map_patched.svg");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const txt = await response.text();

        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = txt;
          setIsLoading(false);

          const provinces = svgContainerRef.current.querySelectorAll<SVGPathElement>(
            'path[id^="province-"]'
          );

          // Ensure tooltip exists
          if (!tooltipRef.current) {
            tooltipRef.current = createTooltip();
            console.log("✅ Tooltip created in SVG load");
          }

          const validIds = new Set<string>(
            Array.from(provinces)
              .map((p) => p.getAttribute("id") || "")
              .filter((id) => id && parseInt(id.replace("province-", "")) <= 65)
          );

          const mapContainer = svgContainerRef.current;

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
              p.dataset.pinColor = color; // Store color for later use
              setTimeout(() => addPin(p, color, id, mapContainer, pinsRef.current), 100);
            } else {
              p.style.fill = "rgba(115,115,115,0.3)";
            }

            // Click handler with DB sync
            p.addEventListener("click", async (e) => {
              e.stopPropagation();

              // Toggle in database
              const result = await toggleProvince(userId!, id);
              
              if (!result.success) {
                console.error("Failed to toggle province");
                return;
              }

              if (result.action === "added") {
                // Add to map
                const color = colors[Math.floor(Math.random() * colors.length)];
                p.style.fill = color;
                p.classList.add("visited");
                p.dataset.pinColor = color; // Store color
                visitedRef.current.set(id, result.data.id);
                addPin(p, color, id, mapContainer, pinsRef.current);
              } else {
                // Remove from map
                p.style.fill = "rgba(115,115,115,0.3)";
                p.classList.remove("visited");
                visitedRef.current.delete(id);
                const pin = pinsRef.current.get(id);
                if (pin) {
                  pin.remove();
                  pinsRef.current.delete(id);
                }
              }

              setVisitedCount(visitedRef.current.size);
              setVisitedProvinces(Array.from(visitedRef.current.keys()));
            });

            // Hover handlers with modal preview
            let isHovering = false;
            
            p.addEventListener("mouseenter", (e) => {
              isHovering = true;
              p.style.filter = "brightness(1.2)";
              
              const visitedProvinceId = visitedRef.current.get(id);
              const provinceName = mapIdToName(id);
              
              console.log("🖱️ Mouse enter:", id, "Visited:", !!visitedProvinceId, "Callback:", !!onProvinceHover);
              
              // Small delay to ensure smooth transition
              setTimeout(() => {
                if (!isHovering) return;
                
                // Ensure tooltip exists
                if (!tooltipRef.current || !document.body.contains(tooltipRef.current)) {
                  tooltipRef.current = createTooltip();
                  console.log("🔄 Tooltip recreated in mouseenter");
                }
                
                // Always hide tooltip when showing preview
                hideTooltip(tooltipRef.current);
                
                // Show preview for ALL provinces (visited or not)
                if (onProvinceHover) {
                  console.log("✅ Showing preview for province:", id);
                  onProvinceHover(id, visitedProvinceId || '', { x: e.clientX, y: e.clientY });
                }
              }, 50);
            });

            p.addEventListener("mousemove", (e) => {
              if (!isHovering) return;
              
              // Ensure tooltip exists
              if (!tooltipRef.current || !document.body.contains(tooltipRef.current)) {
                tooltipRef.current = createTooltip();
              }
              
              const visitedProvinceId = visitedRef.current.get(id);
              
              // Update preview position
              if (onProvinceHover) {
                onProvinceHover(id, visitedProvinceId || '', { x: e.clientX, y: e.clientY });
              }
            });

            p.addEventListener("mouseleave", () => {
              isHovering = false;
              p.style.filter = "";
              
              if (onProvinceLeave) {
                onProvinceLeave();
              }
              
              if (tooltipRef.current && document.body.contains(tooltipRef.current)) {
                hideTooltip(tooltipRef.current);
              }
            });

            // Touch handler for mobile
            p.addEventListener("touchstart", async (e) => {
              const touch = e.touches[0];
              if (!touch) return;
              
              // Show tooltip briefly
              const provinceName = mapIdToName(id);
              showTooltip(tooltipRef.current!, provinceName);
              moveTooltip(tooltipRef.current!, touch.clientX, touch.clientY);
              setTimeout(() => hideTooltip(tooltipRef.current!), 1500);

              // Toggle in database
              const result = await toggleProvince(userId!, id);
              
              if (!result.success) {
                console.error("Failed to toggle province");
                return;
              }

              if (result.action === "added") {
                const color = colors[Math.floor(Math.random() * colors.length)];
                p.style.fill = color;
                p.classList.add("visited");
                visitedRef.current.set(id, result.data.id);
                addPin(p, color, id, mapContainer, pinsRef.current);
                
                if (onProvinceClick) {
                  onProvinceClick(id, result.data.id);
                }
              } else {
                p.style.fill = "rgba(115,115,115,0.3)";
                p.classList.remove("visited");
                visitedRef.current.delete(id);
                const pin = pinsRef.current.get(id);
                if (pin) {
                  pin.remove();
                  pinsRef.current.delete(id);
                }
              }

              setVisitedCount(visitedRef.current.size);
              setVisitedProvinces(Array.from(visitedRef.current.keys()));
            }, { passive: true });
          });

          eventsAttachedRef.current = true;

          // Update pins on scroll/resize
          const handlePinUpdate = () => {
            if (mapContainer) {
              updatePinPositions(mapContainer, pinsRef.current);
              
              // Re-create pins if they're missing
              provinces.forEach((p) => {
                const id = p.getAttribute("id") || "";
                if (!id) return;
                
                const visitedProvinceId = visitedRef.current.get(id);
                if (visitedProvinceId && !pinsRef.current.has(id)) {
                  // Pin is missing, recreate it
                  const color = p.dataset.pinColor || colors[0];
                  addPin(p, color, id, mapContainer, pinsRef.current);
                }
              });
            }
          };

          window.addEventListener("scroll", handlePinUpdate, { passive: true });
          window.addEventListener("resize", handlePinUpdate);

          if (mapContainer) {
            mapContainer.addEventListener("scroll", handlePinUpdate, { passive: true });
          }

          // Periodic check to ensure pins exist (every 2 seconds)
          const pinCheckInterval = setInterval(() => {
            if (!mapContainer) return;
            
            provinces.forEach((p) => {
              const id = p.getAttribute("id") || "";
              if (!id) return;
              
              const visitedProvinceId = visitedRef.current.get(id);
              if (visitedProvinceId) {
                const existingPin = pinsRef.current.get(id);
                // Check if pin exists in DOM
                if (!existingPin || !document.body.contains(existingPin)) {
                  const color = p.dataset.pinColor || colors[0];
                  addPin(p, color, id, mapContainer, pinsRef.current);
                }
              }
            });
          }, 2000);

          // Store interval ID for cleanup
          (mapContainer as any)._pinCheckInterval = pinCheckInterval;
        }
      } catch (error) {
        console.error("Error loading SVG:", error);
        setIsLoading(false);
      }
    };

    loadSvgAndAttachEvents();

    return () => {
      pinsRef.current.forEach((pin) => pin.remove());
      pinsRef.current.clear();
      if (tooltipRef.current) {
        removeTooltip(tooltipRef.current);
      }
    };
  }, [userId, dataLoaded, setVisitedCount, setVisitedProvinces, onProvinceHover, onProvinceLeave, onProvinceClick]);

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden">
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

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}