export function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`p-6 rounded-xl bg-gradient-to-r ${color} text-white shadow-lg`}>
      <p className="text-sm uppercase opacity-90">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
