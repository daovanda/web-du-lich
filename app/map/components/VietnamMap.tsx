"use client";

import { useEffect, useRef, useState } from "react";
import { mapIdToName, specialProvinceMap, colors } from "@/lib/mapUtils";

export default function VietnamMap({ setVisitedCount }: { setVisitedCount: (n: number) => void }) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const eventsAttachedRef = useRef(false);
  const visitedRef = useRef<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const STROKE_WIDTH_PX = 1;
  const TOTAL_PROVINCES = 63;

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

          provinces.forEach((p) => {
            const id = p.getAttribute("id") || "";
            if (!id || !validIds.has(id)) return;
            
            p.style.stroke = "rgba(255,255,255,0.2)";
            p.style.strokeWidth = `${STROKE_WIDTH_PX}px`;
            p.setAttribute("vector-effect", "non-scaling-stroke");
            const targetId = specialProvinceMap[id] || id;

            if (visitedRef.current.has(targetId)) {
              const color = colors[Math.floor(Math.random() * colors.length)];
              p.style.fill = color;
              p.classList.add("visited");
            } else {
              p.style.fill = "rgba(115,115,115,0.3)";
            }

            const onClick = () => {
              const elementsToColor = [p];
              if (specialProvinceMap[id]) {
                const mainProvince = svgContainerRef.current?.querySelector<SVGPathElement>(`#${specialProvinceMap[id]}`);
                if (mainProvince) elementsToColor.push(mainProvince);
              }
              
              if (visitedRef.current.has(targetId)) {
                visitedRef.current.delete(targetId);
                elementsToColor.forEach((el) => { 
                  el.classList.remove("visited"); 
                  el.style.fill = "rgba(115,115,115,0.3)"; 
                });
              } else {
                visitedRef.current.add(targetId);
                const color = colors[Math.floor(Math.random() * colors.length)];
                elementsToColor.forEach((el) => { 
                  el.classList.add("visited"); 
                  el.style.fill = color; 
                });
              }
              setVisitedCount(visitedRef.current.size);
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
        }
      } catch (error) {
        console.error("Error loading or processing SVG:", error);
        setIsLoading(false);
      }
    };

    loadSvgAndAttachEvents();
  }, [svgContainerRef.current]);

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
          className="w-full p-4 overflow-auto touch-pan-x touch-pan-y"
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