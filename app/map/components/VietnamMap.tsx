"use client";

import { useEffect, useRef, useState } from "react";
import { mapIdToName, specialProvinceMap, colors } from "@/lib/mapUtils";

export default function VietnamMap({ 
  setVisitedCount,
  setVisitedProvinces 
}: { 
  setVisitedCount: (n: number) => void;
  setVisitedProvinces: (ids: string[]) => void;
}) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const eventsAttachedRef = useRef(false);
  const visitedRef = useRef<Set<string>>(new Set());
  const pinsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const STROKE_WIDTH_PX = 1;

  // 📍 Create animated pin HTML element (overlay approach)
  const createPin = (path: SVGPathElement, color: string, provinceId: string): HTMLDivElement => {
    const pinContainer = document.createElement("div");
    pinContainer.className = "map-pin-overlay";
    pinContainer.setAttribute("data-province", provinceId);
    
    // Get position relative to map container
    const mapContainer = svgContainerRef.current;
    if (!mapContainer) throw new Error("Map container not found");
    
    const mapRect = mapContainer.getBoundingClientRect();
    const pathRect = path.getBoundingClientRect();
    
    // Calculate position relative to map container
    const x = pathRect.left - mapRect.left + pathRect.width / 2 + mapContainer.scrollLeft;
    const y = pathRect.top - mapRect.top + pathRect.height / 2 + mapContainer.scrollTop;
    
    pinContainer.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -100%);
      z-index: 100;
      pointer-events: none;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    
    // Pin HTML structure
    pinContainer.innerHTML = `
      <div style="position: relative;">
        <!-- Shadow -->
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 6px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.4), transparent);
          border-radius: 50%;
        "></div>
        
        <!-- Pin body -->
        <div style="
          position: relative;
          width: 24px;
          height: 32px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid rgba(255,255,255,0.3);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        ">
          <!-- Pin center dot -->
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      </div>
    `;
    
    return pinContainer;
  };

  // 📌 Add pin with animation
  const addPin = (path: SVGPathElement, color: string, provinceId: string) => {
    try {
      const pin = createPin(path, color, provinceId);
      
      // Add to map container instead of body
      const mapContainer = svgContainerRef.current;
      if (!mapContainer) throw new Error("Map container not found");
      
      mapContainer.appendChild(pin);
      pinsRef.current.set(provinceId, pin);
      
      // Initial state (hidden above)
      pin.style.opacity = "0";
      pin.style.transform = "translate(-50%, -120%)";
      
      // Trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          pin.style.opacity = "1";
          pin.style.transform = "translate(-50%, -100%)";
        });
      });

      console.log(`✅ Pin added for ${provinceId}`);
    } catch (error) {
      console.error(`❌ Error adding pin for ${provinceId}:`, error);
    }
  };

  // 🗑️ Remove pin with animation
  const removePin = (provinceId: string) => {
    const pin = pinsRef.current.get(provinceId);
    if (!pin) {
      console.log(`⚠️ No pin found for ${provinceId}`);
      return;
    }

    pin.style.opacity = "0";
    pin.style.transform = "translate(-50%, -120%)";
    
    setTimeout(() => {
      pin.remove();
      pinsRef.current.delete(provinceId);
      console.log(`🗑️ Pin removed for ${provinceId}`);
    }, 400);
  };

  // 🔄 Update pin positions on scroll/resize
  const updatePinPositions = () => {
    const mapContainer = svgContainerRef.current;
    if (!mapContainer) return;
    
    const mapRect = mapContainer.getBoundingClientRect();
    
    pinsRef.current.forEach((pin, provinceId) => {
      const path = mapContainer.querySelector<SVGPathElement>(`#${provinceId}`);
      if (!path) return;

      const pathRect = path.getBoundingClientRect();
      const x = pathRect.left - mapRect.left + pathRect.width / 2 + mapContainer.scrollLeft;
      const y = pathRect.top - mapRect.top + pathRect.height / 2 + mapContainer.scrollTop;
      
      pin.style.left = `${x}px`;
      pin.style.top = `${y}px`;
    });
  };

  useEffect(() => {
    if (!svgContainerRef.current || eventsAttachedRef.current) return;

    const loadSvgAndAttachEvents = async () => {
      try {
        const response = await fetch("/vietnamese_map_patched.svg");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const txt = await response.text();
        
        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = txt;
          setIsLoading(false);
          
          const provinces = svgContainerRef.current.querySelectorAll<SVGPathElement>('path[id^="province-"]');
          const provinceIds = Array.from(provinces).map((p) => p.getAttribute("id") || "");

          console.log(`🗺️ Loaded ${provinces.length} provinces`);

          const tooltip = document.createElement("div");
          tooltip.id = "map-tooltip";
          Object.assign(tooltip.style, {
            position: "fixed",
            zIndex: "9999",
            pointerEvents: "none",
            background: "rgba(0,0,0,0.95)",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "13px",
            whiteSpace: "nowrap",
            opacity: "0",
            transition: "opacity .15s ease",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          });
          document.body.appendChild(tooltip);

          const showTooltip = (text: string) => { 
            tooltip.textContent = text; 
            tooltip.style.opacity = "1"; 
          };
          const moveTooltip = (x: number, y: number) => { 
            tooltip.style.left = `${x + 16}px`; 
            tooltip.style.top = `${y + 16}px`; 
          };
          const hideTooltip = () => (tooltip.style.opacity = "0");
          const getProvinceName = (el: Element) => mapIdToName(el.getAttribute("id") || "");

          const validIds = new Set<string>(provinceIds.filter((id) => id && parseInt(id.replace("province-", "")) <= 65));
          visitedRef.current = new Set([...visitedRef.current].filter((id) => validIds.has(id)));
          setVisitedCount(visitedRef.current.size);
          setVisitedProvinces(Array.from(visitedRef.current));

          provinces.forEach((p) => {
            const id = p.getAttribute("id") || "";
            if (!id || !validIds.has(id)) return;
            
            p.style.stroke = "rgba(255,255,255,0.2)";
            p.style.strokeWidth = `${STROKE_WIDTH_PX}px`;
            p.setAttribute("vector-effect", "non-scaling-stroke");
            
            // Use the ID directly since specialProvinceMap is now empty
            const targetId = id;

            if (visitedRef.current.has(targetId)) {
              const color = colors[Math.floor(Math.random() * colors.length)];
              p.style.fill = color;
              p.classList.add("visited");
              // Wait for render before adding pin
              setTimeout(() => addPin(p, color, targetId), 100);
            } else {
              p.style.fill = "rgba(115,115,115,0.3)";
            }

            const onClick = () => {
              // No special province handling - each province is independent
              if (visitedRef.current.has(targetId)) {
                console.log(`🔴 Removing: ${targetId}`);
                visitedRef.current.delete(targetId);
                p.classList.remove("visited");
                p.style.fill = "rgba(115,115,115,0.3)";
                removePin(targetId);
              } else {
                console.log(`🟢 Adding: ${targetId}`);
                visitedRef.current.add(targetId);
                const color = colors[Math.floor(Math.random() * colors.length)];
                p.classList.add("visited");
                p.style.fill = color;
                addPin(p, color, targetId);
              }
              setVisitedCount(visitedRef.current.size);
              setVisitedProvinces(Array.from(visitedRef.current));
            };

            const onEnter = (e: Event) => { 
              const me = e as MouseEvent; 
              showTooltip(getProvinceName(p)); 
              moveTooltip(me.clientX, me.clientY);
              p.style.filter = "brightness(1.2)";
            };
            
            const onMove = (e: Event) => { 
              const me = e as MouseEvent; 
              moveTooltip(me.clientX, me.clientY); 
            };
            
            const onLeave = () => {
              hideTooltip();
              p.style.filter = "brightness(1)";
            };
            
            const onTouch = (e: Event) => {
              const t = (e as TouchEvent).touches[0];
              if (!t) return;
              showTooltip(getProvinceName(p));
              moveTooltip(t.clientX, t.clientY);
              setTimeout(hideTooltip, 1500);
            };

            p.addEventListener("click", onClick);
            p.addEventListener("mouseenter", onEnter);
            p.addEventListener("mousemove", onMove);
            p.addEventListener("mouseleave", onLeave);
            p.addEventListener("touchstart", onTouch, { passive: true });
          });

          eventsAttachedRef.current = true;

          // Update pin positions on window scroll and resize
          window.addEventListener("scroll", updatePinPositions, { passive: true });
          window.addEventListener("resize", updatePinPositions);
          
          // Update on map scroll
          const mapContainer = svgContainerRef.current;
          if (mapContainer) {
            mapContainer.addEventListener("scroll", updatePinPositions, { passive: true });
          }
        }
      } catch (error) {
        console.error("Error loading or processing SVG:", error);
        setIsLoading(false);
      }
    };

    loadSvgAndAttachEvents();

    // Cleanup
    return () => {
      // Remove all pins
      pinsRef.current.forEach(pin => pin.remove());
      pinsRef.current.clear();
      
      // Remove event listeners
      window.removeEventListener("scroll", updatePinPositions);
      window.removeEventListener("resize", updatePinPositions);
    };
  }, []);

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden">
      {/* 🎨 Header */}
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

      {/* 🗺️ Map Container */}
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
          style={{
            minHeight: "60vh",
            maxHeight: "75vh",
          }}
        />
      </div>

      {/* ✨ Footer Tips */}
      <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/50">
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Di chuột hoặc chạm vào tỉnh để xem tên. Nhấn để đánh dấu đã ghé thăm.</span>
        </div>
      </div>

      {/* ✨ Styles */}
      <style jsx>{`
        #vn-map-root {
          position: relative;
          scrollbar-width: thin;
          scrollbar-color: rgba(115,115,115,0.3) transparent;
        }
        
        #vn-map-root::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        #vn-map-root::-webkit-scrollbar-track {
          background: transparent;
        }
        
        #vn-map-root::-webkit-scrollbar-thumb {
          background: rgba(115,115,115,0.3);
          border-radius: 4px;
        }
        
        #vn-map-root::-webkit-scrollbar-thumb:hover {
          background: rgba(115,115,115,0.5);
        }
        
        #vn-map-root svg {
          display: block;
          width: 100%;
          height: auto;
          max-width: 100%;
          aspect-ratio: 3/4;
        }
        
        #vn-map-root path {
          stroke: rgba(255,255,255,0.2);
          stroke-width: ${STROKE_WIDTH_PX}px;
          stroke-linejoin: round;
          stroke-linecap: round;
          vector-effect: non-scaling-stroke;
          cursor: pointer;
          transition: fill 0.3s ease, filter 0.2s ease;
        }
        
        #vn-map-root path:hover {
          filter: brightness(1.2) !important;
        }

        /* 📍 Pin overlay styles */
        .map-pin-overlay {
          will-change: transform, opacity;
        }
        
        #map-tooltip:empty {
          opacity: 0 !important;
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