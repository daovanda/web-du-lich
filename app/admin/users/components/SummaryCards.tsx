"use client";

export default function SummaryCards({ summary }: { summary: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <div className="p-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow">
        <p>Tổng</p>
        <p className="text-2xl font-bold">{summary.total}</p>
      </div>
      <div className="p-6 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow">
        <p>Admin</p>
        <p className="text-2xl font-bold">{summary.admins}</p>
      </div>
      <div className="p-6 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white shadow">
        <p>Partner</p>
        <p className="text-2xl font-bold">{summary.partners}</p>
      </div>
      <div className="p-6 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow">
        <p>User</p>
        <p className="text-2xl font-bold">{summary.normal}</p>
      </div>
    </div>
  );
}
