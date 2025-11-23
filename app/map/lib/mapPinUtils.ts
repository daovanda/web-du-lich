  /**
   * Utility functions for managing map pins
   */

  /**
   * 📍 Create animated pin HTML element (overlay approach)
   */
  export const createPin = (
    path: SVGPathElement,
    color: string,
    provinceId: string,
    mapContainer: HTMLDivElement
  ): HTMLDivElement => {
    const pinContainer = document.createElement("div");
    pinContainer.className = "map-pin-overlay";
    pinContainer.setAttribute("data-province", provinceId);

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

  /**
   * 📌 Add pin with animation
   */
  export const addPin = (
    path: SVGPathElement,
    color: string,
    provinceId: string,
    mapContainer: HTMLDivElement,
    pinsMap: Map<string, HTMLDivElement>
  ) => {
    try {
      const pin = createPin(path, color, provinceId, mapContainer);

      mapContainer.appendChild(pin);
      pinsMap.set(provinceId, pin);

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

  /**
   * 🗑️ Remove pin with animation
   */
  export const removePin = (
    provinceId: string,
    pinsMap: Map<string, HTMLDivElement>
  ) => {
    const pin = pinsMap.get(provinceId);
    if (!pin) {
      console.log(`⚠️ No pin found for ${provinceId}`);
      return;
    }

    pin.style.opacity = "0";
    pin.style.transform = "translate(-50%, -120%)";

    setTimeout(() => {
      pin.remove();
      pinsMap.delete(provinceId);
      console.log(`🗑️ Pin removed for ${provinceId}`);
    }, 400);
  };

  /**
   * 🔄 Update pin positions on scroll/resize
   */
  export const updatePinPositions = (
    mapContainer: HTMLDivElement,
    pinsMap: Map<string, HTMLDivElement>
  ) => {
    const mapRect = mapContainer.getBoundingClientRect();

    pinsMap.forEach((pin, provinceId) => {
      const path = mapContainer.querySelector<SVGPathElement>(`#${provinceId}`);
      if (!path) return;

      const pathRect = path.getBoundingClientRect();
      const x = pathRect.left - mapRect.left + pathRect.width / 2 + mapContainer.scrollLeft;
      const y = pathRect.top - mapRect.top + pathRect.height / 2 + mapContainer.scrollTop;

      pin.style.left = `${x}px`;
      pin.style.top = `${y}px`;
    });
  };