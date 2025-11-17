/**
 * Event handlers for map interactions
 */

import { addPin, removePin } from "./mapPinUtils";
import { showTooltip, moveTooltip, hideTooltip } from "./mapTooltipUtils";
import { mapIdToName, specialProvinceMap, colors } from "@/app/map/lib/mapUtils";

interface EventHandlerParams {
  path: SVGPathElement;
  targetId: string;
  visitedSet: Set<string>;
  pinsMap: Map<string, HTMLDivElement>;
  mapContainer: HTMLDivElement;
  tooltip: HTMLDivElement;
  setVisitedCount: (n: number) => void;
  setVisitedProvinces: (ids: string[]) => void;
}

/**
 * Handle province click
 */
export const createClickHandler = (params: EventHandlerParams) => {
  const {
    path,
    targetId,
    visitedSet,
    pinsMap,
    mapContainer,
    setVisitedCount,
    setVisitedProvinces,
  } = params;

  return () => {
    if (visitedSet.has(targetId)) {
      // Remove province
      console.log(`🔴 Removing: ${targetId}`);
      visitedSet.delete(targetId);
      path.classList.remove("visited");
      path.style.fill = "rgba(115,115,115,0.3)";
      removePin(targetId, pinsMap);
    } else {
      // Add province
      console.log(`🟢 Adding: ${targetId}`);
      visitedSet.add(targetId);
      const color = colors[Math.floor(Math.random() * colors.length)];
      path.classList.add("visited");
      path.style.fill = color;
      addPin(path, color, targetId, mapContainer, pinsMap);
    }
    
    setVisitedCount(visitedSet.size);
    setVisitedProvinces(Array.from(visitedSet));
  };
};

/**
 * Handle mouse enter
 */
export const createMouseEnterHandler = (params: EventHandlerParams) => {
  const { path, tooltip } = params;
  
  return (e: Event) => {
    const me = e as MouseEvent;
    const provinceName = mapIdToName(path.getAttribute("id") || "");
    showTooltip(tooltip, provinceName);
    moveTooltip(tooltip, me.clientX, me.clientY);
    path.style.filter = "brightness(1.2)";
  };
};

/**
 * Handle mouse move
 */
export const createMouseMoveHandler = (params: EventHandlerParams) => {
  const { tooltip } = params;
  
  return (e: Event) => {
    const me = e as MouseEvent;
    moveTooltip(tooltip, me.clientX, me.clientY);
  };
};

/**
 * Handle mouse leave
 */
export const createMouseLeaveHandler = (params: EventHandlerParams) => {
  const { path, tooltip } = params;
  
  return () => {
    hideTooltip(tooltip);
    path.style.filter = "brightness(1)";
  };
};

/**
 * Handle touch start
 */
export const createTouchHandler = (params: EventHandlerParams) => {
  const { path, tooltip } = params;
  
  return (e: Event) => {
    const t = (e as TouchEvent).touches[0];
    if (!t) return;
    
    const provinceName = mapIdToName(path.getAttribute("id") || "");
    showTooltip(tooltip, provinceName);
    moveTooltip(tooltip, t.clientX, t.clientY);
    
    setTimeout(() => hideTooltip(tooltip), 1500);
  };
};