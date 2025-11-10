// app/service-history/hooks/useServiceFilters.ts

import { useMemo, useState, useEffect } from 'react';
import { getProcessStatus } from '../utils/statusHelpers';
import { PROCESS_STATUS_PRIORITY, ProcessStatus } from '../utils/constants';

export function useServiceFilters(data: any[] | null) {
  const [selectedType, setSelectedType] = useState<string>("__all__");
  const [selectedProcessStatus, setSelectedProcessStatus] = useState<string>("__all__");
  const [displayCount, setDisplayCount] = useState(3);

  // Lấy danh sách loại dịch vụ
  const serviceTypes = useMemo(() => {
    const types = Array.from(
      new Set(
        (data || [])
          .map((i) => i?.services?.type || null)
          .filter(Boolean)
      )
    ) as string[];
    types.sort((a, b) => a.localeCompare(b));
    return types;
  }, [data]);

  // Đếm số lượng cho mỗi trạng thái
  const statusCounts = useMemo(() => {
    const counts = {
      all: data?.length || 0,
      'active': 0,
      'cancelled': 0
    };
    
    (data || []).forEach(item => {
      const status = getProcessStatus(item);
      counts[status as keyof typeof counts]++;
    });
    
    return counts;
  }, [data]);

  // Lọc và sắp xếp items
  const filteredItems = useMemo(() => {
    let filtered = [...(data || [])];
    
    // Lọc theo loại dịch vụ
    if (selectedType !== "__all__") {
      filtered = filtered.filter((i) => i?.services?.type === selectedType);
    }
    
    // Lọc theo trạng thái quy trình
    if (selectedProcessStatus !== "__all__") {
      filtered = filtered.filter((i) => getProcessStatus(i) === selectedProcessStatus);
    }
    
    // Sắp xếp theo thời gian
    filtered.sort((a, b) => {
      const processA = getProcessStatus(a);
      const processB = getProcessStatus(b);
      
      // Ưu tiên theo trạng thái
      const priorityDiff = PROCESS_STATUS_PRIORITY[processA] - PROCESS_STATUS_PRIORITY[processB];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Nếu cùng trạng thái, sắp xếp theo thời gian tạo (mới nhất trước)
      const ta = new Date(a?.created_at || 0).getTime();
      const tb = new Date(b?.created_at || 0).getTime();
      return tb - ta;
    });
    
    return filtered;
  }, [data, selectedType, selectedProcessStatus]);

  // Items để hiển thị (lazy loading)
  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, displayCount);
  }, [filteredItems, displayCount]);

  // Đếm số giao dịch đang chờ
  const pendingTransactionsCount = useMemo(() => {
    return filteredItems.filter(item => {
      return item?.status !== "confirmed" && item?.status !== "cancelled";
    }).length;
  }, [filteredItems]);

  // Reset displayCount khi thay đổi filter
  useEffect(() => {
    setDisplayCount(3);
  }, [selectedType, selectedProcessStatus]);

  return {
    // States
    selectedType,
    selectedProcessStatus,
    displayCount,
    
    // Setters
    setSelectedType,
    setSelectedProcessStatus,
    setDisplayCount,
    
    // Computed
    serviceTypes,
    statusCounts,
    filteredItems,
    displayedItems,
    pendingTransactionsCount,
    hasMore: displayCount < filteredItems.length
  };
}