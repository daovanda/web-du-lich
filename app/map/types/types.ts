// app/map/types/types.ts

export type VisitedProvince = {
  id: string;
  user_id: string;
  province_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProvincePhoto = {
  id: string;
  visited_province_id: string;
  user_id: string;
  image_url: string;
  title: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type VisitedProvinceWithPhotos = VisitedProvince & {
  photos: ProvincePhoto[];
};

export type ToggleProvinceResult = 
  | { success: true; action: 'added'; data: VisitedProvince }
  | { success: true; action: 'removed'; id: string }
  | { success: false; action: 'added' | 'removed'; error: any };