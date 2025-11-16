/**
 * Utility functions for managing map tooltips
 */

/**
 * Create and initialize tooltip element
 */
export const createTooltip = (): HTMLDivElement => {
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
  return tooltip;
};

/**
 * Show tooltip with text
 */
export const showTooltip = (tooltip: HTMLDivElement, text: string) => {
  tooltip.textContent = text;
  tooltip.style.opacity = "1";
};

/**
 * Move tooltip to cursor position
 */
export const moveTooltip = (tooltip: HTMLDivElement, x: number, y: number) => {
  tooltip.style.left = `${x + 16}px`;
  tooltip.style.top = `${y + 16}px`;
};

/**
 * Hide tooltip
 */
export const hideTooltip = (tooltip: HTMLDivElement) => {
  tooltip.style.opacity = "0";
};

/**
 * Remove tooltip from DOM
 */
export const removeTooltip = (tooltip: HTMLDivElement) => {
  tooltip.remove();
};