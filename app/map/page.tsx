"use client";

import { useEffect, useRef, useState } from "react";

export default function MapPage() {
  const [visitedCount, setVisitedCount] = useState<number>(0);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const eventsAttachedRef = useRef(false);
  const visitedRef = useRef<Set<string>>(new Set());
  const colors = ["#e74c3c", "#3498db", "#27ae60", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22"];
  const STROKE_WIDTH_PX = 1;
  const TOTAL_PROVINCES = 63;

  const mapIdToName = (id: string) => {
    const mapping: { [key: string]: string } = {
      "province-1": "Yên Bái",
      "province-2": "Phú Thọ",
      "province-3": "Quảng Ninh",
      "province-4": "Khánh Hòa",
      "province-5": "Tiền Giang",
      "province-6": "Bà Rịa - Vũng Tàu",
      "province-7": "Bình Thuận",
      "province-8": "Hồ Chí Minh",
      "province-9": "Bến Tre",
      "province-10": "Sóc Trăng",
      "province-11": "Lai Châu",
      "province-12": "Sơn La",
      "province-13": "Thái Nguyên",
      "province-14": "Hà Nội",
      "province-15": "Hải Dương",
      "province-16": "Bắc Ninh",
      "province-17": "Hưng Yên",
      "province-18": "Vĩnh Phúc",
      "province-19": "Ninh Bình",
      "province-20": "Hà Nam",
      "province-21": "Hòa Bình",
      "province-22": "Bắc Giang",
      "province-23": "Thái Bình",
      "province-24": "Lâm Đồng",
      "province-25": "Bình Phước",
      "province-26": "Tây Ninh",
      "province-27": "Phú Yên",
      "province-28": "Bình Định",
      "province-29": "Hải Phòng",
      "province-30": "Gia Lai",
      "province-31": "Quảng Ngãi",
      "province-32": "Đồng Nai",
      "province-33": "Đồng Tháp",
      "province-34": "Cần Thơ",
      "province-35": "Long An",
      "province-36": "Hậu Giang",
      "province-37": "Bạc Liêu",
      "province-38": "Vĩnh Long",
      "province-39": "Hà Giang",
      "province-40": "Nam Định",
      "province-41": "Điện Biên",
      "province-42": "Lạng Sơn",
      "province-43": "Thanh Hóa",
      "province-44": "Bắc Kạn",
      "province-45": "Tuyên Quang",
      "province-46": "Hà Tĩnh",
      "province-47": "Nghệ An",
      "province-48": "Quảng Bình",
      "province-49": "Đắk Lắk",
      "province-50": "Ninh Thuận",
      "province-51": "Đắk Nông",
      "province-52": "Kon Tum",
      "province-53": "Quảng Nam",
      "province-54": "Quảng Trị",
      "province-55": "Thừa Thiên Huế",
      "province-56": "Kiên Giang",
      "province-57": "Đà Nẵng",
      "province-58": "An Giang",
      "province-59": "Cà Mau",
      "province-60": "Trà Vinh",
      "province-61": "Cao Bằng",
      "province-62": "Lào Cai",
      "province-63": "Bình Dương",
      "province-64": "Hoàng Sa",
      "province-65": "Trường Sa",
    };
    return mapping[id] || id;
  };

  const specialProvinceMap: Record<string, string> = {
    "province-64": "province-57",
    "province-65": "province-4",
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
            const onTouch = (e: Event) => { const t = (e as TouchEvent).touches[0]; if (!t) return; showTooltip(getProvinceName(p)); moveTooltip(t.clientX, t.clientY); setTimeout(hideTooltip, 1200); };

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

  const percent = ((visitedCount / TOTAL_PROVINCES) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero */}
      <section className="border-b border-gray-700 py-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Hành Trình Việt Nam</h1>
        <p className="mt-3 text-gray-400 max-w-xl mx-auto">
          Khám phá bản đồ Việt Nam 🌏 — đánh dấu nơi bạn đã đi và theo dõi hành trình cá nhân.
        </p>
        <a
          href="#vn-map-root"
          className="inline-block mt-6 rounded-full border border-white px-5 py-2 text-sm font-semibold hover:bg-white hover:text-black transition"
        >
          Khám phá ngay
        </a>
      </section>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 space-y-10">
        {/* Line: Thống kê */}
        <div className="border border-gray-700 rounded-2xl p-6 text-center bg-black">
          <p className="text-lg font-semibold">
            Bạn đã đi được{" "}
            <span className="text-white text-2xl">{visitedCount}</span> / {TOTAL_PROVINCES} tỉnh thành
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Hoàn thành <span className="text-white">{percent}%</span> hành trình
          </p>
        </div>

        {/* Line: Bản đồ */}
        <div
          id="vn-map-root"
          ref={svgContainerRef}
          className="w-full bg-[#111] rounded-2xl shadow border border-gray-700 overflow-hidden p-2"
          style={{ minHeight: "500px" }}

        />
      </main>

      <style jsx>{`
        #vn-map-root svg {
          width: 100%;
          height: auto;
        }
        #vn-map-root path {
  stroke: #fff; /* viền trắng nổi bật trên nền đen */
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