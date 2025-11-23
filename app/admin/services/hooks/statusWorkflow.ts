// statusWorkflow.ts - NEW FILE
// ✅ Status workflow với State Machine pattern

export type ServiceStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'active' 
  | 'inactive' 
  | 'archived';

type StatusConfig = {
  label: string;
  description: string;
  canTransitionTo: ServiceStatus[];
  color: string;
  icon: string;
  isTerminal: boolean;
  requiresReason?: boolean;
  requiresApprover?: boolean;
};

export type StatusTransition = {
  from: ServiceStatus;
  to: ServiceStatus;
  requiresReason?: boolean;
  requiresApprover?: boolean;
};

/**
 * ✅ STATE MACHINE định nghĩa rõ ràng workflow
 */
export const SERVICE_STATUS_MACHINE: Record<ServiceStatus, StatusConfig> = {
  draft: {
    label: "Bản nháp",
    description: "Dịch vụ mới tạo, chưa gửi duyệt",
    canTransitionTo: ["pending"],
    color: "gray",
    icon: "📝",
    isTerminal: false,
  },
  pending: {
    label: "Chờ duyệt",
    description: "Đang chờ admin xem xét",
    canTransitionTo: ["approved", "rejected", "draft"],
    color: "amber",
    icon: "⏳",
    isTerminal: false,
  },
  approved: {
    label: "Đã duyệt",
    description: "Admin đã phê duyệt, sẵn sàng kích hoạt",
    canTransitionTo: ["active", "rejected"],
    color: "green",
    icon: "✅",
    isTerminal: false,
  },
  rejected: {
    label: "Bị từ chối",
    description: "Admin đã từ chối dịch vụ này",
    canTransitionTo: ["draft"],
    color: "red",
    icon: "❌",
    isTerminal: false,
    requiresReason: true,
  },
  active: {
    label: "Đang hoạt động",
    description: "Dịch vụ đang hiển thị công khai",
    canTransitionTo: ["inactive", "archived"],
    color: "blue",
    icon: "🟢",
    isTerminal: false,
  },
  inactive: {
    label: "Tạm dừng",
    description: "Dịch vụ bị tạm dừng, không hiển thị",
    canTransitionTo: ["active", "archived"],
    color: "orange",
    icon: "⏸️",
    isTerminal: false,
  },
  archived: {
    label: "Lưu trữ",
    description: "Dịch vụ đã được lưu trữ",
    canTransitionTo: [],
    color: "gray",
    icon: "📦",
    isTerminal: true,
  }
} as const;

/**
 * ✅ Check if status transition is allowed
 */
export function canTransitionStatus(
  currentStatus: ServiceStatus,
  targetStatus: ServiceStatus
): boolean {
  const currentState = SERVICE_STATUS_MACHINE[currentStatus];
  if (!currentState) return false;
  
  return currentState.canTransitionTo.includes(targetStatus);
}

/**
 * ✅ Get all allowed transitions from current status
 */
export function getAllowedTransitions(currentStatus: ServiceStatus): ServiceStatus[] {
  const currentState = SERVICE_STATUS_MACHINE[currentStatus];
  if (!currentState) return [];
  
  return currentState.canTransitionTo;
}

/**
 * ✅ Check if reason is required for transition
 */
export function isReasonRequired(targetStatus: ServiceStatus): boolean {
  const state = SERVICE_STATUS_MACHINE[targetStatus];
  return state?.requiresReason === true;
}

/**
 * ✅ Validate status transition with detailed error
 */
export function validateStatusTransition(
  currentStatus: ServiceStatus,
  targetStatus: ServiceStatus,
  reason?: string
): { valid: boolean; error?: string } {
  // Check if current status exists
  if (!SERVICE_STATUS_MACHINE[currentStatus]) {
    return {
      valid: false,
      error: `Trạng thái hiện tại không hợp lệ: ${currentStatus}`
    };
  }

  // Check if target status exists
  if (!SERVICE_STATUS_MACHINE[targetStatus]) {
    return {
      valid: false,
      error: `Trạng thái đích không hợp lệ: ${targetStatus}`
    };
  }

  // Check if same status
  if (currentStatus === targetStatus) {
    return {
      valid: false,
      error: 'Không thể chuyển sang cùng trạng thái'
    };
  }

  // Check if transition is allowed
  if (!canTransitionStatus(currentStatus, targetStatus)) {
    const allowed = getAllowedTransitions(currentStatus);
    return {
      valid: false,
      error: `Không thể chuyển từ "${SERVICE_STATUS_MACHINE[currentStatus].label}" sang "${SERVICE_STATUS_MACHINE[targetStatus].label}". Chỉ có thể chuyển sang: ${allowed.map(s => SERVICE_STATUS_MACHINE[s].label).join(', ')}`
    };
  }

  // Check if reason is required
  if (isReasonRequired(targetStatus) && (!reason || reason.trim() === '')) {
    return {
      valid: false,
      error: `Lý do là bắt buộc khi chuyển sang trạng thái "${SERVICE_STATUS_MACHINE[targetStatus].label}"`
    };
  }

  return { valid: true };
}

/**
 * ✅ Get status badge info for UI
 */
export function getStatusBadgeInfo(status: ServiceStatus) {
  const state = SERVICE_STATUS_MACHINE[status];
  if (!state) {
    return {
      label: status,
      color: 'gray',
      icon: '❓',
      className: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
  }

  const colorClasses = {
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  return {
    label: state.label,
    description: state.description,
    color: state.color,
    icon: state.icon,
    className: colorClasses[state.color as keyof typeof colorClasses],
    isTerminal: state.isTerminal
  };
}

/**
 * ✅ Get next logical status (for quick actions)
 */
export function getNextLogicalStatus(currentStatus: ServiceStatus): ServiceStatus | null {
  const transitions = getAllowedTransitions(currentStatus);
  if (transitions.length === 0) return null;
  
  // Prefer the "forward" progression
  const preferredOrder: ServiceStatus[] = ['pending', 'approved', 'active'];
  
  for (const preferred of preferredOrder) {
    if (transitions.includes(preferred)) {
      return preferred;
    }
  }
  
  // Return first available transition
  return transitions[0];
}

/**
 * ✅ Check if status is in pending stage (for grouping)
 */
export function isPendingStatus(status: ServiceStatus): boolean {
  return ['draft', 'pending', 'approved', 'rejected'].includes(status);
}

/**
 * ✅ Check if status is active (for grouping)
 */
export function isActiveStatus(status: ServiceStatus): boolean {
  return ['active', 'inactive', 'archived'].includes(status);
}

/**
 * ✅ Get status workflow diagram (for documentation)
 */
export function getStatusWorkflowDiagram(): string {
  return `
Status Workflow:

draft ──────> pending ──────> approved ──────> active
   ↑              |               |               |
   |              ↓               ↓               ↓
   └───────── rejected      (rejected)      inactive
                                                  |
                                                  ↓
                                              archived
                                              
Notes:
- draft: Initial state for new services
- pending: Waiting for admin review
- approved: Admin approved, ready to activate
- rejected: Admin rejected, can return to draft
- active: Public and visible to users
- inactive: Temporarily disabled
- archived: Permanently archived (terminal)
  `;
}