type StatsCardProps = {
  visitedCount: number;
  total: number;
  percent: string;
};

export default function StatsCard({ visitedCount, total, percent }: StatsCardProps) {
  return (
    <div className="border border-gray-700 rounded-2xl p-6 text-center bg-black">
      <p className="text-lg font-semibold">
        Bạn đã đi được <span className="text-white text-2xl">{visitedCount}</span> / {total} tỉnh thành
      </p>
      <p className="text-sm text-gray-500 mt-1">
        Hoàn thành <span className="text-white">{percent}%</span> hành trình
      </p>
    </div>
  );
}
