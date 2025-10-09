"use client";

import { useEffect, useRef } from "react";
import { mapIdToName, specialProvinceMap, colors } from "@/lib/mapUtils";

export default function VietnamMap({ setVisitedCount }: { setVisitedCount: (n: number) => void }) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const eventsAttachedRef = useRef(false);
  const visitedRef = useRef<Set<string>>(new Set());
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
          const provinces = svgContainerRef.current.querySelectorAll<SVGPathElement>('path[id^="province-"]');
          const provinceIds = Array.from(provinces).map((p) => p.getAttribute("id") || "");

          const tooltip = document.createElement("div");
          tooltip.id = "map-tooltip";
          Object.assign(tooltip.style, {
            position: "fixed",
            zIndex: "50",
            pointerEvents: "none",
            background: "rgba(0,0,0,0.85)",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "10px",
            fontWeight: "600",
            fontSize: "15px",
            whiteSpace: "nowrap",
            opacity: "0",
            transition: "opacity .12s ease",
          });
          document.body.appendChild(tooltip);

          const showTooltip = (text: string) => { tooltip.textContent = text; tooltip.style.opacity = "1"; };
          const moveTooltip = (x: number, y: number) => { tooltip.style.left = `${x + 14}px`; tooltip.style.top = `${y + 14}px`; };
          const hideTooltip = () => (tooltip.style.opacity = "0");
          const getProvinceName = (el: Element) => mapIdToName(el.getAttribute("id") || "");

          const validIds = new Set<string>(provinceIds.filter((id) => id && parseInt(id.replace("province-", "")) <= 65));
          visitedRef.current = new Set([...visitedRef.current].filter((id) => validIds.has(id)));
          setVisitedCount(visitedRef.current.size);

          provinces.forEach((p) => {
            const id = p.getAttribute("id") || "";
            if (!id || !validIds.has(id)) return;
            p.style.stroke = "#ffffff";
            p.style.strokeWidth = `${STROKE_WIDTH_PX}px`;
            p.setAttribute("vector-effect", "non-scaling-stroke");
            const targetId = specialProvinceMap[id] || id;

            if (visitedRef.current.has(targetId)) {
              const color = colors[Math.floor(Math.random() * colors.length)];
              p.style.fill = color;
              p.classList.add("visited");
            } else {
              p.style.fill = "#ccc";
            }

            const onClick = () => {
              const elementsToColor = [p];
              if (specialProvinceMap[id]) {
                const mainProvince = svgContainerRef.current?.querySelector<SVGPathElement>(`#${specialProvinceMap[id]}`);
                if (mainProvince) elementsToColor.push(mainProvince);
              }
              if (visitedRef.current.has(targetId)) {
                visitedRef.current.delete(targetId);
                elementsToColor.forEach((el) => { el.classList.remove("visited"); el.style.fill = "#ccc"; });
              } else {
                visitedRef.current.add(targetId);
                const color = colors[Math.floor(Math.random() * colors.length)];
                elementsToColor.forEach((el) => { el.classList.add("visited"); el.style.fill = color; });
              }
              setVisitedCount(visitedRef.current.size);
            };

            const onEnter = (e: Event) => { const me = e as MouseEvent; showTooltip(getProvinceName(p)); moveTooltip(me.clientX, me.clientY); };
            const onMove = (e: Event) => { const me = e as MouseEvent; moveTooltip(me.clientX, me.clientY); };
            const onLeave = () => hideTooltip();
            const onTouch = (e: Event) => {
              const t = (e as TouchEvent).touches[0];
              if (!t) return;
              showTooltip(getProvinceName(p));
              moveTooltip(t.clientX, t.clientY);
              setTimeout(hideTooltip, 1200);
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
      }
    };

    loadSvgAndAttachEvents();
  }, [svgContainerRef.current]);

  return (
    <div
      id="vn-map-root"
      ref={svgContainerRef}
      className="w-full bg-[#111] rounded-2xl shadow border border-gray-700 overflow-hidden p-2"
      style={{ minHeight: "500px" }}
    >
      <style jsx>{`
        #vn-map-root svg {
          width: 100%;
          height: auto;
        }
        #vn-map-root path {
          stroke: #fff;
          stroke-width: ${STROKE_WIDTH_PX}px;
          stroke-linejoin: round;
          stroke-linecap: round;
          vector-effect: non-scaling-stroke;
          cursor: pointer;
          transition: fill 0.2s ease;
        }
        #map-tooltip:empty {
          opacity: 0 !important;
        }
      `}</style>
    </div>
  );
}
