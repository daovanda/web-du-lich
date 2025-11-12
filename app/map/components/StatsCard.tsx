type StatsCardProps = {
  visitedCount: number;
  total: number;
  percent: string;
  visitedProvinceIds: string[];
};

export default function StatsCard({ visitedCount, total, percent, visitedProvinceIds }: StatsCardProps) {
  const percentNum = parseFloat(percent);
  
  // Constants
  const TOTAL_PROVINCES = 63;
  const TOTAL_ARCHIPELAGOS = 2;
  
  // Count provinces (1-63) and archipelagos (64-65) separately based on actual IDs
  const provinceCount = visitedProvinceIds.filter(id => {
    const num = parseInt(id.replace("province-", ""));
    return num >= 1 && num <= 63;
  }).length;
  
  const archipelagoCount = visitedProvinceIds.filter(id => {
    const num = parseInt(id.replace("province-", ""));
    return num === 64 || num === 65;
  }).length;
  
  // 🎨 Gradient based on completion percentage
  const getGradient = () => {
    if (percentNum >= 75) return "from-green-500 to-emerald-500";
    if (percentNum >= 50) return "from-blue-500 to-cyan-500";
    if (percentNum >= 25) return "from-yellow-500 to-orange-500";
    return "from-neutral-500 to-neutral-600";
  };

  const getMilestone = () => {
    if (percentNum === 100) return { emoji: "🎉", text: "Hoàn thành!", color: "text-green-400" };
    if (percentNum >= 75) return { emoji: "🔥", text: "Sắp xong rồi!", color: "text-orange-400" };
    if (percentNum >= 50) return { emoji: "💪", text: "Hơn nửa chặng!", color: "text-blue-400" };
    if (percentNum >= 25) return { emoji: "🚀", text: "Khởi đầu tốt!", color: "text-purple-400" };
    if (visitedCount > 0) return { emoji: "✨", text: "Bắt đầu nào!", color: "text-yellow-400" };
    return { emoji: "🗺️", text: "Hãy bắt đầu!", color: "text-neutral-500" };
  };

  const milestone = getMilestone();

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden">
      {/* 📊 Header */}
      <div className="p-6 space-y-4">
        {/* Stats Display */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-bold text-white">{visitedCount}</span>
            <span className="text-2xl text-neutral-600">/</span>
            <span className="text-2xl text-neutral-500">{total}</span>
          </div>
          
          {/* Province & Archipelago Breakdown */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="text-neutral-400">
              <span className="font-semibold text-white">{provinceCount}</span>
              <span className="text-neutral-600"> / {TOTAL_PROVINCES}</span>
              <span className="text-neutral-500 ml-1">tỉnh thành</span>
            </div>
            <div className="w-px h-4 bg-neutral-700"></div>
            <div className="text-neutral-400">
              <span className="font-semibold text-white">{archipelagoCount}</span>
              <span className="text-neutral-600"> / {TOTAL_ARCHIPELAGOS}</span>
              <span className="text-neutral-500 ml-1">quần đảo</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-600">Tiến độ</span>
            <span className="font-semibold text-white">{percent}%</span>
          </div>
          
          <div className="relative w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getGradient()} transition-all duration-500 ease-out rounded-full`}
              style={{ width: `${percent}%` }}
            >
              {/* ✨ Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Milestone Badge */}
        {visitedCount > 0 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-2xl">{milestone.emoji}</span>
            <span className={`text-sm font-semibold ${milestone.color}`}>
              {milestone.text}
            </span>
          </div>
        )}
      </div>

      {/* 🎯 Quick Stats Grid */}
      <div className="grid grid-cols-3 border-t border-neutral-800">
        {/* Remaining */}
        <div className="p-4 text-center border-r border-neutral-800">
          <div className="text-2xl font-bold text-neutral-400">{total - visitedCount}</div>
          <div className="text-xs text-neutral-600 mt-1">Còn lại</div>
        </div>

        {/* Percentage */}
        <div className="p-4 text-center border-r border-neutral-800">
          <div className={`text-2xl font-bold bg-gradient-to-r ${getGradient()} bg-clip-text text-transparent`}>
            {percent}%
          </div>
          <div className="text-xs text-neutral-600 mt-1">Hoàn thành</div>
        </div>

        {/* Region badge */}
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {visitedCount >= 33 ? "🏆" : visitedCount >= 16 ? "🥈" : visitedCount >= 8 ? "🥉" : "⭐"}
          </div>
          <div className="text-xs text-neutral-600 mt-1">
            {visitedCount >= 33 ? "Explorer" : visitedCount >= 16 ? "Traveler" : visitedCount >= 8 ? "Wanderer" : "Starter"}
          </div>
        </div>
      </div>

      {/* ✨ Custom CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}