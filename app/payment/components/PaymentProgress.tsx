import { CreditCard, Clock, CheckCircle, PartyPopper, Check } from "lucide-react";

type PaymentProgressProps = {
  currentStep: number;
};

export default function PaymentProgress({ currentStep }: PaymentProgressProps) {
  const steps = [
    { number: 1, label: "Đặt cọc", icon: CreditCard },
    { number: 2, label: "Xác nhận cọc", icon: Clock },
    { number: 3, label: "Thanh toán", icon: CreditCard },
    { number: 4, label: "Xác nhận", icon: CheckCircle },
    { number: 5, label: "Hoàn thành", icon: PartyPopper },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-white/10 -z-10">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div key={step.number} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-blue-500 text-white ring-4 ring-blue-500/30"
                    : "bg-white/10 text-gray-400"
                }`}
              >
                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
              </div>
              <span
                className={`text-xs text-center ${
                  isCurrent ? "text-white font-semibold" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}