import { CreditCard, Clock, CheckCircle, PartyPopper, Check } from "lucide-react";

type PaymentProgressProps = {
  currentStep: number;
};

export default function PaymentProgress({ currentStep }: PaymentProgressProps) {
  const steps = [
    { number: 1, label: "Đặt cọc", icon: CreditCard },
    { number: 2, label: "Xác nhận", icon: Clock },
    { number: 3, label: "Thanh toán", icon: CreditCard },
    { number: 4, label: "Xác nhận", icon: CheckCircle },
    { number: 5, label: "Hoàn thành", icon: PartyPopper },
  ];

  return (
    <div className="py-6">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out relative"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            >
              {/* Animated glow */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </div>
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const isPending = currentStep < step.number;

            return (
              <div key={step.number} className="flex flex-col items-center flex-1 relative z-10">
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
                    isCompleted
                      ? "bg-gradient-to-br from-green-500 to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                      : isCurrent
                      ? "bg-gradient-to-br from-blue-500 to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-110"
                      : "bg-neutral-900 border border-neutral-700"
                  }`}
                >
                  {isCompleted ? (
                    <Check size={18} className="text-white" strokeWidth={3} />
                  ) : (
                    <Icon 
                      size={18} 
                      className={isCurrent ? "text-white" : "text-neutral-600"}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-medium text-center transition-colors duration-300 ${
                    isCurrent 
                      ? "text-white" 
                      : isCompleted 
                      ? "text-green-400" 
                      : "text-neutral-600"
                  }`}
                >
                  {step.label}
                </span>

                {/* Step number badge */}
                <span
                  className={`text-[10px] mt-1 transition-colors duration-300 ${
                    isCurrent 
                      ? "text-neutral-400" 
                      : isCompleted 
                      ? "text-neutral-500" 
                      : "text-neutral-700"
                  }`}
                >
                  Bước {step.number}
                </span>

                {/* Pulse animation for current step */}
                {isCurrent && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 animate-ping" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isPending = currentStep < step.number;

          return (
            <div
              key={step.number}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                isCurrent
                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30"
                  : isCompleted
                  ? "bg-green-500/5 border border-green-500/20"
                  : "bg-neutral-900/50 border border-neutral-800"
              }`}
            >
              {/* Icon Circle */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted
                    ? "bg-gradient-to-br from-green-500 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : isCurrent
                    ? "bg-gradient-to-br from-blue-500 to-purple-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    : "bg-neutral-900 border border-neutral-700"
                }`}
              >
                {isCompleted ? (
                  <Check size={18} className="text-white" strokeWidth={3} />
                ) : (
                  <Icon 
                    size={18} 
                    className={isCurrent ? "text-white" : "text-neutral-600"}
                  />
                )}
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-sm font-semibold transition-colors duration-300 ${
                      isCurrent 
                        ? "text-white" 
                        : isCompleted 
                        ? "text-green-400" 
                        : "text-neutral-500"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                      Đang xử lý
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                      Hoàn thành
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-600">Bước {step.number}/5</span>
              </div>

              {/* Status Indicator */}
              {isCurrent && (
                <div className="flex-shrink-0">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              )}
              {isCompleted && (
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}