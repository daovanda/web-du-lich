// app/service-history/utils/constants.ts

export const PREDEFINED_CANCEL_REASONS = [
  "Thay đổi kế hoạch du lịch",
  "Tìm được dịch vụ phù hợp hơn",
  "Lý do cá nhân"
];

export const PROCESS_STATUS_PRIORITY: { [key: string]: number } = {
  'active': 0,
  'cancelled': 1
};

export const PROCESS_STATUS_CONFIG = {
  'active': {
    label: 'Dịch vụ của tôi',
    color: 'bg-emerald-600'
  },
  'cancelled': {
    label: 'Đã hủy',
    color: 'bg-rose-600'
  }
};

export type ProcessStatus = 'active' | 'cancelled';
export type PaymentStep = 
  | 'need_deposit' 
  | 'waiting_deposit_confirm' 
  | 'need_full_payment' 
  | 'waiting_payment_confirm' 
  | 'waiting_admin_confirm' 
  | 'completed' 
  | 'cancelled' 
  | 'unknown';