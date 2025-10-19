export type PendingService = {
  id: string;
  title: string;
  type: string;
  description: string | null;
  location: string | null;
  price: string | null;
  image_url?: string | null; 
  images: string[] | null;
  status: string;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  facebook: string | null;
  zalo: string | null;
  tiktok: string | null;
  instagram: string | null;
  admin_id?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejected_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  source?: string | null;
  amenities?: any[] | null;
};

export type Service = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  location: string | null;
  price: string | null;
  image_url?: string | null; // Ảnh đại diện
  images: string[] | null; // Mảng ảnh phụ
  amenities: any[] | null;
  average_rating?: number | null;
  reviews_count?: number | null;
  owner_id?: string | null;
  status?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  max_capacity?: number | null;
  contact_info?: any | null;
  tags?: string[] | null;
  
  // Contact info
  owner_name?: string | null;
  phone?: string | null;
  email?: string | null;
  facebook?: string | null;
  zalo?: string | null;
  tiktok?: string | null;
  instagram?: string | null;
  address?: string | null;
};

// Pending services chỉ hỗ trợ 3 loại dịch vụ
export const PENDING_SERVICE_TYPES = [
  { value: "stay", label: "Lưu trú (Stay)" },
  { value: "car", label: "Thuê xe hơi (Car)" },
  { value: "motorbike", label: "Thuê xe máy (Motorbike)" },
];

// Official services hỗ trợ 4 loại dịch vụ
export const SERVICE_TYPES = [
  { value: "stay", label: "Lưu trú (Stay)" },
  { value: "car", label: "Thuê xe hơi (Car)" },
  { value: "motorbike", label: "Thuê xe máy (Motorbike)" },
  { value: "tour", label: "Tour du lịch (Tour)" },
];

export const SERVICE_SOURCES = [
  { value: "form", label: "Form đăng ký" },
  { value: "referral", label: "Giới thiệu" },
  { value: "import", label: "Nhập từ hệ thống khác" },
];

export const SERVICE_STATUSES = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
  { value: "archived", label: "Lưu trữ" },
];

export const PENDING_STATUSES = [
  { value: "new", label: "Mới" },
  { value: "pending", label: "Đang xem xét" },
  { value: "confirmed", label: "Đã xác nhận" },
];