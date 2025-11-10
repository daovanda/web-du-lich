// app/service-history/components/ServiceFilters.tsx

"use client";

import { PROCESS_STATUS_CONFIG } from "../utils/constants";

type ServiceFiltersProps = {
  selectedType: string;
  selectedProcessStatus: string;
  serviceTypes: string[];
  statusCounts: {
    all: number;
    'active': number;
    'cancelled': number;
  };
  onTypeChange: (type: string) => void;
  onProcessStatusChange: (status: string) => void;
};

export default function ServiceFilters({
  selectedType,
  selectedProcessStatus,
  serviceTypes,
  statusCounts,
  onTypeChange,
  onProcessStatusChange
}: ServiceFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      {/* Bộ lọc trạng thái quy trình */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Trạng thái:
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onProcessStatusChange("__all__")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              selectedProcessStatus === "__all__"
                ? "bg-indigo-600 text-white"
                : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
            }`}
          >
            Tất cả ({statusCounts.all})
          </button>
          
          {Object.entries(PROCESS_STATUS_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => onProcessStatusChange(key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedProcessStatus === key
                  ? `${config.color} text-white`
                  : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
              }`}
            >
              {config.label} ({statusCounts[key as keyof typeof statusCounts]})
            </button>
          ))}
        </div>
      </div>

      {/* Bộ lọc loại dịch vụ */}
      {serviceTypes.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-300 shrink-0">
            Loại dịch vụ:
          </label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="flex-1 rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="__all__">Tất cả loại</option>
            {serviceTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}