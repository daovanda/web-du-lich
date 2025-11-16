// components/StatsOverview.tsx
export default function StatsOverview({ totalServices, totalPending, totalConfirmed }: any) {
  const items = [
    { label: "Tổng dịch vụ", value: totalServices },
    { label: "Pending", value: totalPending },
    { label: "Active", value: totalConfirmed },
  ];

  return (
    <div className="space-y-2">
      {items.map((s, i) => (
        <div key={i} className="flex items-center justify-between bg-neutral-900 rounded-xl p-3">
          <span className="text-sm text-gray-400">{s.label}</span>
          <span className="text-xl font-bold">{s.value}</span>
        </div>
      ))}
    </div>
  );
}
