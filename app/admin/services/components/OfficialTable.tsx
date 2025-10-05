"use client";

import { Service } from "../types";
import { formatAmenities } from "../helpers";

type OfficialTableProps = {
  services: Service[];
  loading: boolean;
  onToggleStatus: (svc: Service, newStatus: string) => void;
  onDetail: (svc: Service) => void;
};

export default function OfficialTable({
  services,
  loading,
  onToggleStatus,
  onDetail,
}: OfficialTableProps) {
  if (loading) return <p className="text-gray-400">Đang tải...</p>;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold mb-3">📋 Dịch vụ chính thức</h2>

      {services?.length > 0 ? (
        services.map((svc) => (
          <div
            key={svc.id}
            onClick={() => onDetail(svc)}
            className="flex items-center justify-between bg-neutral-900 rounded-xl p-4 hover:bg-neutral-800 transition cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              {svc.images?.[0] ? (
                <img
                  src={svc.images[0]}
                  alt={svc.title}
                  className="h-14 w-14 object-cover rounded-lg"
                />
              ) : (
                <div className="h-14 w-14 bg-neutral-800 rounded-lg flex items-center justify-center text-gray-500">
                  📷
                </div>
              )}
              <div>
                <p className="font-semibold group-hover:underline">{svc.title}</p>
                <p className="text-sm text-gray-400">
                  {svc.type} • {svc.location || "N/A"} • {svc.price || "?"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatAmenities(svc.amenities)}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()} // ✅ tránh mở modal khi bấm nút
            >
              <span
                className={`px-2 py-1 rounded text-xs ${
                  svc.status === "active"
                    ? "bg-emerald-500 text-black"
                    : svc.status === "inactive"
                    ? "bg-yellow-500 text-black"
                    : "bg-neutral-700 text-gray-300"
                }`}
              >
                {svc.status}
              </span>
              <button
                onClick={() =>
                  onToggleStatus(svc, svc.status === "active" ? "inactive" : "active")
                }
                className="px-3 py-1 rounded bg-neutral-800 text-xs"
              >
                Toggle
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 py-6">Không có dịch vụ</p>
      )}
    </div>
  );
}
