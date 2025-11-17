/**
 * Utility functions for managing map tooltips
 */

/**
 * Create and initialize tooltip element
 */
export const createTooltip = (): HTMLDivElement => {
  // Check if tooltip already exists
  let tooltip = document.getElementById("map-tooltip") as HTMLDivElement;
  
  if (tooltip) {
    return tooltip;
  }

  tooltip = document.createElement("div");
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
    display: "block",
  });
  
  document.body.appendChild(tooltip);
  return tooltip;
};

/**
 * Show tooltip with text
 */
export const showTooltip = (tooltip: HTMLDivElement, text: string) => {
  if (!tooltip) return;
  
  tooltip.textContent = text;
  tooltip.style.display = "block";
  tooltip.style.opacity = "1";
};

/**
 * Move tooltip to cursor position
 */
export const moveTooltip = (tooltip: HTMLDivElement, x: number, y: number) => {
  if (!tooltip) return;
  
  // Ensure tooltip stays on screen
  const tooltipRect = tooltip.getBoundingClientRect();
  const offsetX = 16;
  const offsetY = 16;
  
  let left = x + offsetX;
  let top = y + offsetY;
  
  // Check right edge
  if (left + tooltipRect.width > window.innerWidth) {
    left = x - tooltipRect.width - offsetX;
  }
  
  // Check bottom edge
  if (top + tooltipRect.height > window.innerHeight) {
    top = y - tooltipRect.height - offsetY;
  }
  
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
};

/**
 * Hide tooltip
 */
export const hideTooltip = (tooltip: HTMLDivElement) => {
  if (!tooltip) return;
  
  tooltip.style.opacity = "0";
  
  // Delay hiding to avoid flicker
  setTimeout(() => {
    if (tooltip.style.opacity === "0") {
      tooltip.style.display = "none";
    }
  }, 150);
};

/**
 * Remove tooltip from DOM
 */
export const removeTooltip = (tooltip: HTMLDivElement) => {
  if (!tooltip) return;
  tooltip.remove();
};