// lib/provinceConfig.ts

/**
 * ✅ Danh sách các quần đảo của Việt Nam
 * Based on mapUtils.ts mapping
 */
export const ISLAND_PROVINCES = [
  'province-64', // Hoàng Sa
  'province-65', // Trường Sa
];

/**
 * Map province IDs to names for islands
 */
export const ISLAND_NAMES: Record<string, string> = {
  'province-64': 'Hoàng Sa',
  'province-65': 'Trường Sa',
};

/**
 * Check if a province is an island
 */
export function isIslandProvince(provinceId: string): boolean {
  return ISLAND_PROVINCES.includes(provinceId);
}

/**
 * Get island name by ID
 */
export function getIslandName(provinceId: string): string | null {
  return ISLAND_NAMES[provinceId] || null;
}

/**
 * Categorize visited provinces into mainland and islands
 */
export function categorizeProvinces(visitedProvinces: string[]) {
  const visitedIslands = visitedProvinces.filter(id => ISLAND_PROVINCES.includes(id));
  const visitedMainland = visitedProvinces.filter(id => !ISLAND_PROVINCES.includes(id));
  
  const mainlandTotal = 63; // 63 tỉnh thành đất liền
  const islandsTotal = 2;   // 2 quần đảo (Hoàng Sa, Trường Sa)
  
  return {
    mainland: {
      visited: visitedMainland.length,
      total: mainlandTotal,
      percentage: ((visitedMainland.length / mainlandTotal) * 100).toFixed(1),
    },
    islands: {
      visited: visitedIslands.length,
      total: islandsTotal,
      percentage: ((visitedIslands.length / islandsTotal) * 100).toFixed(1),
      names: visitedIslands.map(id => ISLAND_NAMES[id] || id),
    },
    overall: {
      visited: visitedProvinces.length,
      total: mainlandTotal + islandsTotal, // 65 total
      percentage: ((visitedProvinces.length / (mainlandTotal + islandsTotal)) * 100).toFixed(1),
    }
  };
}

/**
 * Get status message for islands
 */
export function getIslandStatusMessage(visitedCount: number, total: number): string {
  if (visitedCount === total) {
    return 'Hoàn thành';
  } else if (visitedCount === 1) {
    return '1 quần đảo còn lại';
  } else {
    return 'Chưa khám phá';
  }
}