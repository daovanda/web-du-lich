"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header"; // dùng header có sẵn

export default function MapPage() {
  const [svg, setSvg] = useState<string>("");

  // Lưu danh sách tỉnh đã đi (Set trong phiên chạy)
  const visitedRef = useRef<Set<string>>(new Set(["HaNoi", "DaNang", "HoChiMinh"]));

  const colors = ["#e74c3c", "#3498db", "#27ae60", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22"];
  const STROKE_WIDTH_PX = 1;

  useEffect(() => {
    fetch("/vietnamese_map_patched.svg")
      .then((r) => r.text())
      .then((txt) => setSvg(txt));
  }, []);

  useEffect(() => {
    if (!svg) return;
    const root = document.getElementById("vn-map-root");
    if (!root) return;

    // ---- tooltip ----
    const tooltip = document.createElement("div");
    tooltip.id = "map-tooltip";
    Object.assign(tooltip.style, {
      position: "fixed",
      zIndex: "50",
      pointerEvents: "none",
      background: "rgba(0,0,0,0.8)",
      color: "#fff",
      padding: "10px 14px",
      borderRadius: "12px",
      fontWeight: "600",
      fontSize: "16px",
      whiteSpace: "nowrap",
      opacity: "0",
      transition: "opacity .12s ease",
    } as CSSStyleDeclaration);
    document.body.appendChild(tooltip);

    const showTooltip = (text: string) => { tooltip.textContent = text; tooltip.style.opacity = "1"; };
    const moveTooltip = (x: number, y: number) => { tooltip.style.left = `${x + 14}px`; tooltip.style.top = `${y + 14}px`; };
    const hideTooltip = () => (tooltip.style.opacity = "0");

    const titleCase = (s: string) =>
      s.toLowerCase().split(" ").map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");

    const getProvinceName = (el: Element) => {
      const fromAttr =
        el.getAttribute("data-vn") ||
        el.getAttribute("data-name") ||
        el.getAttribute("name") ||
        el.getAttribute("aria-label");
      if (fromAttr) return fromAttr as string;

      const cls = el.getAttribute("class") || "";
      const token = cls.split(/\s+/).find((t) => t.startsWith("highcharts-name-"));
      if (token) {
        const raw = token.replace(/^highcharts-name-/, "").replace(/-/g, " ");
        return titleCase(raw);
      }
      const id = (el.getAttribute("id") || "").replace(/[_-]/g, " ");
      return titleCase(id);
    };

    const provinces = root.querySelectorAll<SVGPathElement>("svg .province");

    const toCleanup: Array<{ el: SVGPathElement; handlers: { type: string; fn: EventListenerOrEventListenerObject }[] }> = [];

    provinces.forEach((p) => {
      const id = p.getAttribute("id") || "";

      // viền trắng
      p.style.stroke = "#ffffff";
      p.style.strokeWidth = `${STROKE_WIDTH_PX}px`;
      p.style.strokeLinejoin = "round";
      p.style.strokeLinecap = "round";
      p.setAttribute("vector-effect", "non-scaling-stroke");

      // màu ban đầu
      if (visitedRef.current.has(id)) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        p.style.fill = color;
        p.classList.add("visited");
      } else {
        p.style.fill = "#ccc";
        p.classList.remove("visited");
      }

      // events
      const onClick = () => {
        if (p.classList.contains("visited")) {
          p.classList.remove("visited");
          visitedRef.current.delete(id);
          p.style.fill = "#ccc";
        } else {
          p.classList.add("visited");
          visitedRef.current.add(id);
          const color = colors[Math.floor(Math.random() * colors.length)];
          p.style.fill = color;
        }
      };

      const onEnter = (e: Event) => {
        showTooltip(getProvinceName(p));
        const me = e as MouseEvent;
        moveTooltip(me.clientX, me.clientY);
      };
      const onMove = (e: Event) => {
        const me = e as MouseEvent;
        moveTooltip(me.clientX, me.clientY);
      };
      const onLeave = () => hideTooltip();

      p.addEventListener("click", onClick);
      p.addEventListener("mouseenter", onEnter);
      p.addEventListener("mousemove", onMove);
      p.addEventListener("mouseleave", onLeave);

      const onTouch = (e: TouchEvent) => {
        const t = e.touches[0];
        if (!t) return;
        showTooltip(getProvinceName(p));
        moveTooltip(t.clientX, t.clientY);
        setTimeout(hideTooltip, 1200);
      };
      p.addEventListener("touchstart", onTouch, { passive: true });

      toCleanup.push({
        el: p,
        handlers: [
          { type: "click", fn: onClick },
          { type: "mouseenter", fn: onEnter },
          { type: "mousemove", fn: onMove },
          { type: "mouseleave", fn: onLeave },
          { type: "touchstart", fn: onTouch },
        ],
      });
    });

    return () => {
      toCleanup.forEach(({ el, handlers }) => handlers.forEach(({ type, fn }) => el.removeEventListener(type, fn)));
      tooltip.remove();
    };
  }, [svg]);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {/* Header chung của site */}
      <Header />

      {/* Hero riêng cho trang map */}
      <section className="relative h-[220px] sm:h-[300px] md:h-[380px] overflow-hidden">
        {/* nền gradient + họa tiết */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1f2937_0%,_#0b0b0b_60%)]" />
        <svg className="absolute -top-10 right-0 opacity-20" width="560" height="560" viewBox="0 0 200 200">
          <defs>
            <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#dots)" />
        </svg>

        {/* nội dung */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-4 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Bản đồ hành trình Việt Nam
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/80">
              Di chuột để xem tên tỉnh, click để đánh dấu <i>đã đi</i>. Tùy biến màu theo sở thích 🎨
            </p>
            <a href="#vn-map-root" className="inline-block mt-4 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm">
              Bắt đầu đánh dấu
            </a>
          </div>
        </div>
      </section>

      {/* Nội dung bản đồ */}
      <main className="p-5 space-y-4 max-w-6xl mx-auto">
        <p className="text-sm text-gray-300">
          • Di chuột vào tỉnh để xem tên. Click để bật/tắt trạng thái <b>đã đi</b>.<br />
          • Mặc định: xám là <i>chưa đi</i>, nhiều màu (7 màu) là <i>đã đi</i>.
        </p>

        <div id="vn-map-root" className="w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      </main>

      <style jsx>{`
        #vn-map-root svg { width: 100%; height: auto; }
        #vn-map-root .province {
          stroke: #fff;
          stroke-width: ${STROKE_WIDTH_PX}px;
          stroke-linejoin: round;
          stroke-linecap: round;
          vector-effect: non-scaling-stroke;
          cursor: pointer;
          transition: fill 0.2s ease;
        }
        #map-tooltip:empty { opacity: 0 !important; }
      `}</style>
    </div>
  );
}
