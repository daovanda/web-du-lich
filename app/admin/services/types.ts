// types.ts
export type PendingService = {
  id: string;
  title: string;
  type: string;
  description: string | null;
  location: string | null;
  price: string | null;
  images: string[] | null;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  facebook: string | null;
  zalo: string | null;
  tiktok: string | null;
  instagram: string | null;
  status: string;
  admin_id?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejected_reason?: string | null;
  created_at?: string | null;
};

export type Service = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  location: string | null;
  price: string | null;
  amenities: any[] | null;
  images: string[] | null;
  average_rating?: number | null;
  reviews_count?: number | null;
  owner_id?: string | null;
  status?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at?: string | null;

  owner_name?: string | null;
  phone?: string | null;
  email?: string | null;
  facebook?: string | null;
  zalo?: string | null;
  tiktok?: string | null;
  instagram?: string | null;
};

export const SERVICE_TYPES = [
  { value: "stay", label: "Stay" },
  { value: "car", label: "Car" },
  { value: "motorbike", label: "Motorbike" },
  { value: "tour", label: "Tour" },
  { value: "trekking", label: "Trekking" },
];
