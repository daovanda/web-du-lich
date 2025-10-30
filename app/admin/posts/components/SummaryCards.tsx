"use client";

type SummaryCardsProps = {
  summary: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
};

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: "Tổng bài đăng",
      value: summary.total,
      icon: "📰",
      color: "text-white",
      border: "border-gray-700",
    },
    {
      label: "Đã duyệt",
      value: summary.approved,
      icon: "✅",
      color: "text-green-400",
      border: "border-green-600/40",
    },
    {
      label: "Đang chờ",
      value: summary.pending,
      icon: "🕒",
      color: "text-yellow-400",
      border: "border-yellow-600/40",
    },
    {
      label: "Bị từ chối",
      value: summary.rejected,
      icon: "❌",
      color: "text-red-400",
      border: "border-red-600/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`bg-gray-950 border ${c.border} rounded-lg p-4 flex flex-col items-center justify-center text-center transition hover:bg-gray-900`}
        >
          <div className={`text-3xl mb-2 ${c.color}`}>{c.icon}</div>
          <p className="text-sm text-gray-400">{c.label}</p>
          <p className={`text-xl font-semibold mt-1 ${c.color}`}>
            {c.value.toLocaleString("vi-VN")}
          </p>
        </div>
      ))}
    </div>
  );
}
