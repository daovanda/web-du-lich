"use client";
import { useEffect, useState } from "react";
import { fetchDetailedStats } from "../api";

export default function DetailedStats() {
  const [stats, setStats] = useState<{ byType: any; byStatus: any } | null>(null);

  useEffect(() => {
    (async () => {
      const result = await fetchDetailedStats();
      setStats(result);
    })();
  }, []);

  if (!stats) return <div className="text-gray-500">Loading detailed stats...</div>;

  return (
    <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 mt-8">
      <h2 className="text-2xl font-bold mb-6">📊 Detailed Statistics</h2>

      {/* Thống kê theo loại */}
      <h3 className="text-lg font-semibold mb-3">By Type</h3>
      <table className="w-full text-sm text-gray-300 border-collapse">
        <thead className="text-gray-400 border-b border-neutral-700">
          <tr>
            <th className="text-left py-2">Type</th>
            <th>Total</th>
            <th>Active</th>
            <th>Inactive</th>
            <th>Pending</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(stats.byType).map(([type, values]: any) => (
            <tr key={type} className="border-b border-neutral-800">
              <td className="py-2">{type}</td>
              <td>{values.total}</td>
              <td>{values.active || 0}</td>
              <td>{values.inactive || 0}</td>
              <td>{values.new || values.pending || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Thống kê theo trạng thái */}
      <h3 className="text-lg font-semibold mt-8 mb-3">By Status</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats.byStatus).map(([status, count]) => (
          <div
            key={status}
            className="bg-neutral-800 p-4 rounded-xl text-center border border-neutral-700"
          >
            <p className="text-xl font-bold text-white">{count}</p>
            <p className="text-sm text-gray-400 capitalize">{status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
