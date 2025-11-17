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
  image_url?: string | null;
  images: string[] | null;
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

// Tour Detail type
export type TourDetail = {
  destination: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  available_slots: number;
  guide_name: string | null;
  itinerary: Record<string, string> | null;
};

// Stay Detail type
export type StayDetail = {
  accommodation_type: string;
  max_guests: number;
  number_of_rooms: number;
  number_of_beds: number;
  price_per_night: number | null;
};

// Accommodation types
export const ACCOMMODATION_TYPES = [
  { value: "hotel", label: "Khách sạn" },
  { value: "resort", label: "Resort" },
  { value: "homestay", label: "Homestay" },
  { value: "apartment", label: "Căn hộ" },
  { value: "villa", label: "Biệt thự" },
  { value: "hostel", label: "Nhà trọ" },
  { value: "guesthouse", label: "Nhà nghỉ" },
  { value: "boutique_hotel", label: "Boutique Hotel" },
  { value: "bungalow", label: "Bungalow" },
  { value: "cabin", label: "Cabin" },
];

// Car Detail type
export type CarDetail = {
  route: string;
  departure_location: string;
  arrival_location: string;
  seats: number;
  vehicle_type: string;
  departure_time: string | null;
  arrival_time: string | null;
  duration_hours: number | null;
};

// Vehicle types
export const VEHICLE_TYPES = [
  { value: "sleeper_bus", label: "Xe khách giường nằm" },
  { value: "limousine_cabin", label: "Limousine cabin riêng" },
  { value: "limousine", label: "Limousine" },
  { value: "seat_bus", label: "Xe khách ghế ngồi" },
  { value: "private_charter", label: "Xe riêng đưa đón tận nơi" },
];

// Popular locations
export const POPULAR_LOCATIONS = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Hạ Long",
  "Ninh Bình",
  "Sapa",
  "Huế",
  "Hội An",
  "Nha Trang",
  "Đà Lạt",
  "Vũng Tàu",
  "Cần Thơ",
  "Phú Quốc",
];

// Motorbike Detail type
export type MotorbikeDetail = {
  brand: string;
  model: string;
  engine_size: number;
  bike_type: string;
  year: number;
};

// Bike types
export const BIKE_TYPES = [
  { value: "", label: "Tất cả loại" },
  { value: "scooter", label: "Xe tay ga" },
  { value: "manual", label: "Xe số" },
  { value: "clutch", label: "Xe côn tay" },
  { value: "adventure", label: "Xe chuyên đi phượt xa" },
  { value: "electric", label: "Xe điện" },
];

// Popular brands
export const POPULAR_BRANDS = [
  "Honda",
  "Yamaha",
  "Suzuki",
  "Kawasaki",
  "Piaggio",
  "SYM",
  "Vespa",
  "Ducati",
  "BMW",
  "Harley-Davidson",
];

// ApproveForm type
export type ApproveForm = {
  title: string;
  description: string;
  type: string;
  location: string;
  price: string;
  images: string[];
  amenities: string;
  owner_name: string;
  phone: string;
  email: string;
  facebook: string;
  zalo: string;
  tiktok: string;
  instagram: string;
};

// ===== THÊM MỚI: Types cho PendingForm =====

/**
 * Form data cho việc thêm dịch vụ mới (chờ duyệt)
 */
export type PendingFormData = {
  title: string;
  type: string;
  description: string;
  location: string;
  price: string;
  images: string[];
  owner_name: string;
  phone: string;
  email: string;
  facebook: string;
  zalo: string;
  tiktok: string;
  instagram: string;
  amenities: string;
  source: string;
};

/**
 * Props cho PendingForm component
 */
export type PendingFormProps = {
  onSubmit: (form: PendingFormData, avatarFile: File | null, additionalFiles: File[]) => Promise<void>;
  loading: boolean;
};

// Pending services chỉ hỗ trợ 3 loại dịch vụ
export const PENDING_SERVICE_TYPES = [
  { value: "stay", label: "Lưu trú (Stay)" },
  { value: "car", label: "Thuê xe hơi (Car)" },
  { value: "motorbike", label: "Thuê xe máy (Motorbike)" },
  { value: "tour", label: "Tour du lịch (Tour)" },
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
  { value: "draft", label: "Mới" },
  { value: "pending", label: "Đang xem xét" },
  { value: "rejeted", label: "Bị từ chối" },
  { value: "approved", label: "Đã xác nhận" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
  { value: "archived", label: "Lưu trữ" },
];

export const PENDING_STATUSES = [
  { value: "draft", label: "Mới" },
  { value: "pending", label: "Đang xem xét" },
  { value: "rejeted", label: "Bị từ chối" },
  { value: "approved", label: "Đã xác nhận" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
  { value: "archived", label: "Lưu trữ" },
];