"use client";

import { PendingService } from "../types";

type PendingTableProps = {
  pendingServices: PendingService[];
  loading: boolean;
  onApprove: (p: PendingService) => void;
  onToggle: (id: string, newStatus: string) => void;
  onDetail: (p: PendingService) => void;
};

export default function PendingTable({
  pendingServices,
  loading,
  onApprove,
  onToggle,
  onDetail,
}: PendingTableProps) {
  if (loading) return <p className="text-gray-400">Đang tải...</p>;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold mb-3">📦 Dịch vụ chờ duyệt</h2>

      {pendingServices?.length > 0 ? (
        pendingServices.map((p) => (
          <div
            key={p.id}
            onClick={() => onDetail(p)}
            className="flex items-center justify-between bg-neutral-900 rounded-xl p-4 hover:bg-neutral-800 transition cursor-pointer group"
          >
            {/* Left: image + info */}
            <div className="flex items-center gap-4">
              {p.images?.[0] ? (
                <img
                  src={p.images[0]}
                  alt="service"
                  className="h-14 w-14 object-cover rounded-lg"
                />
              ) : (
                <div className="h-14 w-14 bg-neutral-800 rounded-lg flex items-center justify-center text-gray-500">
                  📷
                </div>
              )}

              <div>
                <p className="font-semibold group-hover:underline">{p.title}</p>
                <p className="text-sm text-gray-400">
                  {p.type} • {p.location || "N/A"} • {p.price || "?"}
                </p>
              </div>
            </div>

            {/* Right: status + actions */}
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()} // ✅ Ngăn click nút kích hoạt onDetail
            >
              <span
                className={`px-2 py-1 rounded text-xs ${
                  p.status === "confirmed"
                    ? "bg-emerald-500 text-black"
                    : p.status === "pending"
                    ? "bg-yellow-500 text-black"
                    : "bg-neutral-700 text-gray-300"
                }`}
              >
                {p.status}
              </span>
              <button
                onClick={() => onApprove(p)}
                className="px-3 py-1 rounded bg-gradient-to-r from-indigo-500 to-purple-500 text-xs"
              >
                Approve
              </button>
              <button
                onClick={() => onToggle(p.id, p.status === "new" ? "pending" : "new")}
                className="px-3 py-1 rounded bg-neutral-800 text-xs"
              >
                Toggle
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 py-6">Không có dịch vụ pending</p>
      )}
    </div>
  );
}
